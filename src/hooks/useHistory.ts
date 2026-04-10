import { useState } from "react";

export interface HistoryEntry {
  board: number[][];
  notes: number[][][];
  action: string;
}

const MAX_STACK = 100;

export function useHistory() {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  const pushState = (entry: HistoryEntry) => {
    setPast((prev) => [...prev.slice(-MAX_STACK + 1), entry]);
    setFuture([]);
  };

  const undo = (current: HistoryEntry): HistoryEntry | null => {
    if (!past.length) return null;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [current, ...prev]);
    return previous;
  };

  const redo = (current: HistoryEntry): HistoryEntry | null => {
    if (!future.length) return null;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev.slice(-MAX_STACK + 1), current]);
    return next;
  };

  const clear = () => {
    setPast([]);
    setFuture([]);
  };

  return {
    pushState,
    undo,
    redo,
    clear,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
