import { pgTable, integer, text } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  tid: integer("tid").primaryKey(),
  title: text("title").notNull(),
  abbr: text("abbr").notNull(),
  altName: text("alt_name"),
  logoUrl: text("logo_url"),
  country: text("country"),
});
