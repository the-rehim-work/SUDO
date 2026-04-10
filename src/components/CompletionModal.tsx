import Link from "next/link";
import type { CompletionResult } from "@/types";

interface CompletionModalProps {
  result: CompletionResult;
}

export function CompletionModal({ result }: CompletionModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-sm rounded-xl bg-slate-900 p-4">
        <h2 className="mb-2 text-xl">Puzzle Complete</h2>
        <p className="text-sm">Time: {result.timeSeconds}s</p>
        <p className="text-sm">Rank: {result.rank ?? "-"}</p>
        <p className="text-sm">Percentile: {result.percentile ?? "-"}%</p>
        <p className="text-sm">{result.personalBest ? "New personal best!" : ""}</p>
        <div className="mt-3 flex gap-2">
          <Link className="rounded bg-cyan-600 px-3 py-2" href="/game">New Game</Link>
          <Link className="rounded bg-violet-600 px-3 py-2" href="/leaderboard">Leaderboard</Link>
          <Link className="rounded bg-slate-700 px-3 py-2" href="/">Menu</Link>
        </div>
      </div>
    </div>
  );
}
