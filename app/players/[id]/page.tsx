"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Globe, Award, Target, Zap, Activity, FileJson, Database } from "lucide-react";
import { usePlayerDetail } from "@/hooks/use-api";

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const resolvedParams = use(params);
  const playerId = resolvedParams.id;

  const { data: responseData, loading, error } = usePlayerDetail(playerId);

  const [activeFormat, setActiveFormat] = useState<string>("t20");

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (error || !responseData) {
    return (
      <div className="space-y-6 py-6">
        <Link href="/players" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600">
          <ArrowLeft className="w-4 h-4" /> Back to Players
        </Link>
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
          Player profile not found: {error}
        </div>
      </div>
    );
  }

  const player = (responseData.player ?? responseData) as import("@/hooks/use-api").PlayerDetail;
  const careerStats = responseData.careerStats;
  const lifetimeStats = responseData.lifetimeStats;

  const battingFormats = lifetimeStats?.batting ? Object.keys(lifetimeStats.batting) : [];
  const bowlingFormats = lifetimeStats?.bowling ? Object.keys(lifetimeStats.bowling) : [];
  const allFormats = Array.from(new Set([...battingFormats, ...bowlingFormats]));

  const formatLabels: Record<string, string> = {
    t20: "T20 Leagues",
    t20i: "T20 International",
    odi: "ODI International",
    test: "Test Matches",
    lista: "List A",
    firstclass: "First Class",
    t10: "T10 League",
  };

