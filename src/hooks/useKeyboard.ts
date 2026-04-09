import { useEffect } from "react";

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
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") handlers.placeNumber(Number(e.key));
      if (e.key === "Backspace" || e.key === "Delete") handlers.clearCell();
      if (e.key.toLowerCase() === "n") handlers.toggleNoteMode();
      if (e.key === "Escape") handlers.deselect();
      if (e.key === "ArrowUp") handlers.moveSelection(-1, 0);
      if (e.key === "ArrowDown") handlers.moveSelection(1, 0);
      if (e.key === "ArrowLeft") handlers.moveSelection(0, -1);
      if (e.key === "ArrowRight") handlers.moveSelection(0, 1);
      if (e.ctrlKey && e.key.toLowerCase() === "z" && e.shiftKey) handlers.redo();
      else if (e.ctrlKey && e.key.toLowerCase() === "z") handlers.undo();
      else if (e.ctrlKey && e.key.toLowerCase() === "y") handlers.redo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
