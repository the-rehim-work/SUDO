"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { apiClient } from "@/lib/api-client";
import type { Difficulty, GameMode, LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const [mode, setMode] = useState<GameMode>("sudoku");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mistakesEnabled, setMistakesEnabled] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get<{ entries: LeaderboardEntry[] }>(`/api/leaderboard?gameType=${mode}&difficulty=${difficulty}&mistakesEnabled=${mistakesEnabled}`)
      .then((res) => setEntries(res.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [mode, difficulty, mistakesEnabled]);

  return (
    <main className="mx-auto max-w-2xl p-5">
      <div className="animate-fade-in mb-6 flex items-center gap-3">
        <Link href="/" className="btn-ghost flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4" /></svg>
          Menu
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Leaderboard</h1>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <LeaderboardFilters
          difficulty={difficulty}
          mistakesEnabled={mistakesEnabled}
          mode={mode}
          onChange={(v) => { setMode(v.mode); setDifficulty(v.difficulty); setMistakesEnabled(v.mistakesEnabled); }}
        />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : entries.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-slate-500">
            No scores yet for this category. Be the first!
          </div>
        ) : (
          <LeaderboardTable entries={entries} />
        )}
      </div>
    </main>
  );
}
