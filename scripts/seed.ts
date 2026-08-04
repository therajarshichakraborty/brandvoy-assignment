import fs from "fs";
import path from "path";
import { db } from "../db";
import {
  teams,
  players,
  matches,
  innings,
  deliveries,
  battingInningsStats,
  bowlingInningsStats,
} from "../db/schema";

function parseIntSafe(val: unknown): number | null {
  if (val === null || val === undefined || val === "") {
    return null;
  }
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? null : parsed;
}

function parseFloatSafe(val: unknown): string | null {
  if (val === null || val === undefined || val === "") {
    return null;
  }
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

async function seed() {
  console.log("Starting database seeding...");

  const dataDir = path.join(process.cwd(), "data");

  const teamsFile = path.join(dataDir, "teams", "teams.json");
  if (fs.existsSync(teamsFile)) {
    try {
      const raw = fs.readFileSync(teamsFile, "utf-8");
      const parsed = JSON.parse(raw);
      const teamList = Array.isArray(parsed) ? parsed : parsed.response?.teams || [];

      for (const t of teamList) {
        const tid = parseIntSafe(t.tid || t.team_id);
        if (!tid) continue;
        await db
          .insert(teams)
          .values({
            tid: tid,
            title: t.title || t.name || "",
            abbr: t.abbr || t.short_name || "",
            altName: t.alt_name || null,
            logoUrl: t.logo_url || t.thumb_url || null,
            country: t.country || null,
          })
          .onConflictDoNothing();
      }
      console.log("Teams seeded successfully.");
    } catch (err) {
      console.error("Error seeding teams:", err);
    }
  }

  const squadsFile = path.join(dataDir, "squads", "squads.json");
  if (fs.existsSync(squadsFile)) {
    try {
      const raw = fs.readFileSync(squadsFile, "utf-8");
      const squadData = JSON.parse(raw);
      const teamSquads = Array.isArray(squadData) ? squadData : [squadData];

      for (const squad of teamSquads) {
        const pList = squad.players || [];
        for (const p of pList) {
          const pid = parseIntSafe(p.pid || p.player_id);
          if (!pid) continue;
          await db
            .insert(players)
            .values({
              pid: pid,
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
            })
            .onConflictDoNothing();
        }
      }
      console.log("Squad players seeded successfully.");
    } catch (err) {
      console.error("Error seeding squads:", err);
    }
  }

  const playersDir = path.join(dataDir, "player_career_stats");
  if (fs.existsSync(playersDir)) {
    const playerFiles = fs.readdirSync(playersDir);
    for (const file of playerFiles) {
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
            pid: pid,
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
      } catch (err) {
        console.error(`Error seeding player file ${file}:`, err);
      }
    }
    console.log("Player career stats seeded successfully.");
  }

  const matchInfoDir = path.join(dataDir, "match_info");
  if (fs.existsSync(matchInfoDir)) {
    const matchFiles = fs.readdirSync(matchInfoDir);
    for (const file of matchFiles) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = fs.readFileSync(path.join(matchInfoDir, file), "utf-8");
        const m = JSON.parse(raw);
        const matchId = parseIntSafe(m.match_id || m.id);
        if (!matchId) continue;

        const teamAId = parseIntSafe(m.teama?.team_id || m.teama?.tid);
        const teamBId = parseIntSafe(m.teamb?.team_id || m.teamb?.tid);
        const tossWinnerId = parseIntSafe(m.toss?.winner || m.toss_winner_id);
        const winnerId = parseIntSafe(m.winner?.team_id || m.winner_id);

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
            teamAId: teamAId,
            teamBId: teamBId,
            tossWinnerId: tossWinnerId,
            winnerId: winnerId,
            result: m.result || m.status_note || null,
          })
          .onConflictDoNothing();
      } catch (err) {
        console.error(`Error seeding match file ${file}:`, err);
      }
    }
    console.log("Matches seeded successfully.");
  }

  const matchesFile = path.join(dataDir, "matches", "matches.json");
  if (fs.existsSync(matchesFile)) {
    try {
      const raw = fs.readFileSync(matchesFile, "utf-8");
      const parsed = JSON.parse(raw);
      const matchList = Array.isArray(parsed) ? parsed : parsed.response?.items || [];
      for (const m of matchList) {
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
            dateStart: m.datestart || m.date_start || null,
            dateEnd: m.dateend || m.date_end || null,
            venue: m.venue?.name || m.venue || null,
            teamAId: parseIntSafe(m.teama?.team_id || m.teama?.tid),
            teamBId: parseIntSafe(m.teamb?.team_id || m.teamb?.tid),
            tossWinnerId: parseIntSafe(m.toss?.winner || m.toss_winner_id),
            winnerId: parseIntSafe(m.winner?.team_id || m.winner_id),
            result: m.result || m.status_note || null,
          })
          .onConflictDoNothing();
      }
    } catch (err) {
      console.error("Error seeding matches list:", err);
    }
  }

  const commentaryDir = path.join(dataDir, "match_innings_commentary");
  if (fs.existsSync(commentaryDir)) {
    const commFiles = fs.readdirSync(commentaryDir);
    for (const file of commFiles) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = fs.readFileSync(path.join(commentaryDir, file), "utf-8");
        const data = JSON.parse(raw);
        const innData = data.inning || data;
        const iid = parseIntSafe(innData.iid || innData.id);
        const matchId = parseIntSafe(data.match_id || innData.match_id);

        if (!iid || !matchId) continue;

        const batTeamId = parseIntSafe(innData.batting_team_id);
        const bowlTeamId = parseIntSafe(innData.fielding_team_id || innData.bowling_team_id);
        const num = parseIntSafe(innData.number) || 1;

        await ensureInningsExists(iid, matchId, batTeamId, bowlTeamId, num);

        const commentaryList = data.commentaries || data.commentary || innData.commentaries || [];
        for (const c of commentaryList) {
          const batsmanId = parseIntSafe(c.batsman_id);
          const bowlerId = parseIntSafe(c.bowler_id);
          const dismissedId = parseIntSafe(c.dismissed_player_id);

          await ensurePlayerExists(batsmanId, c.batsman_name);
          await ensurePlayerExists(bowlerId, c.bowler_name);
          await ensurePlayerExists(dismissedId);

          await db.insert(deliveries).values({
            inningsId: iid,
            overNumber: parseIntSafe(c.over),
            ballNumber: parseIntSafe(c.ball),
            batsmanId: batsmanId,
            bowlerId: bowlerId,
            runs: parseIntSafe(c.runs) || 0,
            extras: parseIntSafe(c.extra_runs) || 0,
            wicketType: c.wicket_type || c.dismissal || null,
            dismissedPlayerId: dismissedId,
            commentaryText: c.commentary || c.text || null,
          });
        }
      } catch (err) {
        console.error(`Error seeding commentary file ${file}:`, err);
      }
    }
    console.log("Innings and Deliveries seeded successfully.");
  }

  const scorecardsDir = path.join(dataDir, "scorecards");
  if (fs.existsSync(scorecardsDir)) {
    const cardFiles = fs.readdirSync(scorecardsDir);
    for (const file of cardFiles) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = fs.readFileSync(path.join(scorecardsDir, file), "utf-8");
        const sc = JSON.parse(raw);
        const matchId = parseIntSafe(sc.match_id || sc.response?.match_id);
        const inningsList = sc.innings || sc.response?.innings || [];

        if (!matchId) continue;

        for (const inn of inningsList) {
          const iid = parseIntSafe(inn.iid || inn.id);
          if (!iid) continue;

          const batTeamId = parseIntSafe(inn.batting_team_id);
          const bowlTeamId = parseIntSafe(inn.fielding_team_id || inn.bowling_team_id);
          const num = parseIntSafe(inn.number) || 1;

          await ensureInningsExists(iid, matchId, batTeamId, bowlTeamId, num);

          const batsmen = inn.batsmen || [];
          for (const b of batsmen) {
            const playerId = parseIntSafe(b.batsman_id || b.pid);
            if (!playerId) continue;

            await ensurePlayerExists(playerId, b.name);

            await db.insert(battingInningsStats).values({
              playerId: playerId,
              matchId: matchId,
              inningsId: iid,
              runs: parseIntSafe(b.runs) || 0,
              balls: parseIntSafe(b.balls_faced || b.balls) || 0,
              fours: parseIntSafe(b.fours) || 0,
              sixes: parseIntSafe(b.sixes) || 0,
              strikeRate: parseFloatSafe(b.strike_rate),
              howOut: b.how_out || b.dismissal || null,
            });
          }

          const bowlers = inn.bowlers || [];
          for (const bw of bowlers) {
            const playerId = parseIntSafe(bw.bowler_id || bw.pid);
            if (!playerId) continue;

            await ensurePlayerExists(playerId, bw.name);

            await db.insert(bowlingInningsStats).values({
              playerId: playerId,
              matchId: matchId,
              inningsId: iid,
              overs: parseFloatSafe(bw.overs),
              runsConceded: parseIntSafe(bw.runs_conceded || bw.runs) || 0,
              wickets: parseIntSafe(bw.wickets) || 0,
              economy: parseFloatSafe(bw.economy_rate || bw.econ),
              maidens: parseIntSafe(bw.maidens) || 0,
            });
          }
        }
      } catch (err) {
        console.error(`Error seeding scorecard file ${file}:`, err);
      }
    }
    console.log("Batting and Bowling Innings Stats seeded successfully.");
  }

  console.log("All data seeded successfully without any errors!");
  process.exit(0);
}

seed();
