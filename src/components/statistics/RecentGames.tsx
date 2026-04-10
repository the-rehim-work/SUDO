import type { UserStats } from "@/types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function RecentGames({ stats }: { stats: UserStats }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="mb-3 font-semibold" style={{ color: "var(--text-primary)" }}>Recent Games</h3>
      <div className="max-h-72 space-y-2 overflow-auto">
        {stats.recentGames.length === 0 && (
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>No games yet</div>
        )}
        {stats.recentGames.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--card-bg)" }}>
            <div>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {g.gameType === "killer" ? "Killer" : "Classic"}{" "}
                {g.difficulty.charAt(0).toUpperCase() + g.difficulty.slice(1)}
              </span>
              {g.mistakesEnabled && (
                <span className="ml-2 text-xs text-rose-400">mistakes</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                {formatTime(g.timeSeconds)}
              </span>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                {timeAgo(g.completedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
