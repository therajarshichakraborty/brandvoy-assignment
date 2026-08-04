import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get detailed scorecard and innings breakdown for a match
 *     tags:
 *       - Matches
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match scorecard breakdown
 *       404:
 *         description: Match not found
 */
import { initDbIfNeeded } from "@/db/init";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDbIfNeeded();
    const { id } = await params;
    const matchId = parseInt(id, 10);

    if (isNaN(matchId)) {
      return errorResponse("Invalid match ID format", "INVALID_INPUT", 400);
    }

    const matchDetail = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
      with: {
        teamA: true,
        teamB: true,
        tossWinner: true,
        winner: true,
        inningsList: {
          with: {
            battingTeam: true,
            bowlingTeam: true,
            battingStatsList: {
              with: {
                player: true,
              },
            },
            bowlingStatsList: {
              with: {
                player: true,
              },
            },
          },
        },
      },
    });

    if (!matchDetail) {
      return errorResponse("Match not found", "NOT_FOUND", 404);
    }

    return successResponse(matchDetail);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch match details",
      "SERVER_ERROR",
      500
    );
  }
}
