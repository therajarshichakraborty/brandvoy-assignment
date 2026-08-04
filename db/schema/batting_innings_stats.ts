import { pgTable, serial, integer, text, numeric } from "drizzle-orm/pg-core";
import { players } from "./players";
import { matches } from "./matches";
import { innings } from "./innings";

export const battingInningsStats = pgTable("batting_innings_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => players.pid),
  matchId: integer("match_id").notNull().references(() => matches.id),
  inningsId: integer("innings_id").notNull().references(() => innings.id),
  runs: integer("runs").default(0),
  balls: integer("balls").default(0),
  fours: integer("fours").default(0),
  sixes: integer("sixes").default(0),
  strikeRate: numeric("strike_rate", { precision: 6, scale: 2 }),
  howOut: text("how_out"),
});
