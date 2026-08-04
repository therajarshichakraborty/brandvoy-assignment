import { pgTable, integer, text } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  pid: integer("pid").primaryKey(),
  title: text("title").notNull(),
  shortName: text("short_name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  birthdate: text("birthdate"),
  birthplace: text("birthplace"),
  country: text("country"),
  playingRole: text("playing_role"),
  battingStyle: text("batting_style"),
  bowlingStyle: text("bowling_style"),
  nationality: text("nationality"),
});
