"use client";

import { useState } from "react";
import Link from "next/link";
import { Swords, Calendar, ChevronLeft, ChevronRight, ArrowRight, Shield } from "lucide-react";
import { useMatches, useTeams } from "@/hooks/use-api";

export default function MatchesPage() {
  const [page, setPage] = useState(1);
  const [teamId, setTeamId] = useState("");

  const { data: matches, meta, loading, error } = useMatches({ page, limit: 12, teamId });
  const { data: teams } = useTeams(1, 30);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Swords className="w-6 h-6 text-blue-600" />
            IPL Match Schedule & Results
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse complete match summaries, venues, toss details, and scorecards
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={teamId}
            onChange={(e) => {
              setTeamId(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-card border border-border/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Teams</option>
            {teams?.map((team) => (
              <option key={team.tid} value={team.tid}>
                {team.title} ({team.abbr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-border/40" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-sm">
          Failed to load matches: {error}
        </div>
      )}

      {/* Matches Grid */}
      {!loading && !error && matches && (
        <>
          {matches.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/60 space-y-2">
              <p className="text-base font-semibold text-foreground">No matches found</p>
              <p className="text-xs text-muted-foreground">Try clearing your team filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <Link
                  key={match.matchId}
                  href={`/matches/${match.matchId}`}
                  className="group bg-card rounded-2xl p-5 border border-border/60 hover:border-blue-500/50 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {match.date ? new Date(match.date).toLocaleDateString() : "Match Date"}
                    </span>
                    <span className="font-semibold text-slate-500">ID #{match.matchId}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      {match.title || `Match #${match.matchId}`}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      Venue: {match.venue || "IPL Stadium"}
                    </div>
                    {match.result && (
                      <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {match.result}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-medium text-blue-600">
                    <span>Full scorecard & breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border/60 text-sm">
              <span className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{meta.page}</span> of{" "}
                <span className="font-semibold text-foreground">{meta.totalPages}</span> ({meta.total} matches)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
