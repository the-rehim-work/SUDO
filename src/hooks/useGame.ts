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
  const [timeSeconds, setTimeSeconds] = useState(0);
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
    setTimeSeconds(data.timeSeconds);
    setMistakes(new Set());
    setCompletionResult(null);
    history.clear();
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
    setCompletionResult(null);
    setTimeSeconds(0);
    setSelectedCell(null);
    setIsNoteMode(false);
    history.clear();
  };

  const saveProgress = async (nextBoard: number[][], nextNotes: number[][][]) => {
    if (!gameId || isCompleted) return;
    await apiClient.put(`/api/game/${gameId}`, { currentState: nextBoard, notes: nextNotes, timeSeconds });
  };

  const placeNumber = async (num: number) => {
    if (!selectedCell || isCompleted) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const prevBoard = board.map((r) => [...r]);
    const prevNotes = notes.map((r) => r.map((c) => [...c]));
    const nextBoard = board.map((r) => [...r]);
    const nextNotes = notes.map((r) => r.map((c) => [...c]));
    history.pushState({ board: prevBoard, notes: prevNotes, action: "place" });

    if (isNoteMode) {
      const idx = nextNotes[row][col].indexOf(num);
      if (idx >= 0) nextNotes[row][col].splice(idx, 1);
      else {
        nextNotes[row][col].push(num);
        nextNotes[row][col].sort((a, b) => a - b);
      }
      nextBoard[row][col] = 0;
    } else {
      nextBoard[row][col] = num;
      nextNotes[row][col] = [];
      if (mistakesEnabled && gameId) {
        const moveRes = await apiClient.post<{ correct?: boolean; accepted?: boolean }>(`/api/game/${gameId}/move`, { row, col, value: num });
        if (moveRes.correct === false) setMistakes((prev) => new Set([...prev, `${row}-${col}`]));
        else setMistakes((prev) => {
          const clone = new Set(prev);
          clone.delete(`${row}-${col}`);
          return clone;
        });
      }
    }

    setBoard(nextBoard);
    setNotes(nextNotes);
    await saveProgress(nextBoard, nextNotes);
  };

  const clearCell = async () => {
    if (!selectedCell || isCompleted) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;

    if (board[row][col] === 0 && notes[row][col].length === 0) return;

    const prevBoard = board.map((r) => [...r]);
    const prevNotes = notes.map((r) => r.map((c) => [...c]));
    history.pushState({ board: prevBoard, notes: prevNotes, action: "clear" });

    const nextBoard = board.map((r) => [...r]);
    const nextNotes = notes.map((r) => r.map((c) => [...c]));
    nextBoard[row][col] = 0;
    nextNotes[row][col] = [];

    setBoard(nextBoard);
    setNotes(nextNotes);
    await saveProgress(nextBoard, nextNotes);
  };

  const clearAll = async () => {
    history.pushState({ board: board.map((r) => [...r]), notes: notes.map((r) => r.map((c) => [...c])), action: "clearAll" });
    const nextBoard = puzzle.map((r) => [...r]);
    const nextNotes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [] as number[]));
    setBoard(nextBoard);
    setNotes(nextNotes);
    await saveProgress(nextBoard, nextNotes);
  };

  const undo = async () => {
    const previous = history.undo({ board: board.map((r) => [...r]), notes: notes.map((r) => r.map((c) => [...c])), action: "undoCurrent" });
    if (!previous) return;
    setBoard(previous.board.map((r) => [...r]));
    setNotes(previous.notes.map((r) => r.map((c) => [...c])));
    await saveProgress(previous.board, previous.notes);
  };

  const redo = async () => {
    const next = history.redo({ board: board.map((r) => [...r]), notes: notes.map((r) => r.map((c) => [...c])), action: "redoCurrent" });
    if (!next) return;
    setBoard(next.board.map((r) => [...r]));
    setNotes(next.notes.map((r) => r.map((c) => [...c])));
    await saveProgress(next.board, next.notes);
  };

  const completeGame = async (elapsed: number) => {
    if (!gameId || isCompleted) return;
    const result = await apiClient.post<CompletionResult>(`/api/game/${gameId}/complete`, { currentState: board, timeSeconds: elapsed });
    setCompletionResult(result);
    setIsCompleted(result.valid);
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
    timeSeconds,
    setTimeSeconds,
    selectCell: (row: number, col: number) => setSelectedCell([row, col]),
    clearAll,
    clearCell,
    placeNumber,
    toggleNoteMode: () => setIsNoteMode((v) => !v),
    deselect: () => setSelectedCell(null),
    loadGame,
    startNewGame,
    undo,
    redo,
    completeGame,
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