interface RawFormatStats {
  matches?: number | string;
  innings?: number | string;
  runs?: number | string;
  highest?: number | string;
  average?: string;
  Maverage?: string;
  strike?: string;
  run100?: number | string;
  run50?: number | string;
  run4?: number | string;
  run6?: number | string;
  notout?: number | string;
  balls?: number | string;
  catches?: number | string;
  wickets?: number | string;
  econ?: string;
  overs?: string | number;
  bestinning?: string;
}

  const selectedFormatKey = allFormats.includes(activeFormat) ? activeFormat : allFormats[0] || "t20";
  const rawBatting = lifetimeStats?.batting?.[selectedFormatKey] as RawFormatStats | undefined;
  const rawBowling = lifetimeStats?.bowling?.[selectedFormatKey] as RawFormatStats | undefined;

  return (
    <div className="space-y-6 pb-12">
      <Link href="/players" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Players
      </Link>

      {/* Bio Header */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center font-extrabold text-blue-600 text-xl">
            {player.shortName?.substring(0, 2) || player.title?.substring(0, 2) || "PL"}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{player.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                {player.nationality || player.country || "International"}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                {player.playingRole || "Player"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-50 border border-border/60">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Player ID</div>
          <div className="text-sm font-bold text-foreground">#{player.pid}</div>
        </div>
      </div>

      {/* Playing Attributes & Career Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Style & Bio (1 col) */}
        <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Bio & Technical Style
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-muted-foreground">Batting Style</div>
              <div className="font-semibold text-foreground">{player.battingStyle || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Bowling Style</div>
              <div className="font-semibold text-foreground">{player.bowlingStyle || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Birth Date</div>
              <div className="font-semibold text-foreground">{player.birthdate || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Birth Place</div>
              <div className="font-semibold text-foreground">{player.birthplace || "N/A"}</div>
            </div>
          </div>
        </div>

        {/* Aggregated Career Stats (2 cols) */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            IPL Match Database Stats (Computed via SQL)
          </h2>

          {careerStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Batting Stats Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between font-bold text-sm text-blue-600 border-b border-border/40 pb-2">
                  <span>IPL Batting Stats</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-muted-foreground">Innings</div>
                    <div className="text-base font-bold text-foreground">{careerStats.batting?.innings || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Runs</div>
                    <div className="text-base font-extrabold text-blue-600">{careerStats.batting?.runs || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Average</div>
                    <div className="text-sm font-semibold text-foreground">{careerStats.batting?.average || "0.00"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Strike Rate</div>
                    <div className="text-sm font-semibold text-foreground">{careerStats.batting?.strikeRate || "0.00"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fours / Sixes</div>
                    <div className="text-xs font-medium text-slate-500">{careerStats.batting?.fours || 0} / {careerStats.batting?.sixes || 0}</div>
                  </div>
                </div>
              </div>

              {/* Bowling Stats Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between font-bold text-sm text-teal-600 border-b border-border/40 pb-2">
                  <span>IPL Bowling Stats</span>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-muted-foreground">Innings</div>
                    <div className="text-base font-bold text-foreground">{careerStats.bowling?.innings || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Wickets</div>
                    <div className="text-base font-extrabold text-teal-600">{careerStats.bowling?.wickets || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Economy</div>
                    <div className="text-sm font-semibold text-foreground">{careerStats.bowling?.economy || "0.00"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Maidens</div>
                    <div className="text-sm font-semibold text-foreground">{careerStats.bowling?.maidens || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-6 text-center">
              No career statistics available for this player.
            </div>
          )}
        </div>
      </div>

      {/* SEPARATE BOX: Lifetime Career Stats from JSON Dataset */}
      {lifetimeStats && allFormats.length > 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileJson className="w-5 h-5 text-amber-500" />
                Lifetime Career Records (Raw JSON Dataset)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exact lifetime career totals loaded directly from the player&apos;s source JSON dataset file.
              </p>
            </div>

            {/* Format Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-100 p-1 rounded-xl">
              {allFormats.map((fmtKey) => (
                <button
                  key={fmtKey}
                  onClick={() => setActiveFormat(fmtKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                    selectedFormatKey === fmtKey
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fmtKey}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Database className="w-4 h-4" />
              Showing format: <span className="font-extrabold uppercase">{formatLabels[selectedFormatKey] || selectedFormatKey}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Batting JSON Box */}
              {rawBatting ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-4">
                  <div className="font-bold text-sm text-foreground border-b border-border/40 pb-2 flex items-center justify-between">
                    <span>{selectedFormatKey.toUpperCase()} Batting Record</span>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">
                      {rawBatting.matches || 0} Matches / {rawBatting.innings || 0} Innings
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-muted-foreground">Total Runs</div>
                      <div className="text-lg font-extrabold text-blue-600">{rawBatting.runs ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Highest Score</div>
                      <div className="text-lg font-bold text-foreground">{rawBatting.highest ?? "0"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="text-lg font-bold text-foreground">{rawBatting.average || rawBatting.Maverage || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Strike Rate</div>
                      <div className="text-sm font-semibold text-foreground">{rawBatting.strike || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">100s / 50s</div>
                      <div className="text-sm font-semibold text-foreground">{rawBatting.run100 ?? 0} / {rawBatting.run50 ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">4s / 6s</div>
                      <div className="text-sm font-semibold text-foreground">{rawBatting.run4 ?? 0} / {rawBatting.run6 ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Not Outs</div>
                      <div className="text-sm font-semibold text-slate-600">{rawBatting.notout ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Balls Faced</div>
                      <div className="text-sm font-semibold text-slate-600">{rawBatting.balls ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Catches</div>
                      <div className="text-sm font-semibold text-slate-600">{rawBatting.catches ?? 0}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 text-muted-foreground text-center flex items-center justify-center">
                  No batting data recorded for format {selectedFormatKey.toUpperCase()}
                </div>
              )}

              {/* Bowling JSON Box */}
              {rawBowling ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-4">
                  <div className="font-bold text-sm text-foreground border-b border-border/40 pb-2 flex items-center justify-between">
                    <span>{selectedFormatKey.toUpperCase()} Bowling Record</span>
                    <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-md">
                      {rawBowling.matches || 0} Matches / {rawBowling.innings || 0} Innings
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-muted-foreground">Wickets</div>
                      <div className="text-lg font-extrabold text-teal-600">{rawBowling.wickets ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Economy</div>
                      <div className="text-lg font-bold text-foreground">{rawBowling.econ ?? "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="text-lg font-bold text-foreground">{rawBowling.average || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Overs</div>
                      <div className="text-sm font-semibold text-foreground">{rawBowling.overs ?? "0.0"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Runs Conceded</div>
                      <div className="text-sm font-semibold text-foreground">{rawBowling.runs ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Best Innings</div>
                      <div className="text-sm font-semibold text-teal-600">{rawBowling.bestinning || "N/A"}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 text-muted-foreground text-center flex items-center justify-center">
                  No bowling data recorded for format {selectedFormatKey.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
