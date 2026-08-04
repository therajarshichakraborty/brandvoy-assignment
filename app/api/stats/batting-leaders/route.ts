import { NextRequest } from "next/server";
import { count, sum, eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { players, battingInningsStats } from "@/db/schema";
import { battingLeadersQuerySchema } from "@/lib/validators";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/stats/batting-leaders:
 *   get:
 *     summary: Top batting leaders computed via SQL aggregation
 *     tags:
 *       - Leaderboards
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [runs, average, strikeRate, fours, sixes]
 *           default: runs
 *         description: Sorting metric
 *     responses:
 *       200:
 *         description: Batting leaderboard rankings
 *       400:
 *         description: Invalid query parameters
 */
import { initDbIfNeeded } from "@/db/init";

export async function GET(request: NextRequest) {
  try {
    await initDbIfNeeded();
    const { searchParams } = new URL(request.url);
    const parsed = battingLeadersQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      metric: searchParams.get("metric") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", "INVALID_INPUT", 400);
    }

    const { page, limit, metric } = parsed.data;
    const offset = (page - 1) * limit;

    const totalCountQuery = await db
      .select({ value: count(sql`DISTINCT ${battingInningsStats.playerId}`) })
      .from(battingInningsStats);
    const total = Number(totalCountQuery[0]?.value ?? 0);

    const totalRunsCol = sum(battingInningsStats.runs);
    const totalBallsCol = sum(battingInningsStats.balls);
    const totalFoursCol = sum(battingInningsStats.fours);
    const totalSixesCol = sum(battingInningsStats.sixes);
    const inningsCountCol = count(battingInningsStats.id);

    const averageCol = sql<number>`CASE WHEN COUNT(${battingInningsStats.id}) > 0 THEN SUM(${battingInningsStats.runs})::float / COUNT(${battingInningsStats.id}) ELSE 0 END`;
    const strikeRateCol = sql<number>`CASE WHEN SUM(${battingInningsStats.balls}) > 0 THEN (SUM(${battingInningsStats.runs})::float / SUM(${battingInningsStats.balls})) * 100 ELSE 0 END`;

    let orderByCol = desc(totalRunsCol);
    if (metric === "average") {
      orderByCol = desc(averageCol);
    } else if (metric === "strikeRate") {
      orderByCol = desc(strikeRateCol);
    } else if (metric === "fours") {
      orderByCol = desc(totalFoursCol);
    } else if (metric === "sixes") {
      orderByCol = desc(totalSixesCol);
    }

    const leaders = await db
      .select({
        playerId: battingInningsStats.playerId,
        playerTitle: players.title,
        playerShortName: players.shortName,
        country: players.country,
        totalInnings: inningsCountCol,
        totalRuns: totalRunsCol,
        totalBalls: totalBallsCol,
        totalFours: totalFoursCol,
        totalSixes: totalSixesCol,
        average: averageCol,
        strikeRate: strikeRateCol,
      })
      .from(battingInningsStats)
      .innerJoin(players, eq(battingInningsStats.playerId, players.pid))
      .groupBy(battingInningsStats.playerId, players.title, players.shortName, players.country)
      .orderBy(orderByCol)
      .limit(limit)
      .offset(offset);

    const formattedLeaders = leaders.map((item) => ({
      ...item,
      totalRuns: Number(item.totalRuns ?? 0),
      totalBalls: Number(item.totalBalls ?? 0),
      totalFours: Number(item.totalFours ?? 0),
      totalSixes: Number(item.totalSixes ?? 0),
      average: Number(item.average ?? 0).toFixed(2),
      strikeRate: Number(item.strikeRate ?? 0).toFixed(2),
    }));

    return successResponse(formattedLeaders, {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch batting leaders",
      "SERVER_ERROR",
      500
    );
  }
}
