import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const matches = pgTable("matches", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  matchNumber: text("match_number"),
  formatStr: text("format_str"),
  statusStr: text("status_str"),
  statusNote: text("status_note"),
  dateStart: text("date_start"),
  dateEnd: text("date_end"),
  venue: text("venue"),
  teamAId: integer("team_a_id").references(() => teams.tid),
  teamBId: integer("team_b_id").references(() => teams.tid),
  tossWinnerId: integer("toss_winner_id").references(() => teams.tid),
  winnerId: integer("winner_id").references(() => teams.tid),
  result: text("result"),
});
