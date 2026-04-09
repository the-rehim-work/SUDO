import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGameOwner } from "@/lib/route-helpers";
import { validateCompletion } from "@/lib/validator";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireGameOwner(request, Number(id));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  if (result.game.isCompleted) return NextResponse.json({ error: "Game already completed" }, { status: 400 });

  const { currentState, timeSeconds } = (await request.json()) as { currentState: number[][]; timeSeconds: number };
  const solution = JSON.parse(result.game.solution) as number[][];
  const valid = validateCompletion(currentState, solution);
  if (!valid) return NextResponse.json({ valid: false, timeSeconds }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.game.update({
      where: { id: result.game.id },
      data: {
        currentState: JSON.stringify(currentState),
        timeSeconds,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
    await tx.score.create({
      data: {
        userId: result.authUser.userId,
        username: result.authUser.username,
        gameType: result.game.gameType,
        difficulty: result.game.difficulty,
        timeSeconds,
        mistakesEnabled: result.game.mistakesEnabled,
      },
    });
  });

  const where = {
    gameType: result.game.gameType,
    difficulty: result.game.difficulty,
    mistakesEnabled: result.game.mistakesEnabled,
  };
  const total = await prisma.score.count({ where });
  const better = await prisma.score.count({ where: { ...where, timeSeconds: { lt: timeSeconds } } });
  const userBest = await prisma.score.findFirst({
    where: { ...where, userId: result.authUser.userId },
    orderBy: { timeSeconds: "asc" },
  });

  return NextResponse.json({
    valid: true,
    timeSeconds,
    rank: better + 1,
    personalBest: userBest?.timeSeconds === timeSeconds,
    percentile: total > 0 ? Math.round(((total - (better + 1)) / total) * 100) : 0,
  });
}
