"use client";

import { useEffect, useState } from "react";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { apiClient } from "@/lib/api-client";
import type { Difficulty, GameMode, LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const [mode, setMode] = useState<GameMode>("sudoku");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mistakesEnabled, setMistakesEnabled] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    apiClient
      .get<{ entries: LeaderboardEntry[] }>(`/api/leaderboard?gameType=${mode}&difficulty=${difficulty}&mistakesEnabled=${mistakesEnabled}`)
      .then((res) => setEntries(res.entries))
      .catch(() => setEntries([]));
  }, [mode, difficulty, mistakesEnabled]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-3xl font-semibold">Leaderboard</h1>
      <LeaderboardFilters
        difficulty={difficulty}
        mistakesEnabled={mistakesEnabled}
        mode={mode}
        onChange={(v) => {
          setMode(v.mode);
          setDifficulty(v.difficulty);
          setMistakesEnabled(v.mistakesEnabled);
        }}
      />
      <LeaderboardTable entries={entries} />
    </main>
  );
}
