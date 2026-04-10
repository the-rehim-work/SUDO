interface NumberPadProps {
  numberCounts: Map<number, number>;
  disabled: boolean;
  onSelect: (value: number) => void;
}

export function NumberPad({ numberCounts, disabled, onSelect }: NumberPadProps) {
  return (
    <div className="grid w-full max-w-md grid-cols-5 gap-2 sm:grid-cols-9 sm:gap-1.5">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
        const count = numberCounts.get(n) ?? 0;
        const completed = count >= 9;

        return (
          <button
            key={n}
            className={`group relative flex flex-col items-center justify-center rounded-xl py-2.5 text-lg font-semibold transition-all sm:py-3 ${
              completed
                ? "cursor-default bg-white/[0.02] text-slate-700"
                : disabled
                  ? "cursor-not-allowed bg-white/[0.04] text-slate-600"
                  : "btn-ghost text-slate-200 hover:text-white active:scale-95"
            }`}
            disabled={disabled || completed}
            onClick={() => onSelect(n)}
            type="button"
          >
            <span>{n}</span>
            <span className={`mt-0.5 text-[10px] font-normal ${completed ? "text-emerald-600" : "text-slate-600"}`}>
              {completed ? "done" : `${count}/9`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
