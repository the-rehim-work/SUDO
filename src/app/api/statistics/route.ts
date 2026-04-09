import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import type { UserStats } from "@/types";

function streakMetrics(dates: Date[]): { currentStreak: number; longestStreak: number } {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };
  const daySet = new Set(dates.map((d) => d.toISOString().slice(0, 10)));
  const sorted = [...daySet].sort();

  let longest = 1;
  let currentRun = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1]);
    const next = new Date(sorted[i]);
    const diffDays = Math.round((next.getTime() - prev.getTime()) / 86400000);
    currentRun = diffDays === 1 ? currentRun + 1 : 1;
    if (currentRun > longest) longest = currentRun;
  }

  let current = 0;
  const now = new Date();
  for (let i = 0; i < 3650; i += 1) {
    const probe = new Date(now);
    probe.setDate(now.getDate() - i);
    const key = probe.toISOString().slice(0, 10);
    if (daySet.has(key)) current += 1;
    else break;
  }

  return { currentStreak: current, longestStreak: longest };
}

export async function GET(request: Request) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const games = await prisma.game.findMany({
    where: { userId: authUser.userId, isCompleted: true },
    orderBy: { completedAt: "desc" },
  });

  const bestTimes: Record<string, number> = {};
  const averageBuckets = new Map<string, number[]>();
  for (const game of games) {
    const key = `${game.gameType}_${game.difficulty}_${game.mistakesEnabled}`;
    if (!(key in bestTimes) || game.timeSeconds < bestTimes[key]) bestTimes[key] = game.timeSeconds;

    const avgKey = `${game.gameType}_${game.difficulty}`;
    averageBuckets.set(avgKey, [...(averageBuckets.get(avgKey) || []), game.timeSeconds]);
  }

  const averageTimes: Record<string, number> = {};
  for (const [key, values] of averageBuckets) {
    averageTimes[key] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  const streak = streakMetrics(games.map((g) => g.completedAt).filter(Boolean) as Date[]);
  const stats: UserStats = {
    totalGames: games.length,
    byType: {
      sudoku: games.filter((g) => g.gameType === "sudoku").length,
      killer: games.filter((g) => g.gameType === "killer").length,
    },
    bestTimes,
    recentGames: games.slice(0, 20).map((g) => ({
      id: g.id,
      gameType: g.gameType as "sudoku" | "killer",
      difficulty: g.difficulty as "easy" | "medium" | "hard" | "expert",
      timeSeconds: g.timeSeconds,
      mistakesEnabled: g.mistakesEnabled,
      completedAt: g.completedAt?.toISOString() || new Date().toISOString(),
    })),
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    averageTimes,
    totalPlayTime: games.reduce((acc, g) => acc + g.timeSeconds, 0),
  };

  return NextResponse.json(stats);
}
