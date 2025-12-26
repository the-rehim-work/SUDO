type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface KillerCage {
  cells: [number, number][];
  sum: number;
}

interface PuzzleData {
  puzzle: number[][];
  solution: number[][];
  cages?: KillerCage[];
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
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

function generateSolvedBoard(): number[][] {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(nums);
  for (let c = 0; c < 9; c++) {
    board[0][c] = nums[c];
  }
  solveSudoku(board);
  return board;
}

export function generateSudoku(difficulty: Difficulty): PuzzleData {
  const solution = generateSolvedBoard();
  const puzzle = JSON.parse(JSON.stringify(solution));

  const targetClues = {
    easy: 46,
    medium: 35,
    hard: 27,
    expert: 17,
  }[difficulty];

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (r < 5 || (r === 4 && c <= 4)) {
        positions.push([r, c]);
      }
    }
  }
  shuffleArray(positions);

  let clues = 81;

  for (const [r, c] of positions) {
    if (clues <= targetClues) break;

    const symR = 8 - r;
    const symC = 8 - c;
    const isCenterCell = r === 4 && c === 4;

    if (puzzle[r][c] === 0) continue;

    const temp1 = puzzle[r][c];
    const temp2 = isCenterCell ? 0 : puzzle[symR][symC];

    puzzle[r][c] = 0;
    if (!isCenterCell) puzzle[symR][symC] = 0;

    const removedCount = isCenterCell ? 1 : 2;

    if (hasUniqueSolution(puzzle)) {
      clues -= removedCount;
    } else {
      puzzle[r][c] = temp1;
      if (!isCenterCell) puzzle[symR][symC] = temp2;
    }
  }

  return { puzzle, solution };
}

function hasUniqueSolution(puzzle: number[][]): boolean {
  const board = puzzle.map(r => [...r]);
  let solutions = 0;

  function solve(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(board, r, c, num)) {
              board[r][c] = num;
              if (solve()) {
                if (solutions > 1) return true;
              }
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    solutions++;
    return solutions > 1;
  }

  solve();
  return solutions === 1;
}

export function generateKillerSudoku(difficulty: Difficulty): PuzzleData {
  const solution = generateSolvedBoard();
  const puzzle = JSON.parse(JSON.stringify(solution));
  const cages = generateKillerCages(solution);

  const targetClues = {
    easy: 36,
    medium: 25,
    hard: 15,
    expert: 0,
  }[difficulty];

  if (targetClues === 0) {
    return { puzzle: Array(9).fill(null).map(() => Array(9).fill(0)), solution, cages };
  }

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (r < 5 || (r === 4 && c <= 4)) {
        positions.push([r, c]);
      }
    }
  }
  shuffleArray(positions);

  let clues = 81;

  for (const [r, c] of positions) {
    if (clues <= targetClues) break;

    const symR = 8 - r;
    const symC = 8 - c;
    const isCenterCell = r === 4 && c === 4;

    if (puzzle[r][c] === 0) continue;

    puzzle[r][c] = 0;
    if (!isCenterCell) puzzle[symR][symC] = 0;

    clues -= isCenterCell ? 1 : 2;
  }

  return { puzzle, solution, cages };
}

function generateKillerCages(solution: number[][]): KillerCage[] {
  const cages: KillerCage[] = [];
  const assigned: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (assigned[r][c]) continue;

      const rand = Math.random();
      let targetSize: number;
      if (rand < 0.15) {
        targetSize = 2;
      } else if (rand < 0.50) {
        targetSize = 3;
      } else if (rand < 0.85) {
        targetSize = 4;
      } else {
        targetSize = 5;
      }

      const cells: [number, number][] = [[r, c]];
      assigned[r][c] = true;

      const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

      while (cells.length < targetSize) {
        const candidates: [number, number][] = [];
        for (const [cr, cc] of cells) {
          for (const [dr, dc] of directions) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && !assigned[nr][nc]) {
              const alreadyCandidate = candidates.some(([r, c]) => r === nr && c === nc);
              if (!alreadyCandidate) candidates.push([nr, nc]);
            }
          }
        }
        if (candidates.length === 0) break;
        const [nr, nc] = candidates[Math.floor(Math.random() * candidates.length)];
        cells.push([nr, nc]);
        assigned[nr][nc] = true;
      }

      const sum = cells.reduce((acc, [r, c]) => acc + solution[r][c], 0);
      cages.push({ cells, sum });
    }
  }

  return cages;
}

export function validateSolution(currentState: number[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentState[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}