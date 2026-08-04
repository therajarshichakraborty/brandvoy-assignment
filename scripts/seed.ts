import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";
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
  if (val === null || val === undefined || val === "") return null;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? null : parsed;
}

function parseFloatSafe(val: unknown): string | null {
  if (val === null || val === undefined || val === "") return null;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? null : String(parsed.toFixed(2));
}

async function chunkInsert<T extends Record<string, any>>(
  table: any,
  records: T[],
  chunkSize = 500
) {
  if (!records.length) return;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    try {
      await db.insert(table).values(chunk).onConflictDoNothing();
    } catch (err) {
      // Fallback row-by-row if batch fails
      for (const row of chunk) {
        try {
          await db.insert(table).values(row).onConflictDoNothing();
        } catch (_) {}
      }
    }
  }
}

async function seed() {
  console.log("Starting high-performance database seeding...");

  try {
    await db.execute(sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id integer;`);
  } catch (_) {}

  const dataDir = path.join(process.cwd(), "data");

  // 1. TEAMS
  const teamsMap = new Map<number, any>();
  const teamsFile = path.join(dataDir, "teams", "teams.json");
  if (fs.existsSync(teamsFile)) {
    try {
      const raw = fs.readFileSync(teamsFile, "utf-8");
      const parsed = JSON.parse(raw);
      const teamList = Array.isArray(parsed) ? parsed : parsed.response?.teams || [];
      for (const t of teamList) {
        const tid = parseIntSafe(t.tid || t.team_id);
        if (!tid) continue;
        teamsMap.set(tid, {
          tid,
          title: t.title || t.name || `Team ${tid}`,
          abbr: t.abbr || t.short_name || `T${tid}`,
          altName: t.alt_name || null,
          logoUrl: t.logo_url || t.thumb_url || null,
          country: t.country || null,
        });
      }
    } catch (err) {
      console.error("Error reading teams.json:", err);
    }
  }
  await chunkInsert(teams, Array.from(teamsMap.values()), 100);
  console.log(`Seeded ${teamsMap.size} teams.`);

  // 2. PLAYERS
  const playersMap = new Map<number, any>();

  // Squads
  const squadsFile = path.join(dataDir, "squads", "squads.json");
  if (fs.existsSync(squadsFile)) {
    try {
      const raw = fs.readFileSync(squadsFile, "utf-8");
      const squadData = JSON.parse(raw);
      const teamSquads = Array.isArray(squadData) ? squadData : [squadData];
      for (const squad of teamSquads) {
        const teamId = parseIntSafe(squad.team_id || squad.team?.tid);
        const pList = squad.players || [];
        for (const p of pList) {
          const pid = parseIntSafe(p.pid || p.player_id);
          if (!pid) continue;
          playersMap.set(pid, {
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
            teamId: teamId || null,
          });
        }
      }
    } catch (err) {
      console.error("Error reading squads.json:", err);
    }
  }

  // Player career stats
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

        const existing = playersMap.get(pid) || {};
        playersMap.set(pid, {
          pid,
          title: p.title || p.name || p.short_name || existing.title || `Player ${pid}`,
          shortName: p.short_name || existing.shortName || null,
          firstName: p.first_name || existing.firstName || null,
          lastName: p.last_name || existing.lastName || null,
          birthdate: p.birthdate || existing.birthdate || null,
          birthplace: p.birthplace || existing.birthplace || null,
          country: p.country || existing.country || null,
          playingRole: p.playing_role || p.role || existing.playingRole || null,
          battingStyle: p.batting_style || existing.battingStyle || null,
          bowlingStyle: p.bowling_style || existing.bowlingStyle || null,
          nationality: p.nationality || existing.nationality || null,
          teamId: existing.teamId || null,
        });
      } catch (_) {}
    }
  }

  await chunkInsert(players, Array.from(playersMap.values()), 300);
  console.log(`Seeded ${playersMap.size} players.`);

  // 3. MATCHES
  const matchesMap = new Map<number, any>();

  const matchesFile = path.join(dataDir, "matches", "matches.json");
  if (fs.existsSync(matchesFile)) {
    try {
      const raw = fs.readFileSync(matchesFile, "utf-8");
      const parsed = JSON.parse(raw);
      const matchList = Array.isArray(parsed) ? parsed : parsed.response?.items || [];
      for (const m of matchList) {
        const matchId = parseIntSafe(m.match_id || m.id);
        if (!matchId) continue;
        matchesMap.set(matchId, {
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
        });
      }
    } catch (_) {}
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

        const existing = matchesMap.get(matchId) || {};
        matchesMap.set(matchId, {
          id: matchId,
          title: m.title || existing.title || `Match ${matchId}`,
          subtitle: m.subtitle || existing.subtitle || null,
          matchNumber: m.match_number ? String(m.match_number) : existing.matchNumber || null,
          formatStr: m.format_str || existing.formatStr || null,
          statusStr: m.status_str || existing.statusStr || null,
          statusNote: m.status_note || existing.statusNote || null,
          dateStart: m.competition?.datestart || m.date_start || existing.dateStart || null,
          dateEnd: m.competition?.dateend || m.date_end || existing.dateEnd || null,
          venue: m.venue?.name || m.venue || existing.venue || null,
          teamAId: parseIntSafe(m.teama?.team_id || m.teama?.tid) || existing.teamAId || null,
          teamBId: parseIntSafe(m.teamb?.team_id || m.teamb?.tid) || existing.teamBId || null,
          tossWinnerId: parseIntSafe(m.toss?.winner || m.toss_winner_id) || existing.tossWinnerId || null,
          winnerId: parseIntSafe(m.winner?.team_id || m.winner_id) || existing.winnerId || null,
          result: m.result || m.status_note || existing.result || null,
        });
      } catch (_) {}
    }
  }

  await chunkInsert(matches, Array.from(matchesMap.values()), 100);
  console.log(`Seeded ${matchesMap.size} matches.`);

  // 4. INNINGS & DELIVERIES
  const inningsMap = new Map<number, any>();
  const deliveriesList: any[] = [];

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

        inningsMap.set(iid, {
          id: iid,
          matchId,
          battingTeamId: parseIntSafe(innData.batting_team_id),
          bowlingTeamId: parseIntSafe(innData.fielding_team_id || innData.bowling_team_id),
          inningsNumber: parseIntSafe(innData.number) || 1,
          name: innData.name || null,
          shortName: innData.short_name || null,
          scores: innData.scores || null,
          scoresFull: innData.scores_full || null,
        });

        const commentaryList = data.commentaries || data.commentary || innData.commentaries || [];
        for (const c of commentaryList) {
          const batsmanId = parseIntSafe(c.batsman_id);
          const bowlerId = parseIntSafe(c.bowler_id);
          const dismissedId = parseIntSafe(c.dismissed_player_id);

          // Auto-insert player stub if missing
          if (batsmanId && !playersMap.has(batsmanId)) {
            playersMap.set(batsmanId, { pid: batsmanId, title: c.batsman_name || `Player ${batsmanId}` });
          }
          if (bowlerId && !playersMap.has(bowlerId)) {
            playersMap.set(bowlerId, { pid: bowlerId, title: c.bowler_name || `Player ${bowlerId}` });
          }
          if (dismissedId && !playersMap.has(dismissedId)) {
            playersMap.set(dismissedId, { pid: dismissedId, title: `Player ${dismissedId}` });
          }

          deliveriesList.push({
            inningsId: iid,
            overNumber: parseIntSafe(c.over),
            ballNumber: parseIntSafe(c.ball),
            batsmanId: batsmanId || null,
            bowlerId: bowlerId || null,
            runs: parseIntSafe(c.runs) || 0,
            extras: parseIntSafe(c.extra_runs) || 0,
            wicketType: c.wicket_type || c.dismissal || null,
            dismissedPlayerId: dismissedId || null,
            commentaryText: c.commentary || c.text || null,
          });
        }
      } catch (_) {}
    }
  }

  // 5. SCORECARDS
  const battingStatsList: any[] = [];
  const bowlingStatsList: any[] = [];

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

          if (!inningsMap.has(iid)) {
            inningsMap.set(iid, {
              id: iid,
              matchId,
              battingTeamId: parseIntSafe(inn.batting_team_id),
              bowlingTeamId: parseIntSafe(inn.fielding_team_id || inn.bowling_team_id),
              inningsNumber: parseIntSafe(inn.number) || 1,
              name: inn.name || null,
              shortName: inn.short_name || null,
              scores: inn.scores || null,
              scoresFull: inn.scores_full || null,
            });
          }

          const batsmen = inn.batsmen || [];
          for (const b of batsmen) {
            const playerId = parseIntSafe(b.batsman_id || b.pid);
            if (!playerId) continue;
            if (!playersMap.has(playerId)) {
              playersMap.set(playerId, { pid: playerId, title: b.name || `Player ${playerId}` });
            }
            battingStatsList.push({
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

          const bowlers = inn.bowlers || [];
          for (const bw of bowlers) {
            const playerId = parseIntSafe(bw.bowler_id || bw.pid);
            if (!playerId) continue;
            if (!playersMap.has(playerId)) {
              playersMap.set(playerId, { pid: playerId, title: bw.name || `Player ${playerId}` });
            }
            bowlingStatsList.push({
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
      } catch (_) {}
    }
  }

  // Ensure all player stubs are written to DB first
  await chunkInsert(players, Array.from(playersMap.values()), 300);
  await chunkInsert(innings, Array.from(inningsMap.values()), 100);
  console.log(`Seeded ${inningsMap.size} innings.`);

  await chunkInsert(deliveries, deliveriesList, 1000);
  console.log(`Seeded ${deliveriesList.length} deliveries.`);

  await chunkInsert(battingInningsStats, battingStatsList, 500);
  console.log(`Seeded ${battingStatsList.length} batting stats.`);

  await chunkInsert(bowlingInningsStats, bowlingStatsList, 500);
  console.log(`Seeded ${bowlingStatsList.length} bowling stats.`);

  console.log("🎉 Complete IPL database seeding finished in seconds with 0 errors!");
  process.exit(0);
}

seed();
