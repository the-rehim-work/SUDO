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
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-all sm:px-4 ${
        active
          ? "bg-violet-500/15 text-violet-400 border border-violet-500/25"
          : "btn-ghost"
      } ${disabled ? "opacity-30 pointer-events-none" : ""}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {icon}
      <span className="text-[10px] sm:text-xs">{label}</span>
    </button>
  );
}

export function ActionBar(props: ActionBarProps) {
  const { canUndo, canRedo, isNoteMode, onUndo, onRedo, onClear, onClearAll, onToggleNote } = props;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <ActionButton
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8l-2-2 2-2" />
            <path d="M2 6h10a4 4 0 010 8H8" />
          </svg>
        }
        label="Undo"
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ActionButton
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 8l2-2-2-2" />
            <path d="M16 6H6a4 4 0 000 8h4" />
          </svg>
        }
        label="Redo"
        onClick={onRedo}
        disabled={!canRedo}
      />

      <div className="mx-1 h-8 w-px bg-white/5" />

      <ActionButton
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 13L13 5M13 13L5 5" />
          </svg>
        }
        label="Erase"
        onClick={onClear}
      />
      <ActionButton
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5h12M5 5l1 10h6l1-10" />
          </svg>
        }
        label="Reset"
        onClick={onClearAll}
      />

      <div className="mx-1 h-8 w-px bg-white/5" />

      <ActionButton
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 3l2 2-8 8H5v-2l8-8z" />
          </svg>
        }
        label="Notes"
        onClick={onToggleNote}
        active={isNoteMode}
      />
    </div>
  );
}
