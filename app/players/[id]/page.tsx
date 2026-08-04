"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, User, Globe, Award, Target, Zap, Activity } from "lucide-react";
import { usePlayerDetail } from "@/hooks/use-api";

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const resolvedParams = use(params);
  const playerId = resolvedParams.id;

  const { data: responseData, loading, error } = usePlayerDetail(playerId);

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  if (error || !responseData) {
    return (
      <div className="space-y-6 py-6">
        <Link href="/players" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600">
          <ArrowLeft className="w-4 h-4" /> Back to Players
        </Link>
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-sm">
          Player profile not found: {error}
        </div>
      </div>
    );
  }

  const player = responseData.player || responseData;
  const careerStats = responseData.careerStats;

  return (
    <div className="space-y-6 pb-12">
      <Link href="/players" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Players
      </Link>

      {/* Bio Header */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-extrabold text-blue-600 text-xl">
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

        <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
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
            Career Stats & Performance Snapshot
          </h2>

          {careerStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Batting Stats Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between font-bold text-sm text-blue-600 border-b border-border/40 pb-2">
                  <span>Batting Stats</span>
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
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between font-bold text-sm text-teal-600 border-b border-border/40 pb-2">
                  <span>Bowling Stats</span>
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
    </div>
  );
}
