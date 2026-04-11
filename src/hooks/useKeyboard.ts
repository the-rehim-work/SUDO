import { useEffect, useRef } from "react";

interface KeyboardHandlers {
  placeNumber: (num: number) => void;
  clearCell: () => void;
  toggleNoteMode: () => void;
  undo: () => void;
  redo: () => void;
  moveSelection: (dr: number, dc: number) => void;
  deselect: () => void;
}

export function useKeyboard(handlers: KeyboardHandlers) {
  const ref = useRef(handlers);

  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const h = ref.current;
      if (e.key >= "1" && e.key <= "9") h.placeNumber(Number(e.key));
      if (e.key === "Backspace" || e.key === "Delete") h.clearCell();
      if (e.key.toLowerCase() === "n") h.toggleNoteMode();
      if (e.key === "Escape") h.deselect();
      if (e.key === "ArrowUp") h.moveSelection(-1, 0);
      if (e.key === "ArrowDown") h.moveSelection(1, 0);
      if (e.key === "ArrowLeft") h.moveSelection(0, -1);
      if (e.key === "ArrowRight") h.moveSelection(0, 1);
      if (e.ctrlKey && e.key.toLowerCase() === "z" && e.shiftKey) h.redo();
      else if (e.ctrlKey && e.key.toLowerCase() === "z") h.undo();
      else if (e.ctrlKey && e.key.toLowerCase() === "y") h.redo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}