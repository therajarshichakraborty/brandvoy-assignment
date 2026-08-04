import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { matches } from "./matches";
import { teams } from "./teams";

export const innings = pgTable("innings", {
  id: integer("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  battingTeamId: integer("batting_team_id").references(() => teams.tid),
  bowlingTeamId: integer("bowling_team_id").references(() => teams.tid),
  inningsNumber: integer("innings_number").notNull(),
  name: text("name"),
  shortName: text("short_name"),
  scores: text("scores"),
  scoresFull: text("scores_full"),
});
