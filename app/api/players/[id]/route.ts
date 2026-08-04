import { NextRequest } from "next/server";
import { eq, sum, count, sql } from "drizzle-orm";
import { db } from "@/db";
import { players, battingInningsStats, bowlingInningsStats } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get player profile with computed career statistics
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Player ID (pid)
 *     responses:
 *       200:
 *         description: Player profile and aggregated career statistics
 *       404:
 *         description: Player not found
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);

    if (isNaN(playerId)) {
      return errorResponse("Invalid player ID format", "INVALID_INPUT", 400);
    }

    const playerRecord = await db.query.players.findFirst({
      where: eq(players.pid, playerId),
    });

    if (!playerRecord) {
      return errorResponse("Player not found", "NOT_FOUND", 404);
    }

    const battingStatsResult = await db
      .select({
        totalInnings: count(battingInningsStats.id),
        totalRuns: sum(battingInningsStats.runs),
        totalBalls: sum(battingInningsStats.balls),
        totalFours: sum(battingInningsStats.fours),
        totalSixes: sum(battingInningsStats.sixes),
        totalDismissals: sum(
          sql<number>`CASE WHEN LOWER(COALESCE(${battingInningsStats.howOut}, '')) LIKE '%not out%' OR LOWER(COALESCE(${battingInningsStats.howOut}, '')) LIKE '%batting%' THEN 0 ELSE 1 END`
        ),
      })
      .from(battingInningsStats)
      .where(eq(battingInningsStats.playerId, playerId));

    const bowlingStatsResult = await db
      .select({
        totalInnings: count(bowlingInningsStats.id),
        totalWickets: sum(bowlingInningsStats.wickets),
        totalRunsConceded: sum(bowlingInningsStats.runsConceded),
        totalMaidens: sum(bowlingInningsStats.maidens),
      })
      .from(bowlingInningsStats)
      .where(eq(bowlingInningsStats.playerId, playerId));

    const bStats = battingStatsResult[0];
    const bwStats = bowlingStatsResult[0];

    const totalRuns = Number(bStats?.totalRuns ?? 0);
    const totalBalls = Number(bStats?.totalBalls ?? 0);
    const totalWickets = Number(bwStats?.totalWickets ?? 0);
    const totalRunsConceded = Number(bwStats?.totalRunsConceded ?? 0);
    const dismissalsCount = Number(bStats?.totalDismissals ?? 0);

    const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : "0.00";
    const battingInningsCount = Number(bStats?.totalInnings ?? 0);
    const battingAverage = dismissalsCount > 0 ? (totalRuns / dismissalsCount).toFixed(2) : totalRuns > 0 ? totalRuns.toFixed(2) : "0.00";
    const bowlingAverage = totalWickets > 0 ? (totalRunsConceded / totalWickets).toFixed(2) : "0.00";

    let lifetimeStats: Record<string, unknown> | null = (playerRecord.lifetimeStats as Record<string, unknown> | null) ?? null;
    if (!lifetimeStats) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const statsDir = path.join(process.cwd(), "data", "player_career_stats");
        if (fs.existsSync(statsDir)) {
          const files = fs.readdirSync(statsDir);
          const playerFile = files.find((f) => f.endsWith(`_${playerId}_stats.json`));
          if (playerFile) {
            const rawContent = fs.readFileSync(path.join(statsDir, playerFile), "utf-8");
            lifetimeStats = JSON.parse(rawContent);
          }
        }
      } catch {}
    }

    return successResponse({
      player: playerRecord,
      careerStats: {
        batting: {
          innings: battingInningsCount,
          runs: totalRuns,
          balls: totalBalls,
          fours: Number(bStats?.totalFours ?? 0),
          sixes: Number(bStats?.totalSixes ?? 0),
          average: battingAverage,
          strikeRate: strikeRate,
        },
        bowling: {
          innings: Number(bwStats?.totalInnings ?? 0),
          wickets: totalWickets,
          runsConceded: totalRunsConceded,
          maidens: Number(bwStats?.totalMaidens ?? 0),
          average: bowlingAverage,
        },
      },
      lifetimeStats,
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch player details",
      "SERVER_ERROR",
      500
    );
  }
}
