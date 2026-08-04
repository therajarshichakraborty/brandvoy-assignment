"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Search, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { usePlayers } from "@/hooks/use-api";

export default function PlayersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [country] = useState("");

  const { data: players, meta, loading, error } = usePlayers({
    page,
    limit: 16,
    search,
    role,
    country,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            IPL Players Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Searchable catalog of players, roles, playing styles, and national origin
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search player name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Role selector */}
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-card border border-border/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Roles</option>
            <option value="bat">Batsman</option>
            <option value="bowl">Bowler</option>
            <option value="all">All Rounder</option>
            <option value="wk">Wicket Keeper</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-border/40" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
          Failed to load players: {error}
        </div>
      )}

      {/* Players List */}
      {!loading && !error && players && (
        <>
          {players.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/60 space-y-2">
              <p className="text-base font-semibold text-foreground">No players match search parameters</p>
              <p className="text-xs text-muted-foreground">Try clearing filters or searching another keyword</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player) => (
                <Link
                  key={player.pid}
                  href={`/players/${player.pid}`}
                  className="group bg-card rounded-2xl p-4 border border-border/60 hover:border-blue-500/50 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {player.shortName?.substring(0, 2) || player.title?.substring(0, 2)}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {player.country || "Intl"}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                      {player.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {player.playingRole || "Cricket Player"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-medium text-blue-600">
                    <span>Profile & Stats</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
                <span className="font-semibold text-foreground">{meta.totalPages}</span> ({meta.total} players)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-slate-100 transition-colors"
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
