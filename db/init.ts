import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  teams,
  players,
  matches,
  innings,
  deliveries,
  battingInningsStats,
  bowlingInningsStats,
} from "./schema";

let isInitializing = false;
let isInitialized = false;

function parseIntSafe(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? null : parsed;
}

function parseFloatSafe(val: unknown): string | null {
  if (val === null || val === undefined || val === "") return null;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? null : String(parsed.toFixed(2));
}

async function ensurePlayerExists(pid: number | null, name?: string | null) {
  if (!pid) return;
  await db
    .insert(players)
    .values({
      pid: pid,
      title: name || `Player ${pid}`,
    })
    .onConflictDoNothing();
}

async function ensureInningsExists(
  iid: number | null,
  matchId: number | null,
  battingTeamId?: number | null,
  bowlingTeamId?: number | null,
  number?: number | null
) {
  if (!iid || !matchId) return;
  await db
    .insert(innings)
    .values({
      id: iid,
      matchId: matchId,
      battingTeamId: battingTeamId || null,
      bowlingTeamId: bowlingTeamId || null,
      inningsNumber: number || 1,
    })
    .onConflictDoNothing();
}

export async function initDbIfNeeded() {
  if (isInitialized) return;
  if (isInitializing) return;
  isInitializing = true;

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        tid integer PRIMARY KEY NOT NULL,
        title text NOT NULL,
        abbr text NOT NULL,
        alt_name text,
        logo_url text,
        country text
      );
      CREATE TABLE IF NOT EXISTS players (
        pid integer PRIMARY KEY NOT NULL,
        title text NOT NULL,
        short_name text,
        first_name text,
        last_name text,
        birthdate text,
        birthplace text,
        country text,
        playing_role text,
        batting_style text,
        bowling_style text,
        nationality text,
        team_id integer
      );
      ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id integer;
      CREATE TABLE IF NOT EXISTS matches (
        id integer PRIMARY KEY NOT NULL,
        title text NOT NULL,
        subtitle text,
        match_number text,
        format_str text,
        status_str text,
        status_note text,
        date_start text,
        date_end text,
        venue text,
        team_a_id integer,
        team_b_id integer,
        toss_winner_id integer,
        winner_id integer,
        result text
      );
      CREATE TABLE IF NOT EXISTS innings (
        id integer PRIMARY KEY NOT NULL,
        match_id integer NOT NULL,
        batting_team_id integer,
        bowling_team_id integer,
        innings_number integer NOT NULL,
        name text,
        short_name text,
        scores text,
        scores_full text
      );
      CREATE TABLE IF NOT EXISTS deliveries (
        id serial PRIMARY KEY NOT NULL,
        innings_id integer NOT NULL,
        over_number integer,
        ball_number integer,
        batsman_id integer,
        bowler_id integer,
        runs integer DEFAULT 0,
        extras integer DEFAULT 0,
        wicket_type text,
        dismissed_player_id integer,
        commentary_text text
      );
      CREATE TABLE IF NOT EXISTS batting_innings_stats (
        id serial PRIMARY KEY NOT NULL,
        player_id integer NOT NULL,
        match_id integer NOT NULL,
        innings_id integer NOT NULL,
        runs integer DEFAULT 0,
        balls integer DEFAULT 0,
        fours integer DEFAULT 0,
        sixes integer DEFAULT 0,
        strike_rate numeric(6, 2),
        how_out text
      );
      CREATE TABLE IF NOT EXISTS bowling_innings_stats (
        id serial PRIMARY KEY NOT NULL,
        player_id integer NOT NULL,
        match_id integer NOT NULL,
        innings_id integer NOT NULL,
        overs numeric(4, 1),
        runs_conceded integer DEFAULT 0,
        wickets integer DEFAULT 0,
        economy numeric(5, 2),
        maidens integer DEFAULT 0
      );
    `);

    // 2. Check if database is populated
    const checkCount = await db.execute(sql`SELECT count(*)::int FROM teams`);
    const countVal = Number(checkCount[0]?.count ?? 0);

    if (countVal === 0) {
      console.log("Database empty. Auto-seeding initial IPL dataset...");

      const dataDir = path.join(process.cwd(), "data");

      // Teams
      const teamsFile = path.join(dataDir, "teams", "teams.json");
      if (fs.existsSync(teamsFile)) {
        const raw = fs.readFileSync(teamsFile, "utf-8");
        const parsed = JSON.parse(raw);
        const teamList = Array.isArray(parsed) ? parsed : parsed.response?.teams || [];
        for (const t of teamList) {
          const tid = parseIntSafe(t.tid || t.team_id);
          if (!tid) continue;
          await db
            .insert(teams)
            .values({
              tid,
              title: t.title || t.name || "",
              abbr: t.abbr || t.short_name || "",
              altName: t.alt_name || null,
              logoUrl: t.logo_url || t.thumb_url || null,
              country: t.country || null,
            })
            .onConflictDoNothing();
        }
      }

      // Squads / Players
      const squadsFile = path.join(dataDir, "squads", "squads.json");
      if (fs.existsSync(squadsFile)) {
        const raw = fs.readFileSync(squadsFile, "utf-8");
        const squadData = JSON.parse(raw);
        const teamSquads = Array.isArray(squadData) ? squadData : [squadData];
        for (const squad of teamSquads) {
          const teamId = parseIntSafe(squad.team_id || squad.team?.tid);
          for (const p of squad.players || []) {
            const pid = parseIntSafe(p.pid || p.player_id);
            if (!pid) continue;
            await db
              .insert(players)
              .values({
                pid,
                title: p.title || p.name || p.short_name || `Player ${pid}`,
                shortName: p.short_name || null,
                firstName: p.first_name || null,
                lastName: p.last_name || null,
                birthdate: p.birthdate || null,
                birthplace: p.birthplace || null,
                country: p.country || null,
                playingRole: p.playing_role || p.role || null,
                battingStyle: p.batting_style || null,
                bowlingStyle: p.bowling_style || null,
                nationality: p.nationality || null,
                teamId: teamId,
              })
              .onConflictDoUpdate({
                target: players.pid,
                set: {
                  teamId: teamId,
                },
              });
          }
        }
      }

      // Player Career Stats
      const playersDir = path.join(dataDir, "player_career_stats");
      if (fs.existsSync(playersDir)) {
        for (const file of fs.readdirSync(playersDir)) {
          if (!file.endsWith(".json")) continue;
          try {
            const raw = fs.readFileSync(path.join(playersDir, file), "utf-8");
            const parsed = JSON.parse(raw);
            const p = parsed.response?.player || parsed.player || parsed;
            const pid = parseIntSafe(p.pid || p.player_id);
            if (!pid) continue;

            await db
              .insert(players)
              .values({
                pid,
                title: p.title || p.name || p.short_name || "Unknown Player",
                shortName: p.short_name || null,
                firstName: p.first_name || null,
                lastName: p.last_name || null,
                birthdate: p.birthdate || null,
                birthplace: p.birthplace || null,
                country: p.country || null,
                playingRole: p.playing_role || p.role || null,
                battingStyle: p.batting_style || null,
                bowlingStyle: p.bowling_style || null,
                nationality: p.nationality || null,
              })
              .onConflictDoNothing();
          } catch (e) {}
        }
      }

      // Match Info
      const matchInfoDir = path.join(dataDir, "match_info");
      if (fs.existsSync(matchInfoDir)) {
        for (const file of fs.readdirSync(matchInfoDir)) {
          if (!file.endsWith(".json")) continue;
          try {
            const raw = fs.readFileSync(path.join(matchInfoDir, file), "utf-8");
            const m = JSON.parse(raw);
            const matchId = parseIntSafe(m.match_id || m.id);
            if (!matchId) continue;

            await db
              .insert(matches)
              .values({
                id: matchId,
                title: m.title || `${m.teama?.name || "Team A"} vs ${m.teamb?.name || "Team B"}`,
                subtitle: m.subtitle || null,
                matchNumber: m.match_number ? String(m.match_number) : null,
                formatStr: m.format_str || null,
                statusStr: m.status_str || null,
                statusNote: m.status_note || null,
                dateStart: m.competition?.datestart || m.date_start || null,
                dateEnd: m.competition?.dateend || m.date_end || null,
                venue: m.venue?.name || m.venue || null,
                teamAId: parseIntSafe(m.teama?.team_id || m.teama?.tid),
                teamBId: parseIntSafe(m.teamb?.team_id || m.teamb?.tid),
                tossWinnerId: parseIntSafe(m.toss?.winner || m.toss_winner_id),
                winnerId: parseIntSafe(m.winner?.team_id || m.winner_id),
                result: m.result || m.status_note || null,
              })
              .onConflictDoNothing();
          } catch (e) {}
        }
      }

      // Scorecards
      const scorecardsDir = path.join(dataDir, "scorecards");
      if (fs.existsSync(scorecardsDir)) {
        for (const file of fs.readdirSync(scorecardsDir)) {
          if (!file.endsWith(".json")) continue;
          try {
            const raw = fs.readFileSync(path.join(scorecardsDir, file), "utf-8");
            const sc = JSON.parse(raw);
            const matchId = parseIntSafe(sc.match_id || sc.response?.match_id);
            if (!matchId) continue;

            for (const inn of sc.innings || sc.response?.innings || []) {
              const iid = parseIntSafe(inn.iid || inn.id);
              if (!iid) continue;

              await ensureInningsExists(
                iid,
                matchId,
                parseIntSafe(inn.batting_team_id),
                parseIntSafe(inn.fielding_team_id || inn.bowling_team_id),
                parseIntSafe(inn.number) || 1
              );

              for (const b of inn.batsmen || []) {
                const playerId = parseIntSafe(b.batsman_id || b.pid);
                if (!playerId) continue;
                await ensurePlayerExists(playerId, b.name);
                await db.insert(battingInningsStats).values({
                  playerId,
                  matchId,
                  inningsId: iid,
                  runs: parseIntSafe(b.runs) || 0,
                  balls: parseIntSafe(b.balls_faced || b.balls) || 0,
                  fours: parseIntSafe(b.fours) || 0,
                  sixes: parseIntSafe(b.sixes) || 0,
                  strikeRate: parseFloatSafe(b.strike_rate),
                  howOut: b.how_out || b.dismissal || null,
                });
              }

              for (const bw of inn.bowlers || []) {
                const playerId = parseIntSafe(bw.bowler_id || bw.pid);
                if (!playerId) continue;
                await ensurePlayerExists(playerId, bw.name);
                await db.insert(bowlingInningsStats).values({
                  playerId,
                  matchId,
                  inningsId: iid,
                  overs: parseFloatSafe(bw.overs),
                  runsConceded: parseIntSafe(bw.runs_conceded || bw.runs) || 0,
                  wickets: parseIntSafe(bw.wickets) || 0,
                  economy: parseFloatSafe(bw.economy_rate || bw.econ),
                  maidens: parseIntSafe(bw.maidens) || 0,
                });
              }
            }
          } catch (e) {}
        }
      }
      console.log("Database auto-seeding completed!");
    }

    const nullTeamCheck = await db.execute(sql`SELECT count(*)::int FROM players WHERE team_id IS NULL`);
    const nullCount = Number(nullTeamCheck[0]?.count ?? 0);
    if (nullCount > 0) {
      const dataDir = path.join(process.cwd(), "data");
      const squadsFile = path.join(dataDir, "squads", "squads.json");
      if (fs.existsSync(squadsFile)) {
        const raw = fs.readFileSync(squadsFile, "utf-8");
        const squadData = JSON.parse(raw);
        const teamSquads = Array.isArray(squadData) ? squadData : [squadData];
        for (const squad of teamSquads) {
          const teamId = parseIntSafe(squad.team_id || squad.team?.tid);
          if (!teamId) continue;
          for (const p of squad.players || []) {
            const pid = parseIntSafe(p.pid || p.player_id);
            if (!pid) continue;
            await db.execute(sql`UPDATE players SET team_id = ${teamId} WHERE pid = ${pid}`);
          }
        }
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error("Database auto-init error:", error);
  } finally {
    isInitializing = false;
  }
}
