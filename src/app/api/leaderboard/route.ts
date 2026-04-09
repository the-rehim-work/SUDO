import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameType = searchParams.get("gameType") || "sudoku";
  const difficulty = searchParams.get("difficulty") || "easy";
  const mistakesEnabled = searchParams.get("mistakesEnabled") === "true";
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

  const where = { gameType, difficulty, mistakesEnabled };
  const scores = await prisma.score.findMany({
    where,
    orderBy: [{ timeSeconds: "asc" }, { completedAt: "asc" }],
    take: limit,
    select: { username: true, timeSeconds: true, completedAt: true, userId: true },
  });

  const authUser = getAuthUser(request);
  let userRank: number | null = null;
  if (authUser) {
    const best = await prisma.score.findFirst({
      where: { ...where, userId: authUser.userId },
      orderBy: { timeSeconds: "asc" },
    });
    if (best) {
      const better = await prisma.score.count({ where: { ...where, timeSeconds: { lt: best.timeSeconds } } });
      userRank = better + 1;
    }
  }

  return NextResponse.json({
    entries: scores.map((s, index) => ({
      rank: index + 1,
      username: s.username,
      timeSeconds: s.timeSeconds,
      completedAt: s.completedAt.toISOString(),
      isCurrentUser: authUser ? s.userId === authUser.userId : false,
    })),
    userRank,
  });
}
