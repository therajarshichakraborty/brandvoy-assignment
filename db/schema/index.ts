import { relations } from "drizzle-orm";
import { teams } from "./teams";
import { players } from "./players";
import { matches } from "./matches";
import { innings } from "./innings";
import { deliveries } from "./deliveries";
import { battingInningsStats } from "./batting_innings_stats";
import { bowlingInningsStats } from "./bowling_innings_stats";

export * from "./teams";
export * from "./players";
export * from "./matches";
export * from "./innings";
export * from "./deliveries";
export * from "./batting_innings_stats";
export * from "./bowling_innings_stats";

export const teamsRelations = relations(teams, ({ many }) => ({
  matchesAsTeamA: many(matches, { relationName: "teamA" }),
  matchesAsTeamB: many(matches, { relationName: "teamB" }),
}));

export const playersRelations = relations(players, ({ many }) => ({
  deliveriesAsBatsman: many(deliveries, { relationName: "batsman" }),
  deliveriesAsBowler: many(deliveries, { relationName: "bowler" }),
  battingStats: many(battingInningsStats),
  bowlingStats: many(bowlingInningsStats),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  teamA: one(teams, {
    fields: [matches.teamAId],
    references: [teams.tid],
    relationName: "teamA",
  }),
  teamB: one(teams, {
    fields: [matches.teamBId],
    references: [teams.tid],
    relationName: "teamB",
  }),
  tossWinner: one(teams, {
    fields: [matches.tossWinnerId],
    references: [teams.tid],
  }),
  winner: one(teams, {
    fields: [matches.winnerId],
    references: [teams.tid],
  }),
  inningsList: many(innings),
}));

export const inningsRelations = relations(innings, ({ one, many }) => ({
  match: one(matches, {
    fields: [innings.matchId],
    references: [matches.id],
  }),
  battingTeam: one(teams, {
    fields: [innings.battingTeamId],
    references: [teams.tid],
  }),
  bowlingTeam: one(teams, {
    fields: [innings.bowlingTeamId],
    references: [teams.tid],
  }),
  deliveriesList: many(deliveries),
  battingStatsList: many(battingInningsStats),
  bowlingStatsList: many(bowlingInningsStats),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  innings: one(innings, {
    fields: [deliveries.inningsId],
    references: [innings.id],
  }),
  batsman: one(players, {
    fields: [deliveries.batsmanId],
    references: [players.pid],
    relationName: "batsman",
  }),
  bowler: one(players, {
    fields: [deliveries.bowlerId],
    references: [players.pid],
    relationName: "bowler",
  }),
  dismissedPlayer: one(players, {
    fields: [deliveries.dismissedPlayerId],
    references: [players.pid],
  }),
}));

export const battingInningsStatsRelations = relations(battingInningsStats, ({ one }) => ({
  player: one(players, {
    fields: [battingInningsStats.playerId],
    references: [players.pid],
  }),
  match: one(matches, {
    fields: [battingInningsStats.matchId],
    references: [matches.id],
  }),
  innings: one(innings, {
    fields: [battingInningsStats.inningsId],
    references: [innings.id],
  }),
}));

export const bowlingInningsStatsRelations = relations(bowlingInningsStats, ({ one }) => ({
  player: one(players, {
    fields: [bowlingInningsStats.playerId],
    references: [players.pid],
  }),
  match: one(matches, {
    fields: [bowlingInningsStats.matchId],
    references: [matches.id],
  }),
  innings: one(innings, {
    fields: [bowlingInningsStats.inningsId],
    references: [innings.id],
  }),
}));
