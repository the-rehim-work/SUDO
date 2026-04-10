interface ActionBarProps {
  canUndo: boolean;
  canRedo: boolean;
  isNoteMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onClearAll: () => void;
  onToggleNote: () => void;
}

function ActionButton({
  onClick,
  disabled,
  active,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-all active:scale-95 ${
        active
          ? "border border-amber-500/30 bg-amber-500/15 text-amber-400"
          : "btn-ghost text-slate-400 hover:text-slate-200"
      } ${disabled ? "pointer-events-none opacity-30" : ""}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export function ActionBar(props: ActionBarProps) {
  const { canUndo, canRedo, isNoteMode, onUndo, onRedo, onClear, onClearAll, onToggleNote } = props;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <ActionButton onClick={onUndo} disabled={!canUndo} label="Undo">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h7a4 4 0 010 8H8" /><polyline points="7 4 4 7 7 10" />
        </svg>
      </ActionButton>

      <ActionButton onClick={onRedo} disabled={!canRedo} label="Redo">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 7H7a4 4 0 000 8h3" /><polyline points="11 4 14 7 11 10" />
        </svg>
      </ActionButton>

      <ActionButton onClick={onClear} label="Erase">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 15h12M5.5 3.5l9 9M14.5 3.5l-9 9" />
        </svg>
      </ActionButton>

      <ActionButton onClick={onClearAll} label="Reset">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5h10M7 5V4a1 1 0 011-1h2a1 1 0 011 1v1M5 5v9a1.5 1.5 0 001.5 1.5h5A1.5 1.5 0 0013 14V5" />
        </svg>
      </ActionButton>

      <ActionButton onClick={onToggleNote} active={isNoteMode} label="Notes">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 3.5l4 4-9 9H2v-3.5l9-9z" />
        </svg>
      </ActionButton>
    </div>
  );
}
