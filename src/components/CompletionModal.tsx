import Link from "next/link";
import type { CompletionResult } from "@/types";

interface CompletionModalProps {
  result: CompletionResult;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function CompletionModal({ result }: CompletionModalProps) {
  return (
    <div className="animate-fade-in fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="animate-scale-in glass-strong mx-4 w-full max-w-sm rounded-2xl p-6">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Puzzle Complete!</h2>
          {result.personalBest && (
            <span className="mt-1 inline-block rounded-lg bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
              New Personal Best!
            </span>
          )}
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--card-bg)" }}>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Time</div>
            <div className="mt-1 font-mono text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatTime(result.timeSeconds)}
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--card-bg)" }}>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Rank</div>
            <div className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              #{result.rank ?? "-"}
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--card-bg)" }}>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Top</div>
            <div className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {result.percentile ?? "-"}%
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link className="btn-primary flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white" href="/game">
            New Game
          </Link>
          <Link className="btn-accent flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white" href="/leaderboard">
            Leaderboard
          </Link>
          <Link className="btn-ghost flex-1 rounded-xl py-2.5 text-center text-sm font-semibold" href="/" style={{ color: "var(--text-secondary)" }}>
            Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
