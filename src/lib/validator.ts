export function validateMove(solution: number[][], row: number, col: number, value: number): boolean {
  return solution[row]?.[col] === value;
}

export function validateCompletion(currentState: number[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (currentState[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function hasConflict(board: number[][], row: number, col: number): boolean {
  const value = board[row][col];
  if (!value) return false;

  for (let c = 0; c < 9; c += 1) {
    if (c !== col && board[row][c] === value) return true;
  }
  for (let r = 0; r < 9; r += 1) {
    if (r !== row && board[r][col] === value) return true;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if ((r !== row || c !== col) && board[r][c] === value) return true;
    }
  }

  return false;
}

export function isValidBoard(board: unknown): board is number[][] {
  if (!Array.isArray(board) || board.length !== 9) return false;
  return board.every(
    (row) => Array.isArray(row) && row.length === 9 && row.every((v) => typeof v === "number" && v >= 0 && v <= 9),
  );
}
