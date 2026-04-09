import type { Difficulty } from "@/types";

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c += 1) {
    if (board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r += 1) {
    if (board[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board: number[][]): boolean {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(nums);
        for (const num of nums) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (solveSudoku(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function hasUniqueSolution(puzzle: number[][]): boolean {
  const board = puzzle.map((r) => [...r]);
  let solutions = 0;

  function solve(): boolean {
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num += 1) {
            if (isValidPlacement(board, r, c, num)) {
              board[r][c] = num;
              if (solve() && solutions > 1) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    solutions += 1;
    return solutions > 1;
  }

  solve();
  return solutions === 1;
}

export function generateSolvedBoard(): number[][] {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(nums);
  for (let c = 0; c < 9; c += 1) {
    board[0][c] = nums[c];
  }
  solveSudoku(board);
  return board;
}

export function generateSudoku(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map((r) => [...r]);
  const targetClues = { easy: 46, medium: 35, hard: 27, expert: 17 }[difficulty];
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
    const temp1 = puzzle[r][c];
    const temp2 = center ? 0 : puzzle[symR][symC];
    puzzle[r][c] = 0;
    if (!center) puzzle[symR][symC] = 0;
    const removed = center ? 1 : 2;
    if (hasUniqueSolution(puzzle)) clues -= removed;
    else {
      puzzle[r][c] = temp1;
      if (!center) puzzle[symR][symC] = temp2;
    }
  }

  return { puzzle, solution };
}
