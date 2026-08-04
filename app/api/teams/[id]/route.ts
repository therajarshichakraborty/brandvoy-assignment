import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamId = parseInt(id, 10);

    if (isNaN(teamId)) {
      return errorResponse("Invalid team ID format", "INVALID_INPUT", 400);
    }

    const teamRecord = await db.query.teams.findFirst({
      where: eq(teams.tid, teamId),
    });

    if (!teamRecord) {
      return errorResponse("Team not found", "NOT_FOUND", 404);
    }

    return successResponse(teamRecord);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch team",
      "SERVER_ERROR",
      500
    );
  }
}
