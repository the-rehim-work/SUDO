import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function requireGameOwner(request: Request, gameId: number) {
  const authUser = await getAuthUser(request);
  if (!authUser) return { error: "Authentication required", status: 401 as const };

  const game = await prisma.game.findFirst({
    where: { id: gameId, userId: authUser.userId },
  });

  if (!game) return { error: "Game not found", status: 404 as const };
  return { authUser, game };
}
