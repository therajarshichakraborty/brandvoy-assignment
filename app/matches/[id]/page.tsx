"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Trophy, Flame, Target, User } from "lucide-react";
import { useMatchDetail, Innings, BattingStat, BowlingStat } from "@/hooks/use-api";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;

  const { data: match, loading, error } = useMatchDetail(matchId);

  if (loading) {
    return (
      <div className="space-y-6 py-6 max-w-5xl mx-auto">
        <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        <div className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-6 py-6 max-w-5xl mx-auto">
        <Link href="/matches" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </Link>
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-sm">
          Match details not found: {error}
        </div>
      </div>
    );
  }

  const mId = match.id ?? match.matchId;
  const mDate = match.dateStart || match.date;
  const mInnings = match.inningsList || match.innings || [];
  const tossWinnerName = typeof match.tossWinner === "object" ? match.tossWinner?.title : match.tossWinner;

  // Extract Key Performers across all innings
  let topBatsman: BattingStat | null = null;
  let topBowler: BowlingStat | null = null;

  mInnings.forEach((inn: Innings) => {
    inn.battingStatsList?.forEach((b) => {
      if (!topBatsman || b.runs > topBatsman.runs) {
        topBatsman = b;
      }
    });
    inn.bowlingStatsList?.forEach((bw) => {
      if (
        !topBowler ||
        bw.wickets > topBowler.wickets ||
        (bw.wickets === topBowler.wickets && bw.runsConceded < topBowler.runsConceded)
      ) {
        topBowler = bw;
      }
    });
  });

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <Link href="/matches" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Matches
      </Link>

      {/* Match Header Banner */}
      <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border/70 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{mDate ? new Date(mDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Scheduled Match"}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {match.venue || "IPL Venue"}
            </span>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 self-start sm:self-auto">
            Match #{mId}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {match.title || `Match #${mId}`}
          </h1>
          {match.result && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold">
              <Trophy className="w-4 h-4" />
              {match.result}
            </div>
          )}
        </div>

        {/* Toss & Info */}
        {(tossWinnerName || match.statusNote) && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-muted-foreground">
            {tossWinnerName ? (
              <>
                <span className="font-semibold text-foreground">Toss Info: </span>
                {tossWinnerName} won the toss and elected to {match.tossDecision || "play"}.
              </>
            ) : (
              <span>{match.statusNote}</span>
            )}
          </div>
        )}
      </div>

      {/* Key Performers Section */}
      {(topBatsman || topBowler) && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" /> Key Match Performers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topBatsman && (
              <div className="bg-card rounded-2xl p-5 border border-border/70 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-black text-lg shrink-0">
                  {(topBatsman as BattingStat).runs}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Top Batsman</div>
                  <Link
                    href={`/players/${(topBatsman as BattingStat).playerId}`}
                    className="text-sm font-bold text-foreground hover:text-blue-600 truncate block"
                  >
                    {(topBatsman as BattingStat).player?.title || (topBatsman as BattingStat).player?.shortName || `Player #${(topBatsman as BattingStat).playerId}`}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {(topBatsman as BattingStat).runs} runs off {(topBatsman as BattingStat).balls} balls ({(topBatsman as BattingStat).fours}x4, {(topBatsman as BattingStat).sixes}x6)
                  </div>
                </div>
              </div>
            )}

            {topBowler && (
              <div className="bg-card rounded-2xl p-5 border border-border/70 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-black text-lg shrink-0">
                  {(topBowler as BowlingStat).wickets}W
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Top Bowler</div>
                  <Link
                    href={`/players/${(topBowler as BowlingStat).playerId}`}
                    className="text-sm font-bold text-foreground hover:text-blue-600 truncate block"
                  >
                    {(topBowler as BowlingStat).player?.title || (topBowler as BowlingStat).player?.shortName || `Player #${(topBowler as BowlingStat).playerId}`}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {(topBowler as BowlingStat).wickets}/{(topBowler as BowlingStat).runsConceded} in {(topBowler as BowlingStat).overs} overs (Econ: {(topBowler as BowlingStat).economy})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Innings Scorecards */}
      {mInnings && mInnings.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" /> Full Match Scorecard & Innings Breakdown
          </h2>

          <div className="space-y-8">
            {mInnings.map((inn: Innings, idx: number) => {
              const battingTeamName = inn.battingTeam?.title || `Team #${inn.battingTeamId}`;
              const bowlingTeamName = inn.bowlingTeam?.title || `Team #${inn.bowlingTeamId}`;

              const totalRuns = inn.battingStatsList?.reduce((acc, b) => acc + (b.runs || 0), 0) ?? 0;
              const totalWickets = inn.bowlingStatsList?.reduce((acc, bw) => acc + (bw.wickets || 0), 0) ?? 0;

              return (
                <div key={inn.id || idx} className="bg-card rounded-3xl border border-border/70 shadow-sm overflow-hidden space-y-6 p-6">
                  {/* Innings Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Innings {inn.inningsNumber}</div>
                      <h3 className="text-xl font-black text-foreground">{battingTeamName}</h3>
                    </div>
                    <div className="text-right sm:text-right">
                      <span className="text-2xl font-extrabold text-foreground">{totalRuns}/{totalWickets}</span>
                      <span className="text-xs text-muted-foreground block">vs {bowlingTeamName}</span>
                    </div>
                  </div>

                  {/* Batting Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Batting Scorecard
                    </h4>
                    {inn.battingStatsList && inn.battingStatsList.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-border/50">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/80 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                              <th className="py-2.5 px-3">Batter</th>
                              <th className="py-2.5 px-3">Dismissal</th>
                              <th className="py-2.5 px-3 text-right">R</th>
                              <th className="py-2.5 px-3 text-right">B</th>
                              <th className="py-2.5 px-3 text-right">4s</th>
                              <th className="py-2.5 px-3 text-right">6s</th>
                              <th className="py-2.5 px-3 text-right">SR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {inn.battingStatsList.map((b: BattingStat, bIdx: number) => {
                              const pName = b.player?.title || b.player?.shortName || `Player #${b.playerId}`;
                              const isHighScorer = b.runs >= 30;

                              return (
                                <tr key={b.id || bIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-foreground">
                                    <Link href={`/players/${b.playerId}`} className="hover:text-blue-600 hover:underline">
                                      {pName}
                                    </Link>
                                  </td>
                                  <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                                    {b.howOut || "not out"}
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-bold ${isHighScorer ? "text-blue-600 font-extrabold" : "text-foreground"}`}>
                                    {b.runs}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground">{b.balls}</td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground">{b.fours}</td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground">{b.sixes}</td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">{b.strikeRate ?? "0.00"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                        No batting records found for this innings.
                      </div>
                    )}
                  </div>

                  {/* Bowling Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-600" /> Bowling Figures
                    </h4>
                    {inn.bowlingStatsList && inn.bowlingStatsList.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-border/50">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/80 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                              <th className="py-2.5 px-3">Bowler</th>
                              <th className="py-2.5 px-3 text-right">O</th>
                              <th className="py-2.5 px-3 text-right">M</th>
                              <th className="py-2.5 px-3 text-right">R</th>
                              <th className="py-2.5 px-3 text-right">W</th>
                              <th className="py-2.5 px-3 text-right">ECON</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {inn.bowlingStatsList.map((bw: BowlingStat, bwIdx: number) => {
                              const pName = bw.player?.title || bw.player?.shortName || `Player #${bw.playerId}`;
                              const isKeyWickets = bw.wickets >= 2;

                              return (
                                <tr key={bw.id || bwIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-foreground">
                                    <Link href={`/players/${bw.playerId}`} className="hover:text-blue-600 hover:underline">
                                      {pName}
                                    </Link>
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">{bw.overs}</td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground">{bw.maidens}</td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground">{bw.runsConceded}</td>
                                  <td className={`py-2.5 px-3 text-right font-bold ${isKeyWickets ? "text-emerald-600 font-extrabold" : "text-foreground"}`}>
                                    {bw.wickets}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">{bw.economy ?? "0.00"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                        No bowling records found for this innings.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
