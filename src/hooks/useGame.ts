"use client";

import { useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { hasConflict } from "@/lib/validator";
import type { CompletionResult, Difficulty, GameData, GameMode, KillerCage } from "@/types";
import { useHistory } from "@/hooks/useHistory";

export function useGame() {
  const [gameId, setGameId] = useState<number | null>(null);
  const [board, setBoard] = useState<number[][]>(Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [puzzle, setPuzzle] = useState<number[][]>(Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [notes, setNotes] = useState<number[][][]>(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [] as number[])));
  const [cages, setCages] = useState<KillerCage[] | undefined>(undefined);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState<Set<string>>(new Set());
  const [mistakesEnabled, setMistakesEnabled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [gameType, setGameType] = useState<GameMode>("sudoku");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const history = useHistory();

  const loadGame = (data: GameData) => {
    setGameId(data.gameId);
    setBoard(data.currentState);
    setPuzzle(data.puzzle);
    setNotes(data.notes);
    setCages(data.cages);
    setMistakesEnabled(data.mistakesEnabled);
    setIsCompleted(data.isCompleted);
    setGameType(data.gameType);
    setDifficulty(data.difficulty);
  };

  const startNewGame = async (mode: GameMode, diff: Difficulty, mistakesOn: boolean) => {
    const data = await apiClient.post<{ gameId: number; puzzle: number[][]; cages?: KillerCage[] }>("/api/game/new", {
      gameType: mode,
      difficulty: diff,
      mistakesEnabled: mistakesOn,
    });
    setGameId(data.gameId);
    setBoard(data.puzzle);
    setPuzzle(data.puzzle);
    setCages(data.cages);
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [] as number[])));
    setMistakesEnabled(mistakesOn);
    setGameType(mode);
    setDifficulty(diff);
    setIsCompleted(false);
    setMistakes(new Set());
    history.clear();
  };

  return {
    gameId,
    board,
    puzzle,
    notes,
    cages,
    selectedCell,
    isNoteMode,
    mistakes,
    mistakesEnabled,
    isCompleted,
    gameType,
    difficulty,
    completionResult,
    selectCell: (row: number, col: number) => setSelectedCell([row, col]),
    clearAll: () => {
      history.pushState({ board, notes, action: "clearAll" });
      setBoard(puzzle.map((r) => [...r]));
      setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [] as number[])));
    },
    toggleNoteMode: () => setIsNoteMode((v) => !v),
    loadGame,
    startNewGame,
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    isInitialCell: (row: number, col: number) => puzzle[row][col] !== 0,
    hasConflict: (row: number, col: number) => hasConflict(board, row, col),
    numberCounts: useMemo(() => {
      const map = new Map<number, number>();
      for (let n = 1; n <= 9; n += 1) map.set(n, 0);
      for (const row of board) for (const val of row) if (val) map.set(val, (map.get(val) || 0) + 1);
      return map;
    }, [board]),
    selectedValue: selectedCell ? board[selectedCell[0]][selectedCell[1]] : null,
    setCompletionResult,
  };
}
