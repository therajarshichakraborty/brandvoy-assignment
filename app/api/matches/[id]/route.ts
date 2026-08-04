import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
