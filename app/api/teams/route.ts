import { NextRequest } from "next/server";
import { count, ilike, or, and, SQL } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { teamsQuerySchema } from "@/lib/validators";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: List all IPL teams with pagination and search
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search team by title or abbreviation
 *     responses:
 *       200:
 *         description: Paginated list of IPL teams
 *       400:
 *         description: Invalid query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = teamsQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", "INVALID_INPUT", 400);
    }
    
    const { page, limit, search } = parsed.data;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(
        or(
          ilike(teams.title, `%${search}%`),
          ilike(teams.abbr, `%${search}%`),
          ilike(teams.altName, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalCountResult = await db
      .select({ value: count() })
      .from(teams)
      .where(whereClause);
    const total = totalCountResult[0]?.value ?? 0;

    const teamList = await db
      .select()
      .from(teams)
      .where(whereClause)
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
