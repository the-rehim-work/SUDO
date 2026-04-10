import { useMemo } from "react";
import { Cell } from "@/components/board/Cell";
import type { CageInfo } from "@/components/board/Cell";
import type { KillerCage, GameMode } from "@/types";
import { CAGE_COLORS } from "@/lib/constants";

interface SudokuBoardProps {
  board: number[][];
  puzzle: number[][];
  notes: number[][][];
  selectedCell: [number, number] | null;
  mistakes: Set<string>;
  selectedValue: number | null;
  onCellClick: (row: number, col: number) => void;
  hasConflict: (row: number, col: number) => boolean;
  cages?: KillerCage[];
  gameType?: GameMode;
}

function buildCageMap(cages: KillerCage[]): (CageInfo | null)[][] {
  const map: (CageInfo | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));

  for (let ci = 0; ci < cages.length; ci++) {
    const cage = cages[ci];
    const color = CAGE_COLORS[cage.colorIndex % CAGE_COLORS.length];
    const cellSet = new Set(cage.cells.map(([r, c]) => `${r}-${c}`));

    let labelRow = 9;
    let labelCol = 9;
    for (const [r, c] of cage.cells) {
      if (r < labelRow || (r === labelRow && c < labelCol)) {
        labelRow = r;
        labelCol = c;
      }
    }

    for (const [r, c] of cage.cells) {
      map[r][c] = {
        cageIndex: ci,
        sum: cage.sum,
        color,
        isLabel: r === labelRow && c === labelCol,
        borderTop: !cellSet.has(`${r - 1}-${c}`),
        borderBottom: !cellSet.has(`${r + 1}-${c}`),
        borderLeft: !cellSet.has(`${r}-${c - 1}`),
        borderRight: !cellSet.has(`${r}-${c + 1}`),
      };
    }
  }

  return map;
}

export function SudokuBoard(props: SudokuBoardProps) {
  const { board, puzzle, notes, selectedCell, mistakes, selectedValue, onCellClick, hasConflict, cages, gameType } = props;
  const isKiller = gameType === "killer";

  const cageMap = useMemo(() => (cages && cages.length > 0 ? buildCageMap(cages) : null), [cages]);

  return (
    <div
      className={`grid grid-cols-9 overflow-hidden rounded-xl ${isKiller ? "board-glow-violet" : "board-glow-cyan"}`}
      style={{ border: "var(--border-outer)" }}
    >
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
          const isSameRow = selectedCell?.[0] === rowIndex;
          const isSameCol = selectedCell?.[1] === colIndex;
          const isSameBox =
            !!selectedCell &&
            Math.floor(selectedCell[0] / 3) === Math.floor(rowIndex / 3) &&
            Math.floor(selectedCell[1] / 3) === Math.floor(colIndex / 3);
          const isSameValue = selectedValue !== null && selectedValue !== 0 && value === selectedValue;
          const isBoxRight = colIndex % 3 === 2 && colIndex !== 8;
          const isBoxBottom = rowIndex % 3 === 2 && rowIndex !== 8;

          return (
            <Cell
              cageInfo={cageMap ? cageMap[rowIndex][colIndex] : undefined}
              isConflict={hasConflict(rowIndex, colIndex)}
              isInitial={puzzle[rowIndex][colIndex] !== 0}
              isMistake={mistakes.has(`${rowIndex}-${colIndex}`)}
              isSameBox={isSameBox && !isSelected}
              isSameCol={isSameCol && !isSelected}
              isSameRow={isSameRow && !isSelected}
              isSameValue={isSameValue && !isSelected}
              isSelected={isSelected}
              key={`${rowIndex}-${colIndex}`}
              notes={notes[rowIndex][colIndex]}
              onClick={() => onCellClick(rowIndex, colIndex)}
              style={{
                borderRight: isBoxRight ? "var(--border-thick)" : "var(--border-thin)",
                borderBottom: isBoxBottom ? "var(--border-thick)" : "var(--border-thin)",
              }}
              value={value}
            />
          );
        }),
      )}
    </div>
  );
}
