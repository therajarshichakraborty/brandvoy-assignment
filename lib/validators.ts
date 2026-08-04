import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const playersQuerySchema = paginationSchema.extend({
  teamId: z.coerce.number().int().positive().optional(),
  role: z.string().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
});

export const matchesQuerySchema = paginationSchema.extend({
  teamId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const battingLeadersQuerySchema = paginationSchema.extend({
  metric: z
    .enum(["runs", "average", "strikeRate", "fours", "sixes"])
    .default("runs"),
});

export const bowlingLeadersQuerySchema = paginationSchema.extend({
  metric: z
    .enum(["wickets", "economy", "strikeRate", "maidens"])
    .default("wickets"),
});
