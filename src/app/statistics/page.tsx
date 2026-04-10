"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
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
  const [stats, setStats] = useState<UserStats>(emptyStats);

  useEffect(() => {
    apiClient.get<UserStats>("/api/statistics").then(setStats).catch(() => setStats(emptyStats));
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-3xl font-semibold">Statistics</h1>
      <div className="space-y-3">
        <StatsOverview stats={stats} />
        <PersonalBests stats={stats} />
        <RecentGames stats={stats} />
      </div>
    </main>
  );
}
