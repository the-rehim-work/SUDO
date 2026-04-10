interface NumberPadProps {
  numberCounts: Map<number, number>;
  disabled: boolean;
  onSelect: (value: number) => void;
}

export function NumberPad({ numberCounts, disabled, onSelect }: NumberPadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
        const count = numberCounts.get(n) ?? 0;
        const completed = count >= 9;

        return (
          <button
            key={n}
            className={`relative flex flex-col items-center justify-center rounded-xl transition-all duration-150 ${
              completed
                ? "cursor-default opacity-25"
                : disabled
                  ? "cursor-not-allowed opacity-40"
                  : "btn-ghost active:scale-95"
            } h-14 sm:h-12 sm:w-12`}
            style={{ color: "var(--text-primary)" }}
            disabled={disabled || completed}
            onClick={() => onSelect(n)}
            type="button"
          >
            <span className="text-lg font-semibold">
              {completed ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
                </svg>
              ) : (
                n
              )}
            </span>
            {!completed && (
              <span className="mt-0.5 text-[10px] font-normal" style={{ color: "var(--text-faint)" }}>
                {count}/9
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
