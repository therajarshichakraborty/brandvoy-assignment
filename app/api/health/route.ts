import { sql } from "drizzle-orm";
import { db } from "@/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return successResponse({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Database connection failed",
      "HEALTH_CHECK_FAILED",
      500
    );
  }
}
