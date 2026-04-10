import type { LeaderboardEntry } from "@/types";

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div className={`flex items-center gap-4 rounded px-4 py-2 ${entry.isCurrentUser ? "bg-cyan-700/40" : "bg-slate-800/50"}`} key={`${entry.rank}-${entry.username}-${entry.completedAt}`}>
          <span className="w-8">{entry.rank}</span>
          <span className="flex-1">{entry.username}</span>
          <span>{entry.timeSeconds}s</span>
        </div>
      ))}
    </div>
  );
}
