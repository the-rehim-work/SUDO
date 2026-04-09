import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
  const auth = (await headers()).get("authorization");
  const scores = await prisma.score.findMany({
    where: { gameType: "sudoku", difficulty: "easy", mistakesEnabled: false },
    orderBy: [{ timeSeconds: "asc" }, { completedAt: "asc" }],
    take: 20,
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-3xl font-semibold">Leaderboard</h1>
      <p className="mb-3 text-sm text-slate-400">Auth header present: {auth ? "yes" : "no"}</p>
      <div className="space-y-2">
        {scores.map((score, index) => (
          <div className="rounded-lg bg-slate-800/60 px-4 py-3" key={`${score.id}`}>
            #{index + 1} {score.username} - {score.timeSeconds}s
          </div>
        ))}
      </div>
    </main>
  );
}
