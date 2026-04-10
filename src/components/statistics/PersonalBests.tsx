import type { UserStats } from "@/types";

function parseKey(key: string): string {
  const parts = key.split("_");
  const type = parts[0] === "killer" ? "Killer" : "Classic";
  const diff = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";
  const mistakes = parts[2] === "true" ? " (Mistakes)" : "";
  return `${type} ${diff}${mistakes}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function PersonalBests({ stats }: { stats: UserStats }) {
  const items = Object.entries(stats.bestTimes);
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="mb-3 font-semibold" style={{ color: "var(--text-primary)" }}>Personal Bests</h3>
      <div className="space-y-2">
        {items.length ? items.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--card-bg)" }}>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{parseKey(k)}</span>
            <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatTime(v)}</span>
          </div>
        )) : (
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>No data</div>
        )}
      </div>
    </div>
  );
}
