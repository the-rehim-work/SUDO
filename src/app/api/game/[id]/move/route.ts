import { NextResponse } from "next/server";
import { requireGameOwner } from "@/lib/route-helpers";
import { validateMove } from "@/lib/validator";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireGameOwner(request, Number(id));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { row, col, value } = (await request.json()) as { row: number; col: number; value: number };

  if (typeof row !== "number" || typeof col !== "number" || typeof value !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (row < 0 || row > 8 || col < 0 || col > 8 || value < 1 || value > 9) {
    return NextResponse.json({ error: "Out of bounds" }, { status: 400 });
  }

  if (!result.game.mistakesEnabled) return NextResponse.json({ accepted: true });

  const solution = JSON.parse(result.game.solution) as number[][];
  return NextResponse.json({ correct: validateMove(solution, row, col, value) });
}
