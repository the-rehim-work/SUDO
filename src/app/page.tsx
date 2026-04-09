import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-5xl font-bold">SUDOKU</h1>
      <p className="text-slate-300">Next.js migration baseline is ready.</p>
      <div className="flex gap-3">
        <Link className="rounded-lg bg-cyan-600 px-4 py-2" href="/game">
          Game
        </Link>
        <Link className="rounded-lg bg-violet-600 px-4 py-2" href="/leaderboard">
          Leaderboard
        </Link>
        <Link className="rounded-lg bg-slate-700 px-4 py-2" href="/statistics">
          Statistics
        </Link>
      </div>
    </main>
  );
}
