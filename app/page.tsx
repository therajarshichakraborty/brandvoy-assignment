"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Trophy, 
  TrendingUp, 
  Shield, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Database, 
  Zap,
  BarChart3,
  Award
} from "lucide-react";
import { useBattingLeaders, useBowlingLeaders, useTeams, useMatches } from "@/hooks/use-api";
import { BattingChart } from "@/components/charts/batting-chart";
import { BowlingChart } from "@/components/charts/bowling-chart";

export default function HomePage() {
  const [seasonMode, setSeasonMode] = useState<"all" | "recent">("all");
  const [focusArea, setFocusArea] = useState<"batting" | "bowling" | "teams" | "players">("batting");

  const { data: battingLeaders, loading: battingLoading } = useBattingLeaders("runs", 10);
  const { data: bowlingLeaders, loading: bowlingLoading } = useBowlingLeaders("wickets", 10);
  const { data: teamsData, meta: teamsMeta } = useTeams(1, 20);
  const { meta: matchesMeta } = useMatches({ page: 1, limit: 1 });

  const topBatsman = battingLeaders?.[0];
  const topBowler = bowlingLeaders?.[0];

  const totalMatchesCount = matchesMeta?.total ?? 74;
  const totalTeamsCount = teamsMeta?.total ?? 10;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Hero Card (2 cols) */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 sm:p-8 border border-border/60 shadow-xs space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              <Sparkles className="w-3.5 h-3.5" />
              Minimal white + blue dashboard
            </span>

            {/* Tournament Health Box */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Tournament health
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">92%</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-xs space-y-0.5">
                <div className="text-muted-foreground">Matches <span className="font-semibold text-foreground">{totalMatchesCount}</span></div>
                <div className="text-muted-foreground">Players <span className="font-semibold text-foreground">247</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              A polished IPL home screen built for fast scanning and premium clarity.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Track team form, compare batting and bowling leaders, and jump into match context without visual noise. Designed to feel crisp, modern, and highly trustworthy.
            </p>
          </div>

          {/* 3 Stat KPI Cards inside Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Top batting runs</div>
              <div className="text-2xl font-bold text-foreground">
                {topBatsman ? topBatsman.totalRuns : "812"}
              </div>
              <div className="text-[11px] text-slate-500">
                {topBatsman ? `${topBatsman.playerShortName} (Leader pace)` : "Leader pace across the season"}
              </div>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1 relative">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Best economy</span>
                <Zap className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {topBowler ? topBowler.economy : "6.8"}
              </div>
              <div className="text-[11px] text-slate-500">
                {topBowler ? `${topBowler.playerShortName} (Bowling control)` : "Bowling control under pressure"}
              </div>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1 relative">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Points table</span>
                <Trophy className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {totalTeamsCount}
              </div>
              <div className="text-[11px] text-slate-500">
                Teams competing for playoff spots
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters Sidebar (1 col) */}
        <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Quick filters</h2>
              <p className="text-xs text-muted-foreground">Refine the dashboard view</p>
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Season mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Season mode</span>
              <span className="text-[10px] text-slate-400">Auto</span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setSeasonMode("all")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  seasonMode === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All matches
              </button>
              <button
                onClick={() => setSeasonMode("recent")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  seasonMode === "recent"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recent form
              </button>
            </div>
          </div>

          {/* Focus Area */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Focus area</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["batting", "bowling", "teams", "players"] as const).map((area) => (
                <button
                  key={area}
                  onClick={() => setFocusArea(area)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-capitalize transition-all text-left ${
                    focusArea === area
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-muted-foreground hover:border-slate-300"
                  }`}
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick link */}
          <div className="pt-2">
            <Link
              href={
                focusArea === "batting" || focusArea === "bowling"
                  ? "/stats"
                  : `/${focusArea}`
              }
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Explore {focusArea} directory
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Insights & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Insights (2 cols) */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Featured insights</h2>
              <p className="text-xs text-muted-foreground">A clean entry point into the data model</p>
            </div>
            <Link
              href="/stats"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors self-start sm:self-auto"
            >
              Open leaderboard
            </Link>
          </div>

          {/* Interactive Chart Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {focusArea === "bowling" ? "Bowling Leaders" : "Batting Leaders"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {focusArea === "bowling" ? "Wickets & Economy rate" : "Runs, strike rate, boundaries"}
                  </p>
                </div>
              </div>

              {topBatsman && (
                <div className="text-right text-xs">
                  <span className="text-muted-foreground">Top scorer: </span>
                  <span className="font-bold text-foreground">{topBatsman.playerTitle}</span>
                </div>
              )}
            </div>

            {/* Render Recharts chart based on focusArea */}
            <div className="pt-2">
              {focusArea === "bowling" ? (
                <BowlingChart data={bowlingLeaders || []} />
              ) : (
                <BattingChart data={battingLeaders || []} />
              )}
            </div>
          </div>
        </div>

        {/* Data Architecture Card (1 col) */}
        <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Data architecture</h2>
              <p className="text-xs text-muted-foreground">Built for clean API-driven delivery</p>
            </div>
            <Database className="w-4 h-4 text-blue-600" />
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  NT
                </div>
                Normalized tables
              </div>
              <p className="text-muted-foreground leading-normal">
                Teams, players, matches, innings, and deliveries stored in normalized relational schemas.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Award className="w-4 h-4 text-emerald-600" />
                Derived leaderboards
              </div>
              <p className="text-muted-foreground leading-normal">
                Computed dynamically on-demand using SQL GROUP BY and ORDER BY aggregations without stored redundancy.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/api-docs"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-medium transition-colors"
              >
                Inspect OpenAPI Spec & Endpoints
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
