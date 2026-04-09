import { NextResponse } from "next/server";
import { requireGameOwner } from "@/lib/route-helpers";
import { validateMove } from "@/lib/validator";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireGameOwner(request, Number(id));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { row, col, value } = (await request.json()) as { row: number; col: number; value: number };
  if (!result.game.mistakesEnabled) return NextResponse.json({ accepted: true });

  const solution = JSON.parse(result.game.solution) as number[][];
  return NextResponse.json({ correct: validateMove(solution, row, col, value) });
}
