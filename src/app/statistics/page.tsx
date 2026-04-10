"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import type { UserStats } from "@/types";
import { StatsOverview } from "@/components/statistics/StatsOverview";
import { PersonalBests } from "@/components/statistics/PersonalBests";
import { RecentGames } from "@/components/statistics/RecentGames";

const emptyStats: UserStats = {
  totalGames: 0,
  byType: { sudoku: 0, killer: 0 },
  bestTimes: {},
  recentGames: [],
  currentStreak: 0,
  longestStreak: 0,
  averageTimes: {},
  totalPlayTime: 0,
};

export default function StatisticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient
      .get<UserStats>("/api/statistics")
      .then(setStats)
      .catch(() => setStats(emptyStats))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <main className="mx-auto max-w-2xl p-5">
      <div className="animate-fade-in mb-6 flex items-center gap-3">
        <Link href="/" className="btn-ghost flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4" /></svg>
          Menu
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Statistics</h1>
      </div>

      {!user ? (
        <div className="animate-fade-in-up glass rounded-2xl p-8 text-center">
          <p className="mb-4 text-sm text-slate-500">Sign in to view your game statistics.</p>
          <button className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white" onClick={() => setShowAuth(true)} type="button">
            Sign In / Register
          </button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : (
        <div className="animate-fade-in-up space-y-4" style={{ animationDelay: "0.05s" }}>
          <StatsOverview stats={stats} />
          <PersonalBests stats={stats} />
          <RecentGames stats={stats} />
        </div>
      )}
    </main>
  );
}
