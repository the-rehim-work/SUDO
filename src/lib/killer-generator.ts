import type { Difficulty, KillerCage } from "@/types";
import { generateSolvedBoard } from "@/lib/sudoku-generator";

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function generateKillerCages(solution: number[][]): KillerCage[] {
  const cages: KillerCage[] = [];
  const assigned = Array.from({ length: 9 }, () => Array(9).fill(false));
  let colorIndex = 0;
  const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (assigned[r][c]) continue;

      const rand = Math.random();
      const targetSize = rand < 0.15 ? 2 : rand < 0.5 ? 3 : rand < 0.85 ? 4 : 5;
      const cells: [number, number][] = [[r, c]];
      assigned[r][c] = true;

      while (cells.length < targetSize) {
        const candidates: [number, number][] = [];
        for (const [cr, cc] of cells) {
          for (const [dr, dc] of directions) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && !assigned[nr][nc]) {
              if (!candidates.some(([rr, cc2]) => rr === nr && cc2 === nc)) {
                candidates.push([nr, nc]);
              }
            }
          }
        }
        if (candidates.length === 0) break;
        const [nr, nc] = candidates[Math.floor(Math.random() * candidates.length)];
        cells.push([nr, nc]);
        assigned[nr][nc] = true;
      }

      const sum = cells.reduce((acc, [rr, cc]) => acc + solution[rr][cc], 0);
      cages.push({ cells, sum, colorIndex: colorIndex % 12 });
      colorIndex += 1;
    }
  }
  return cages;
}

export function generateKillerSudoku(difficulty: Difficulty): {
  puzzle: number[][];
  solution: number[][];
  cages: KillerCage[];
} {
  const solution = generateSolvedBoard();
  const puzzle = solution.map((r) => [...r]);
  const cages = generateKillerCages(solution);

  const targetClues = { easy: 36, medium: 25, hard: 15, expert: 0 }[difficulty];
  if (targetClues === 0) {
    return { puzzle: Array.from({ length: 9 }, () => Array(9).fill(0)), solution, cages };
  }

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (r < 5 || (r === 4 && c <= 4)) positions.push([r, c]);
    }
  }
  shuffleArray(positions);

  let clues = 81;
  for (const [r, c] of positions) {
    if (clues <= targetClues || puzzle[r][c] === 0) continue;
    const symR = 8 - r;
    const symC = 8 - c;
    const center = r === 4 && c === 4;
    puzzle[r][c] = 0;
    if (!center) puzzle[symR][symC] = 0;
    clues -= center ? 1 : 2;
  }

  return { puzzle, solution, cages };
}
