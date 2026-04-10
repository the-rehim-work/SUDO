import type { UserStats } from "@/types";

export function StatsOverview({ stats }: { stats: UserStats }) {
  const best = Object.values(stats.bestTimes);
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const cards = [
    { label: "Total", value: String(stats.totalGames) },
    { label: "Classic", value: String(stats.byType.sudoku) },
    { label: "Killer", value: String(stats.byType.killer) },
    { label: "Best", value: best.length ? formatTime(Math.min(...best)) : "-" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="glass rounded-xl p-4">
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{c.label}</div>
          <div className="mt-1 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
