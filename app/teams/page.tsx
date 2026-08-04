"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTeams } from "@/hooks/use-api";

export default function TeamsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: teams, meta, loading, error } = useTeams(page, 12, search);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            IPL Teams Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse all official IPL franchises, logos, and team rosters
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-border/40" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
          Failed to load teams: {error}
        </div>
      )}

      {/* Teams Grid */}
      {!loading && !error && teams && (
        <>
          {teams.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/60 space-y-2">
              <p className="text-base font-semibold text-foreground">No teams found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teams.map((team) => (
                <Link
                  key={team.tid}
                  href={`/teams/${team.tid}`}
                  className="group bg-card rounded-2xl p-5 border border-border/60 hover:border-blue-500/50 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center font-extrabold text-blue-600 dark:text-blue-400 text-base">
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.abbr} className="w-8 h-8 object-contain" />
                      ) : (
                        team.abbr || team.title?.substring(0, 3).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      ID #{team.tid}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                      {team.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {team.altName || team.country || "IPL Franchise"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                    <span>View roster & stats</span>
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
                <span className="font-semibold text-foreground">{meta.totalPages}</span> ({meta.total} teams)
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
