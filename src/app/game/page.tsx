"use client";

import { useEffect, useState } from "react";
import { NewGameForm } from "@/components/menu/NewGameForm";
import { SudokuBoard } from "@/components/board/SudokuBoard";
import { GameHeader } from "@/components/controls/GameHeader";
import { NumberPad } from "@/components/controls/NumberPad";
import { ActionBar } from "@/components/controls/ActionBar";
import { CompletionModal } from "@/components/CompletionModal";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { useKeyboard } from "@/hooks/useKeyboard";
import { apiClient } from "@/lib/api-client";
import type { Difficulty, GameData, GameMode } from "@/types";

export default function GamePage() {
  const [mode, setMode] = useState<GameMode>("sudoku");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mistakesEnabled, setMistakesEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const game = useGame();
  const timer = useTimer(game.gameId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== "1") return;
    apiClient
      .get<{ game: { id: number } | null }>("/api/game/active")
      .then(async (res) => {
        if (!res.game) return;
        const loaded = await apiClient.get<GameData>(`/api/game/${res.game.id}`);
        game.loadGame(loaded);
        timer.setElapsed(loaded.timeSeconds);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!game.gameId) return;
    timer.start();
  }, [game.gameId]);

  useKeyboard({
    placeNumber: (num) => void game.placeNumber(num),
    clearCell: () => void game.clearCell(),
    toggleNoteMode: game.toggleNoteMode,
    undo: () => void game.undo(),
    redo: () => void game.redo(),
    moveSelection: (dr, dc) => {
      if (!game.selectedCell) return;
      const [r, c] = game.selectedCell;
      const nr = Math.max(0, Math.min(8, r + dr));
      const nc = Math.max(0, Math.min(8, c + dc));
      game.selectCell(nr, nc);
    },
    deselect: game.deselect,
  });

  useEffect(() => {
    const full = game.board.every((row) => row.every((v) => v !== 0));
    if (!full || game.isCompleted) return;
    game.completeGame(timer.elapsed).catch(() => undefined);
  }, [game.board, game.isCompleted, timer.elapsed]);

  const start = async () => {
    setLoading(true);
    try {
      await game.startNewGame(mode, difficulty, mistakesEnabled);
      timer.reset();
      timer.start();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center gap-5 p-6">
      {!game.gameId ? (
        <div className="w-full max-w-lg">
          <NewGameForm difficulty={difficulty} mistakesEnabled={mistakesEnabled} mode={mode} onDifficultyChange={setDifficulty} onMistakesChange={setMistakesEnabled} onModeChange={setMode} onStart={() => void start()} />
          {loading ? <p className="mt-2 text-sm text-slate-400">Generating puzzle...</p> : null}
        </div>
      ) : (
        <>
          <GameHeader difficulty={game.difficulty} elapsed={timer.elapsed} gameType={game.gameType} mistakesCount={game.mistakes.size} mistakesEnabled={game.mistakesEnabled} />
          <SudokuBoard board={game.board} hasConflict={game.hasConflict} mistakes={game.mistakes} notes={game.notes} onCellClick={game.selectCell} puzzle={game.puzzle} selectedCell={game.selectedCell} selectedValue={game.selectedValue} />
          <NumberPad disabled={!game.selectedCell || (game.selectedCell ? game.isInitialCell(game.selectedCell[0], game.selectedCell[1]) : true)} numberCounts={game.numberCounts} onSelect={(n) => void game.placeNumber(n)} />
          <ActionBar canRedo={game.canRedo} canUndo={game.canUndo} isNoteMode={game.isNoteMode} onClear={() => void game.clearCell()} onClearAll={() => void game.clearAll()} onRedo={() => void game.redo()} onToggleNote={game.toggleNoteMode} onUndo={() => void game.undo()} />
        </>
      )}
      {game.completionResult?.valid ? <CompletionModal result={game.completionResult} /> : null}
      <div className="text-sm text-slate-400">
        Shortcuts: 1-9, Delete, N, Ctrl+Z, Ctrl+Shift+Z/Ctrl+Y, arrows, Escape
      </div>
    </main>
  );
}
