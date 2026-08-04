"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Trophy, 
  Home, 
  Swords, 
  BarChart3, 
  Shield, 
  Users,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Matches", href: "/matches", icon: Swords },
  { label: "Stats", href: "/stats", icon: BarChart3 },
  { label: "Teams", href: "/teams", icon: Shield },
  { label: "Players", href: "/players", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  IPL Pulse
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  2026 Season
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Clean cricket intelligence for teams, players, and match momentum.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Live Data Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live data synced
            </div>

            {/* Explore Stats Button */}
            <Link
              href="/stats"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-600/20"
            >
              Explore stats
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Theme Toggle */}
            <div className="pl-1">
              <AnimatedThemeToggler />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = 
              item.href === "/" 
                ? pathname === "/" 
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
