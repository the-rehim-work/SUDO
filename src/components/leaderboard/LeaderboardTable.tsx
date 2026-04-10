import type { LeaderboardEntry } from "@/types";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          className={`flex items-center gap-4 rounded-xl px-4 py-3 ${entry.isCurrentUser ? "border border-cyan-500/30 bg-cyan-500/10" : "glass"}`}
          key={`${entry.rank}-${entry.username}-${entry.completedAt}`}
        >
          <span className="w-8 font-mono text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            {entry.rank}
          </span>
          <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
            {entry.username}
          </span>
          <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
            {formatTime(entry.timeSeconds)}
          </span>
        </div>
      ))}
    </div>
  );
}
