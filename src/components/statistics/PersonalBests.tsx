import type { UserStats } from "@/types";

export function PersonalBests({ stats }: { stats: UserStats }) {
  const items = Object.entries(stats.bestTimes);
  return (
    <div className="rounded bg-slate-800/60 p-3">
      <h3 className="mb-2 font-semibold">Personal Bests</h3>
      <div className="space-y-1 text-sm">
        {items.length ? items.map(([k, v]) => <div key={k}>{k}: {v}s</div>) : <div>No data</div>}
      </div>
    </div>
  );
}
