import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireGameOwner } from "@/lib/route-helpers";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireGameOwner(request, Number(id));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { timeSeconds } = (await request.json()) as { timeSeconds: unknown };
  if (typeof timeSeconds !== "number" || timeSeconds < 0) {
    return NextResponse.json({ error: "Invalid time value" }, { status: 400 });
  }

  await prisma.game.update({ where: { id: result.game.id }, data: { timeSeconds } });
  return NextResponse.json({ success: true });
}
