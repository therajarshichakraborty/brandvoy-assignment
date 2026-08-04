import { NextRequest } from "next/server";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { paginationSchema } from "@/lib/validators";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: List all IPL teams with pagination
 *     tags:
 *       - Teams
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
 *     responses:
 *       200:
 *         description: Paginated list of IPL teams
 *       400:
 *         description: Invalid pagination parameters
 */
import { initDbIfNeeded } from "@/db/init";

export async function GET(request: NextRequest) {
  try {
    await initDbIfNeeded();
    const { searchParams } = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid pagination parameters", "INVALID_INPUT", 400);
    }
    
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const totalCountResult = await db.select({ value: count() }).from(teams);
    const total = totalCountResult[0]?.value ?? 0;

    const teamList = await db
      .select()
      .from(teams)
      .limit(limit)
      .offset(offset);

    return successResponse(teamList, {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch teams",
      "SERVER_ERROR",
      500
    );
  }
}
