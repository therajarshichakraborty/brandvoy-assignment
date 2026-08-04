import { NextRequest } from "next/server";
import { eq, sum, count } from "drizzle-orm";
import { db } from "@/db";
import { players, battingInningsStats, bowlingInningsStats } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

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

    const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : "0.00";
    const battingInningsCount = Number(bStats?.totalInnings ?? 0);
    const battingAverage = battingInningsCount > 0 ? (totalRuns / battingInningsCount).toFixed(2) : "0.00";
    const bowlingAverage = totalWickets > 0 ? (totalRunsConceded / totalWickets).toFixed(2) : "0.00";

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
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch player details",
      "SERVER_ERROR",
      500
    );
  }
}
