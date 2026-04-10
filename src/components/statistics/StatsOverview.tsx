import type { UserStats } from "@/types";

export function StatsOverview({ stats }: { stats: UserStats }) {
  const best = Object.values(stats.bestTimes);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded bg-slate-800/60 p-3">Total: {stats.totalGames}</div>
      <div className="rounded bg-slate-800/60 p-3">Classic: {stats.byType.sudoku}</div>
      <div className="rounded bg-slate-800/60 p-3">Killer: {stats.byType.killer}</div>
      <div className="rounded bg-slate-800/60 p-3">Best: {best.length ? `${Math.min(...best)}s` : "-"}</div>
    </div>
  );
}
