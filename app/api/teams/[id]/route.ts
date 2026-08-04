import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get specific team details by ID
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID (tid)
 *     responses:
 *       200:
 *         description: Team record details
 *       404:
 *         description: Team not found
 */
import { initDbIfNeeded } from "@/db/init";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDbIfNeeded();
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
