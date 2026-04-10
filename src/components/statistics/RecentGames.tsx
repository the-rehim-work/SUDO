import type { UserStats } from "@/types";

export function RecentGames({ stats }: { stats: UserStats }) {
  return (
    <div className="rounded bg-slate-800/60 p-3">
      <h3 className="mb-2 font-semibold">Recent Games</h3>
      <div className="max-h-72 space-y-1 overflow-auto text-sm">
        {stats.recentGames.map((g) => (
          <div className="rounded bg-slate-900/50 px-2 py-1" key={g.id}>
            {g.gameType} {g.difficulty} {g.mistakesEnabled ? "mistakes" : "normal"} - {g.timeSeconds}s
          </div>
        ))}
      </div>
    </div>
  );
}
