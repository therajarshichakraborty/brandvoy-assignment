import { NextRequest } from "next/server";
import { count, eq, ilike, and, SQL } from "drizzle-orm";
import { db } from "@/db";
import { players } from "@/db/schema";
import { playersQuerySchema } from "@/lib/validators";
import { successResponse, errorResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: List players with pagination and filtering
 *     tags:
 *       - Players
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
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by playing role
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country code
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search player by name
 *     responses:
 *       200:
 *         description: Paginated player list
 *       400:
 *         description: Invalid query parameters
 */
import { initDbIfNeeded } from "@/db/init";

export async function GET(request: NextRequest) {
  try {
    await initDbIfNeeded();
    const { searchParams } = new URL(request.url);
    const parsed = playersQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", "INVALID_INPUT", 400);
    }

    const { page, limit, role, country, search } = parsed.data;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (role) {
      conditions.push(eq(players.playingRole, role));
    }
    if (country) {
      conditions.push(eq(players.country, country));
    }
    if (search) {
      conditions.push(ilike(players.title, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalCountResult = await db
      .select({ value: count() })
      .from(players)
      .where(whereClause);
    const total = totalCountResult[0]?.value ?? 0;

    const playerList = await db
      .select()
      .from(players)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return successResponse(playerList, {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch players",
      "SERVER_ERROR",
      500
    );
  }
}
