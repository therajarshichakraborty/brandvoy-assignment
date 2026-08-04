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
    assert.strictEqual(parsed.page, 1);
    assert.strictEqual(parsed.limit, 20);
  });

  test("teamsQuerySchema parses search query correctly", () => {
    const parsed = teamsQuerySchema.parse({ search: "Chennai", limit: "10" });
    assert.strictEqual(parsed.search, "Chennai");
    assert.strictEqual(parsed.limit, 10);
  });

  test("playersQuerySchema parses teamId and role filters", () => {
    const parsed = playersQuerySchema.parse({ teamId: "591", role: "bat" });
    assert.strictEqual(parsed.teamId, 591);
    assert.strictEqual(parsed.role, "bat");
  });

  test("matchesQuerySchema parses date range and teamId", () => {
    const parsed = matchesQuerySchema.parse({ teamId: "610", startDate: "2022-03-26" });
    assert.strictEqual(parsed.teamId, 610);
    assert.strictEqual(parsed.startDate, "2022-03-26");
  });

  test("battingLeadersQuerySchema validates metrics", () => {
    const parsed = battingLeadersQuerySchema.parse({ metric: "strikeRate" });
    assert.strictEqual(parsed.metric, "strikeRate");
  });

  test("bowlingLeadersQuerySchema validates economy metric", () => {
    const parsed = bowlingLeadersQuerySchema.parse({ metric: "economy" });
    assert.strictEqual(parsed.metric, "economy");
  });
});
