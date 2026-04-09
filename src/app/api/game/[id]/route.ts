import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGameOwner } from "@/lib/route-helpers";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireGameOwner(request, Number(id));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { game } = result;
  return NextResponse.json({
    gameId: game.id,
    gameType: game.gameType,
    difficulty: game.difficulty,
    puzzle: JSON.parse(game.puzzle),
    currentState: JSON.parse(game.currentState),
    notes: JSON.parse(game.notes),
    cages: game.cages ? JSON.parse(game.cages) : undefined,
    timeSeconds: game.timeSeconds,
    isCompleted: game.isCompleted,
    mistakesEnabled: game.mistakesEnabled,
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireGameOwner(request, Number(id));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  if (result.game.isCompleted) return NextResponse.json({ error: "Game already completed" }, { status: 400 });

  const { currentState, notes, timeSeconds } = (await request.json()) as {
    currentState: number[][];
    notes: number[][][];
    timeSeconds: number;
  };

  await prisma.game.update({
    where: { id: result.game.id },
    data: {
      currentState: JSON.stringify(currentState),
      notes: JSON.stringify(notes),
      timeSeconds,
    },
  });

  return NextResponse.json({ success: true });
}
