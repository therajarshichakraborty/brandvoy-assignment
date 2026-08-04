"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Trophy } from "lucide-react";
import { useMatchDetail, Innings } from "@/hooks/use-api";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;

  const { data: match, loading, error } = useMatchDetail(matchId);

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-6 py-6">
        <Link href="/matches" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600">
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
  const mInnings = match.inningsList || match.innings;
  const tossWinnerName = typeof match.tossWinner === "object" ? match.tossWinner?.title : match.tossWinner;

  return (
    <div className="space-y-6 pb-12">
      <Link href="/matches" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Matches
      </Link>

      {/* Match Banner */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/60 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{mDate ? new Date(mDate).toLocaleDateString() : "Scheduled Match"}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {match.venue || "IPL Venue"}
            </span>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            Match #{mId}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">{match.title || `Match #${mId}`}</h1>
          {match.result && (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <Trophy className="w-4 h-4" />
              {match.result}
            </div>
          )}
        </div>

        {/* Toss & Info */}
        {(tossWinnerName || match.statusNote) && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-muted-foreground">
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

      {/* Innings Summaries */}
      {mInnings && mInnings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Innings Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mInnings.map((inn: Innings, idx: number) => (
              <div key={inn.id || idx} className="bg-card rounded-2xl p-5 border border-border/60 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold text-sm text-foreground">Innings {inn.inningsNumber}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {inn.battingTeam?.title ? inn.battingTeam.title : `Team #${inn.battingTeamId}`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Bowling Team:{" "}
                    <span className="font-semibold text-foreground">
                      {inn.bowlingTeam?.title ? inn.bowlingTeam.title : `#${inn.bowlingTeamId}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
