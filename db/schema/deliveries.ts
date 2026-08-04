import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { innings } from "./innings";
import { players } from "./players";

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  inningsId: integer("innings_id").notNull().references(() => innings.id),
  overNumber: integer("over_number"),
  ballNumber: integer("ball_number"),
  batsmanId: integer("batsman_id").references(() => players.pid),
  bowlerId: integer("bowler_id").references(() => players.pid),
  runs: integer("runs").default(0),
  extras: integer("extras").default(0),
  wicketType: text("wicket_type"),
  dismissedPlayerId: integer("dismissed_player_id").references(() => players.pid),
  commentaryText: text("commentary_text"),
});
