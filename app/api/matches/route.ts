import { NextRequest } from "next/server";
import { count, eq, or, gte, lte, and, SQL } from "drizzle-orm";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { matchesQuerySchema } from "@/lib/validators";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = matchesQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      teamId: searchParams.get("teamId") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse("Invalid query parameters", "INVALID_INPUT", 400);
    }

    const { page, limit, teamId, startDate, endDate } = parsed.data;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (teamId) {
      conditions.push(or(eq(matches.teamAId, teamId), eq(matches.teamBId, teamId))!);
    }
    if (startDate) {
      conditions.push(gte(matches.dateStart, startDate));
    }
    if (endDate) {
      conditions.push(lte(matches.dateStart, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalCountResult = await db
      .select({ value: count() })
      .from(matches)
      .where(whereClause);
    const total = totalCountResult[0]?.value ?? 0;

    const matchList = await db
      .select()
      .from(matches)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return successResponse(matchList, {
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch matches",
      "SERVER_ERROR",
      500
    );
  }
}
