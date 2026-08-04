import { NextRequest } from "next/server";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { paginationSchema } from "@/lib/validators";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
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
