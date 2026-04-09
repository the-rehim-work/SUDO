import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { generateSudoku } from "@/lib/sudoku-generator";
import { generateKillerSudoku } from "@/lib/killer-generator";
import type { Difficulty, GameMode } from "@/types";

export async function POST(request: Request) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { gameType, difficulty, mistakesEnabled = false } = (await request.json()) as {
    gameType: GameMode;
    difficulty: Difficulty;
    mistakesEnabled?: boolean;
  };

  if (!["sudoku", "killer"].includes(gameType) || !["easy", "medium", "hard", "expert"].includes(difficulty)) {
    return NextResponse.json({ error: "Invalid game configuration" }, { status: 400 });
  }

  await prisma.game.deleteMany({ where: { userId: authUser.userId, isCompleted: false } });
  const generated = gameType === "killer" ? generateKillerSudoku(difficulty) : generateSudoku(difficulty);
  const cages = "cages" in generated ? generated.cages : undefined;
  const notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [] as number[]));

  const game = await prisma.game.create({
    data: {
      userId: authUser.userId,
      gameType,
      difficulty,
      puzzle: JSON.stringify(generated.puzzle),
      solution: JSON.stringify(generated.solution),
      currentState: JSON.stringify(generated.puzzle),
      notes: JSON.stringify(notes),
      cages: cages ? JSON.stringify(cages) : null,
      mistakesEnabled,
    },
  });

  return NextResponse.json({
    gameId: game.id,
    puzzle: generated.puzzle,
    cages,
    gameType,
    difficulty,
    mistakesEnabled,
  });
}
