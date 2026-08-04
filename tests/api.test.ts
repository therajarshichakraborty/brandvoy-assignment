import { describe, test } from "node:test";
import assert from "node:assert";
import {
  paginationSchema,
  teamsQuerySchema,
  playersQuerySchema,
  matchesQuerySchema,
  battingLeadersQuerySchema,
  bowlingLeadersQuerySchema
} from "../lib/validators";

describe("API Query Validators & Schemas", () => {
  test("paginationSchema applies default values", () => {
    const parsed = paginationSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  test("teamsQuerySchema parses search query correctly", () => {
    const parsed = teamsQuerySchema.parse({ search: "Chennai", limit: "10" });
    expect(parsed.search).toBe("Chennai");
    expect(parsed.limit).toBe(10);
  });

  test("playersQuerySchema parses teamId and role filters", () => {
    const parsed = playersQuerySchema.parse({ teamId: "591", role: "bat" });
    expect(parsed.teamId).toBe(591);
    expect(parsed.role).toBe("bat");
  });

  test("matchesQuerySchema parses date range and teamId", () => {
    const parsed = matchesQuerySchema.parse({ teamId: "610", startDate: "2022-03-26" });
    expect(parsed.teamId).toBe(610);
    expect(parsed.startDate).toBe("2022-03-26");
  });

  test("battingLeadersQuerySchema validates metrics", () => {
    const parsed = battingLeadersQuerySchema.parse({ metric: "strikeRate" });
    expect(parsed.metric).toBe("strikeRate");
  });

  test("bowlingLeadersQuerySchema validates economy metric", () => {
    const parsed = bowlingLeadersQuerySchema.parse({ metric: "economy" });
    expect(parsed.metric).toBe("economy");
  });
});
