import { NextRequest } from "next/server";
import { count, sum, eq, desc, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { players, bowlingInningsStats } from "@/db/schema";
import { bowlingLeadersQuerySchema } from "@/lib/validators";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/stats/bowling-leaders:
 *   get:
 *     summary: Top bowling leaders computed via SQL aggregation
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
 *           enum: [wickets, economy, strikeRate, maidens]
 *           default: wickets
 *         description: Sorting metric
 *     responses:
 *       200:
 *         description: Bowling leaderboard rankings
 *       400:
 *         description: Invalid query parameters
 */
import { initDbIfNeeded } from "@/db/init";

export async function GET(request: NextRequest) {
  try {
    await initDbIfNeeded();
    const { searchParams } = new URL(request.url);
    const parsed = bowlingLeadersQuerySchema.safeParse({
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
      .select({ value: count(sql`DISTINCT ${bowlingInningsStats.playerId}`) })
      .from(bowlingInningsStats);
    const total = Number(totalCountQuery[0]?.value ?? 0);

    const totalWicketsCol = sum(bowlingInningsStats.wickets);
    const totalRunsConcededCol = sum(bowlingInningsStats.runsConceded);
    const totalMaidensCol = sum(bowlingInningsStats.maidens);
    const totalOversCol = sum(bowlingInningsStats.overs);
    const inningsCountCol = count(bowlingInningsStats.id);

    const economyCol = sql<number>`CASE WHEN SUM(${bowlingInningsStats.overs}) > 0 THEN SUM(${bowlingInningsStats.runsConceded})::float / SUM(${bowlingInningsStats.overs}) ELSE 0 END`;
    const strikeRateCol = sql<number>`CASE WHEN SUM(${bowlingInningsStats.wickets}) > 0 THEN (SUM(${bowlingInningsStats.overs}) * 6)::float / SUM(${bowlingInningsStats.wickets}) ELSE 0 END`;

    let orderByCol = desc(totalWicketsCol);
    if (metric === "economy") {
      orderByCol = asc(economyCol);
    } else if (metric === "strikeRate") {
      orderByCol = asc(strikeRateCol);
    } else if (metric === "maidens") {
      orderByCol = desc(totalMaidensCol);
    }

    const leaders = await db
      .select({
        playerId: bowlingInningsStats.playerId,
        playerTitle: players.title,
        playerShortName: players.shortName,
        country: players.country,
        totalInnings: inningsCountCol,
        totalWickets: totalWicketsCol,
        totalRunsConceded: totalRunsConcededCol,
        totalOvers: totalOversCol,
        totalMaidens: totalMaidensCol,
        economy: economyCol,
        strikeRate: strikeRateCol,
      })
      .from(bowlingInningsStats)
      .innerJoin(players, eq(bowlingInningsStats.playerId, players.pid))
      .groupBy(bowlingInningsStats.playerId, players.title, players.shortName, players.country)
      .orderBy(orderByCol)
      .limit(limit)
      .offset(offset);

    const formattedLeaders = leaders.map((item) => ({
      ...item,
      totalWickets: Number(item.totalWickets ?? 0),
      totalRunsConceded: Number(item.totalRunsConceded ?? 0),
      totalOvers: Number(item.totalOvers ?? 0).toFixed(1),
      totalMaidens: Number(item.totalMaidens ?? 0),
      economy: Number(item.economy ?? 0).toFixed(2),
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
      error instanceof Error ? error.message : "Failed to fetch bowling leaders",
      "SERVER_ERROR",
      500
    );
  }
}
