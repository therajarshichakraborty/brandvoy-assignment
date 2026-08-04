"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { useBattingLeaders, useBowlingLeaders, BattingLeader, BowlingLeader } from "@/hooks/use-api";
import { BattingChart } from "@/components/charts/batting-chart";
import { BowlingChart } from "@/components/charts/bowling-chart";

export default function StatsPage() {
  const [tab, setTab] = useState<"batting" | "bowling">("batting");
  const [battingMetric, setBattingMetric] = useState("runs");
  const [bowlingMetric, setBowlingMetric] = useState("wickets");
  const [page, setPage] = useState(1);
  const { data: battingData, meta: battingMeta, loading: battingLoading } = useBattingLeaders(battingMetric, 10, page);
  const { data: bowlingData, meta: bowlingMeta, loading: bowlingLoading } = useBowlingLeaders(bowlingMetric, 10, page);

  const currentMeta = tab === "batting" ? battingMeta : bowlingMeta;
  const isLoading = tab === "batting" ? battingLoading : bowlingLoading;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            IPL Player Stats & Leaderboards
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dynamic SQL aggregations for batting and bowling performance metrics
          </p>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setTab("batting");
              setPage(1);
            }}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              tab === "batting"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Batting Leaders
          </button>
          <button
            onClick={() => {
              setTab("bowling");
              setPage(1);
            }}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              tab === "bowling"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bowling Leaders
          </button>
        </div>
      </div>

      {/* Visual Analytics Chart Card */}
      <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Trophy className="w-4 h-4 text-blue-600" />
            Visual Ranking Comparison (Top Performers)
          </div>

          {/* Metric Selector */}
          {tab === "batting" ? (
            <select
              value={battingMetric}
              onChange={(e) => setBattingMetric(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-slate-50 border border-border/60 text-xs font-medium focus:outline-none"
            >
              <option value="runs">Most Runs</option>
              <option value="average">Highest Average</option>
              <option value="strikeRate">Highest Strike Rate</option>
              <option value="fours">Most Fours</option>
              <option value="sixes">Most Sixes</option>
            </select>
          ) : (
            <select
              value={bowlingMetric}
              onChange={(e) => setBowlingMetric(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-slate-50 border border-border/60 text-xs font-medium focus:outline-none"
            >
              <option value="wickets">Most Wickets</option>
              <option value="economy">Best Economy Rate</option>
              <option value="strikeRate">Best Strike Rate</option>
              <option value="maidens">Most Maidens</option>
            </select>
          )}
        </div>

        <div className="pt-2">
          {tab === "batting" ? (
            <BattingChart data={battingData || []} />
          ) : (
            <BowlingChart data={bowlingData || []} />
          )}
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/40 font-bold text-sm text-foreground flex items-center justify-between">
          <span>{tab === "batting" ? "Batting Leaderboard" : "Bowling Leaderboard"}</span>
          <span className="text-xs font-normal text-muted-foreground">
            Sorted by metric: <strong className="text-blue-600 capitalize">{tab === "batting" ? battingMetric : bowlingMetric}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border/40 text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4 text-center">Innings</th>
                  {tab === "batting" ? (
                    <>
                      <th className="py-3 px-4 text-right">Runs</th>
                      <th className="py-3 px-4 text-right">Average</th>
                      <th className="py-3 px-4 text-right">Strike Rate</th>
                      <th className="py-3 px-4 text-right">4s / 6s</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4 text-right">Wickets</th>
                      <th className="py-3 px-4 text-right">Economy</th>
                      <th className="py-3 px-4 text-right">Maidens</th>
                      <th className="py-3 px-4 text-right">Strike Rate</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tab === "batting"
                  ? battingData?.map((item: BattingLeader, idx: number) => (
                      <tr key={item.playerId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-400">
                          {(page - 1) * 10 + idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          <Link href={`/players/${item.playerId}`} className="hover:text-blue-600">
                            {item.playerTitle || item.playerShortName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{item.country || "Intl"}</td>
                        <td className="py-3.5 px-4 text-center text-muted-foreground">{item.totalInnings}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-blue-600 text-sm">{item.totalRuns}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-foreground">{item.average}</td>
                        <td className="py-3.5 px-4 text-right text-muted-foreground">{item.strikeRate}</td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{item.totalFours} / {item.totalSixes}</td>
                      </tr>
                    ))
                  : bowlingData?.map((item: BowlingLeader, idx: number) => (
                      <tr key={item.playerId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-400">
                          {(page - 1) * 10 + idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          <Link href={`/players/${item.playerId}`} className="hover:text-blue-600">
                            {item.playerTitle || item.playerShortName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{item.country || "Intl"}</td>
                        <td className="py-3.5 px-4 text-center text-muted-foreground">{item.totalInnings}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-teal-600 text-sm">{item.totalWickets}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-foreground">{item.economy}</td>
                        <td className="py-3.5 px-4 text-right text-muted-foreground">{item.totalMaidens}</td>
                        <td className="py-3.5 px-4 text-right text-slate-500">{item.strikeRate}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {currentMeta && currentMeta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/40 text-xs">
            <span className="text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentMeta.page}</span> of{" "}
              <span className="font-semibold text-foreground">{currentMeta.totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= currentMeta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
