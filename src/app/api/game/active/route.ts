import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  const authUser = getAuthUser(request);
  if (!authUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const game = await prisma.game.findFirst({
    where: { userId: authUser.userId, isCompleted: false },
    orderBy: { startedAt: "desc" },
  });

  if (!game) return NextResponse.json({ game: null });
  return NextResponse.json({
    game: {
      id: game.id,
      gameType: game.gameType,
      difficulty: game.difficulty,
      timeSeconds: game.timeSeconds,
      mistakesEnabled: game.mistakesEnabled,
      startedAt: game.startedAt,
    },
  });
}
