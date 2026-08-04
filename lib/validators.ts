import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({ example: 1, description: "Page number" }),
  limit: z.coerce.number().int().positive().max(100).default(20).openapi({ example: 20, description: "Items per page" }),
});

export const playersQuerySchema = paginationSchema.extend({
  role: z.string().optional().openapi({ example: "bat", description: "Filter by role (e.g. bat, bowl, all-rounder)" }),
  country: z.string().optional().openapi({ example: "in", description: "Filter by country code (e.g. in)" }),
  search: z.string().optional().openapi({ example: "Kohli", description: "Search player by title/name" }),
});

export const matchesQuerySchema = paginationSchema.extend({
  teamId: z.coerce.number().int().positive().optional().openapi({ example: 610, description: "Filter matches involving team ID" }),
  startDate: z.string().optional().openapi({ example: "2022-03-26", description: "Start date (YYYY-MM-DD)" }),
  endDate: z.string().optional().openapi({ example: "2022-05-29", description: "End date (YYYY-MM-DD)" }),
});

export const battingLeadersQuerySchema = paginationSchema.extend({
  metric: z
    .enum(["runs", "average", "strikeRate", "fours", "sixes"])
    .default("runs")
    .openapi({ example: "runs", description: "Aggregation sorting metric" }),
});

export const bowlingLeadersQuerySchema = paginationSchema.extend({
  metric: z
    .enum(["wickets", "economy", "strikeRate", "maidens"])
    .default("wickets")
    .openapi({ example: "wickets", description: "Aggregation sorting metric" }),
});
