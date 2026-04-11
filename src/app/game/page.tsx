"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { NewGameForm } from "@/components/menu/NewGameForm";
import { SudokuBoard } from "@/components/board/SudokuBoard";
import { GameHeader } from "@/components/controls/GameHeader";
import { NumberPad } from "@/components/controls/NumberPad";
import { ActionBar } from "@/components/controls/ActionBar";
import { CompletionModal } from "@/components/CompletionModal";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { Difficulty, GameData, GameMode } from "@/types";

export default function GamePage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<GameMode>("sudoku");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mistakesEnabled, setMistakesEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasActiveGame, setHasActiveGame] = useState(false);

  const game = useGame();
  const timer = useTimer(game.gameId);

  useEffect(() => {
    game.syncElapsedForSave(timer.elapsed);
  }, [timer.elapsed, game.syncElapsedForSave]);

  useEffect(() => {
    if (!user) return;
    apiClient
      .get<{ game: { id: number } | null }>("/api/game/active")
      .then((res) => setHasActiveGame(!!res.game))
      .catch(() => setHasActiveGame(false));
  }, [user]);

  const loadGameRef = useRef(game.loadGame);
  const setElapsedRef = useRef(timer.setElapsed);
  loadGameRef.current = game.loadGame;
  setElapsedRef.current = timer.setElapsed;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== "1") return;
    apiClient
      .get<{ game: { id: number } | null }>("/api/game/active")
      .then(async (res) => {
        if (!res.game) return;
        const loaded = await apiClient.get<GameData>(`/api/game/${res.game.id}`);
        loadGameRef.current(loaded);
        setElapsedRef.current(loaded.timeSeconds);
      })
      .catch(() => undefined);
  }, []);

  const timerStartRef = useRef(timer.start);
  timerStartRef.current = timer.start;
  useEffect(() => {
    if (!game.gameId) return;
    timerStartRef.current();
  }, [game.gameId]);

  const keyboardHandlers = useMemo(
    () => ({
      placeNumber: (num: number) => {
        game.placeNumber(num).catch(() => undefined);
      },
      clearCell: () => game.clearCell(),
      toggleNoteMode: game.toggleNoteMode,
      undo: () => game.undo(),
      redo: () => game.redo(),
      moveSelection: (dr: number, dc: number) => {
        if (!game.selectedCell) return;
        const [r, c] = game.selectedCell;
        game.selectCell(Math.max(0, Math.min(8, r + dr)), Math.max(0, Math.min(8, c + dc)));
      },
      deselect: game.deselect,
    }),
    [game],
  );

  useKeyboard(keyboardHandlers);

  const completeGameRef = useRef(game.completeGame);
  completeGameRef.current = game.completeGame;

  useEffect(() => {
    const full = game.board.every((row) => row.every((v) => v !== 0));
    if (!full || game.isCompleted) return;
    completeGameRef.current(timer.elapsed).catch(() => {
      setError("Solution is incorrect — keep trying.");
    });
  }, [game.board, game.isCompleted, timer.elapsed]);

  const handleStart = async () => {
    if (hasActiveGame && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    try {
      await game.startNewGame(mode, difficulty, mistakesEnabled);
      timer.reset();
      timer.start();
      setHasActiveGame(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = () => { setIsPaused(true); timer.pause(); };
  const handleResume = () => { setIsPaused(false); timer.start(); };

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center gap-5 p-5">
      <div className="animate-fade-in flex w-full items-center">
        <Link href="/" className="btn-ghost flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4" /></svg>
          Menu
        </Link>
      </div>

      {!game.gameId ? (
        <div className="w-full max-w-lg">
          <NewGameForm
            difficulty={difficulty}
            mistakesEnabled={mistakesEnabled}
            mode={mode}
            onDifficultyChange={setDifficulty}
            onMistakesChange={setMistakesEnabled}
            onModeChange={setMode}
            onStart={() => void handleStart()}
          />
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="spinner" />
              <span className="text-sm text-slate-400">Generating puzzle...</span>
            </div>
          )}
          {error && (
            <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>
          )}
          {showConfirm && (
            <div className="animate-fade-in-up glass-strong mt-3 rounded-xl p-4 text-center">
              <p className="mb-3 text-sm text-slate-300">You have an active game. Starting a new one will discard it.</p>
              <div className="flex justify-center gap-2">
                <button className="btn-ghost rounded-lg px-4 py-2 text-sm" onClick={() => setShowConfirm(false)} type="button">Cancel</button>
                <button className="btn-primary rounded-lg px-4 py-2 text-sm text-white" onClick={() => void handleStart()} type="button">Start Anyway</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in-up flex flex-col items-center gap-5">
          <GameHeader
            difficulty={game.difficulty}
            elapsed={timer.elapsed}
            gameType={game.gameType}
            mistakesCount={game.mistakes.size}
            mistakesEnabled={game.mistakesEnabled}
            isNoteMode={game.isNoteMode}
            onPause={handlePause}
          />

          <div className="relative">
            <SudokuBoard
              board={game.board}
              cages={game.cages}
              gameType={game.gameType}
              hasConflict={game.hasConflict}
              isNoteMode={game.isNoteMode}
              mistakes={game.mistakes}
              notes={game.notes}
              onCellClick={game.selectCell}
              puzzle={game.puzzle}
              selectedCell={game.selectedCell}
              selectedValue={game.selectedValue}
            />
            {isPaused && (
              <div className="animate-fade-in absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-xl bg-black/80 backdrop-blur-md">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="14" y="12" width="6" height="24" rx="1.5" fill="#94a3b8" />
                  <rect x="28" y="12" width="6" height="24" rx="1.5" fill="#94a3b8" />
                </svg>
                <p className="text-lg font-semibold text-slate-300">Game Paused</p>
                <button className="btn-primary rounded-xl px-8 py-3 text-sm font-semibold text-white" onClick={handleResume} type="button">Resume</button>
              </div>
            )}
          </div>

          {error && (
            <div className="animate-fade-in-up rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400">{error}</div>
          )}

          <NumberPad
            disabled={isPaused || !game.selectedCell || (game.selectedCell ? game.isInitialCell(game.selectedCell[0], game.selectedCell[1]) : true)}
            numberCounts={game.numberCounts}
            onSelect={(n) => void game.placeNumber(n)}
          />
          <ActionBar
            canRedo={game.canRedo}
            canUndo={game.canUndo}
            isNoteMode={game.isNoteMode}
            onClear={() => game.clearCell()}
            onClearAll={() => game.clearAll()}
            onRedo={() => game.redo()}
            onToggleNote={game.toggleNoteMode}
            onUndo={() => game.undo()}
          />
        </div>
      )}

      {game.completionResult?.valid && <CompletionModal result={game.completionResult} />}

      <div className="mt-auto pb-2 text-center text-xs text-slate-600">
        1-9 place &middot; Del clear &middot; N notes &middot; Ctrl+Z undo &middot; Arrows move &middot; Esc deselect
      </div>
    </main>
  );
}
