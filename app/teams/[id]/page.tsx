"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { useTeamDetail, usePlayers } from "@/hooks/use-api";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.id;

  const { data: team, loading: teamLoading, error: teamError } = useTeamDetail(teamId);
  const { data: players, loading: playersLoading } = usePlayers({ teamId, limit: 50 });

  if (teamLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="space-y-6 py-6">
        <Link href="/teams" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600">
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </Link>
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
          Team not found or error loading team details: {teamError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Link href="/teams" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Teams
      </Link>

      {/* Team Header Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center font-extrabold text-blue-600 text-xl">
            {team.abbr || team.title?.substring(0, 3).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{team.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {team.altName} • {team.country || "India"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-border/60 text-center">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Team ID</div>
            <div className="text-sm font-bold text-foreground">#{team.tid}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-border/60 text-center">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Squad Size</div>
            <div className="text-sm font-bold text-blue-600">{players ? players.length : 0}</div>
          </div>
        </div>
      </div>

      {/* Squad Roster */}
      <div className="bg-card rounded-2xl p-6 border border-border/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Squad Roster
          </h2>
          <span className="text-xs text-muted-foreground">
            {players ? `${players.length} registered players` : "Loading squad..."}
          </span>
        </div>

        {playersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {players.map((player) => (
              <Link
                key={player.pid}
                href={`/players/${player.pid}`}
                className="p-4 rounded-xl border border-border/60 hover:border-blue-500/50 hover:shadow-xs transition-all space-y-1 block"
              >
                <div className="font-semibold text-sm text-foreground line-clamp-1">
                  {player.title}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{player.playingRole || "Player"}</span>
                  <span className="text-[11px] font-medium text-slate-500">{player.nationality || player.country}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">
            No roster data currently associated with this team ID.
          </p>
        )}
      </div>
    </div>
  );
}
