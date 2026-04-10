import type { Difficulty, GameMode } from "@/types";

interface NewGameFormProps {
  mode: GameMode;
  difficulty: Difficulty;
  mistakesEnabled: boolean;
  onModeChange: (v: GameMode) => void;
  onDifficultyChange: (v: Difficulty) => void;
  onMistakesChange: (v: boolean) => void;
  onStart: () => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "emerald" },
  { value: "medium", label: "Medium", color: "cyan" },
  { value: "hard", label: "Hard", color: "amber" },
  { value: "expert", label: "Expert", color: "rose" },
];

export function NewGameForm(props: NewGameFormProps) {
  const { mode, difficulty, mistakesEnabled, onModeChange, onDifficultyChange, onMistakesChange, onStart } = props;

  return (
    <div className="animate-fade-in-up glass-strong w-full rounded-2xl p-6">
      <h2 className="mb-6 text-center text-xl font-bold text-slate-100">New Game</h2>

      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium tracking-wider text-slate-500 uppercase">Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              mode === "sudoku"
                ? "border-cyan-500/40 bg-cyan-500/10"
                : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
            }`}
            onClick={() => onModeChange("sudoku")}
            type="button"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode === "sudoku" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-500"}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="16" height="16" rx="2" />
                <line x1="7.33" y1="2" x2="7.33" y2="18" />
                <line x1="12.67" y1="2" x2="12.67" y2="18" />
                <line x1="2" y1="7.33" x2="18" y2="7.33" />
                <line x1="2" y1="12.67" x2="18" y2="12.67" />
              </svg>
            </div>
            <span className={`text-sm font-semibold ${mode === "sudoku" ? "text-cyan-300" : "text-slate-400"}`}>Classic</span>
            <span className="text-[11px] text-slate-600">Standard rules</span>
          </button>

          <button
            className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              mode === "killer"
                ? "border-violet-500/40 bg-violet-500/10"
                : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
            }`}
            onClick={() => onModeChange("killer")}
            type="button"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode === "killer" ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-slate-500"}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2">
                <rect x="2" y="2" width="16" height="16" rx="2" />
                <path d="M6 2v8h8V2" />
                <path d="M2 10h6v8" />
              </svg>
            </div>
            <span className={`text-sm font-semibold ${mode === "killer" ? "text-violet-300" : "text-slate-400"}`}>Killer</span>
            <span className="text-[11px] text-slate-600">Cages with sums</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium tracking-wider text-slate-500 uppercase">Difficulty</label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => {
            const active = difficulty === d.value;
            const colorMap: Record<string, string> = {
              emerald: active ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400" : "",
              cyan: active ? "border-cyan-500/40 bg-cyan-500/12 text-cyan-400" : "",
              amber: active ? "border-amber-500/40 bg-amber-500/12 text-amber-400" : "",
              rose: active ? "border-rose-500/40 bg-rose-500/12 text-rose-400" : "",
            };
            return (
              <button
                key={d.value}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  active ? colorMap[d.color] : "border-white/5 bg-white/[0.03] text-slate-500 hover:bg-white/[0.06]"
                }`}
                onClick={() => onDifficultyChange(d.value)}
                type="button"
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            checked={mistakesEnabled}
            onChange={(e) => onMistakesChange(e.target.checked)}
            type="checkbox"
          />
          <div>
            <div className="text-sm font-medium text-slate-200">Track mistakes</div>
            <div className="text-xs text-slate-600">Highlights incorrect placements</div>
          </div>
        </label>
      </div>

      <button
        className={`w-full rounded-xl py-3.5 text-base font-semibold text-white ${mode === "killer" ? "btn-accent" : "btn-primary"}`}
        onClick={onStart}
        type="button"
      >
        Start Game
      </button>
    </div>
  );
}
