import { pgTable, serial, integer, numeric } from "drizzle-orm/pg-core";
import { players } from "./players";
import { matches } from "./matches";
import { innings } from "./innings";

export const bowlingInningsStats = pgTable("bowling_innings_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.pid),
  matchId: integer("match_id").notNull().references(() => matches.id),
  inningsId: integer("innings_id").notNull().references(() => innings.id),
  overs: numeric("overs", { precision: 4, scale: 1 }),
  runsConceded: integer("runs_conceded").default(0),
  wickets: integer("wickets").default(0),
  economy: numeric("economy", { precision: 5, scale: 2 }),
  maidens: integer("maidens").default(0),
});
