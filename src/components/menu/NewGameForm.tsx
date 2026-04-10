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
      <h2 className="mb-6 text-center text-xl font-bold" style={{ color: "var(--text-primary)" }}>New Game</h2>

      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              mode === "sudoku"
                ? "border-cyan-500/40 bg-cyan-500/10"
                : "border"
            }`}
            style={mode === "sudoku" ? undefined : { background: "var(--btn-ghost-bg)", borderColor: "var(--btn-ghost-border)" }}
            onClick={() => onModeChange("sudoku")}
            type="button"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode === "sudoku" ? "bg-cyan-500/20 text-cyan-400" : ""}`}
              style={mode === "sudoku" ? undefined : { background: "var(--btn-ghost-bg)", color: "var(--text-muted)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="16" height="16" rx="2" />
                <line x1="7.33" y1="2" x2="7.33" y2="18" />
                <line x1="12.67" y1="2" x2="12.67" y2="18" />
                <line x1="2" y1="7.33" x2="18" y2="7.33" />
                <line x1="2" y1="12.67" x2="18" y2="12.67" />
              </svg>
            </div>
            <span className={`text-sm font-semibold ${mode === "sudoku" ? "text-cyan-300" : ""}`} style={mode === "sudoku" ? undefined : { color: "var(--text-muted)" }}>Classic</span>
            <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>Standard rules</span>
          </button>

          <button
            className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              mode === "killer"
                ? "border-violet-500/40 bg-violet-500/10"
                : "border"
            }`}
            style={mode === "killer" ? undefined : { background: "var(--btn-ghost-bg)", borderColor: "var(--btn-ghost-border)" }}
            onClick={() => onModeChange("killer")}
            type="button"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${mode === "killer" ? "bg-violet-500/20 text-violet-400" : ""}`}
              style={mode === "killer" ? undefined : { background: "var(--btn-ghost-bg)", color: "var(--text-muted)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2">
                <rect x="2" y="2" width="16" height="16" rx="2" />
                <path d="M6 2v8h8V2" />
                <path d="M2 10h6v8" />
              </svg>
            </div>
            <span className={`text-sm font-semibold ${mode === "killer" ? "text-violet-300" : ""}`} style={mode === "killer" ? undefined : { color: "var(--text-muted)" }}>Killer</span>
            <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>Cages with sums</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-xs font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>Difficulty</label>
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
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${active ? colorMap[d.color] : ""}`}
                style={!active ? { background: "var(--btn-ghost-bg)", borderColor: "var(--btn-ghost-border)", color: "var(--text-muted)" } : undefined}
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
            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Track mistakes</div>
            <div className="text-xs" style={{ color: "var(--text-faint)" }}>Highlights incorrect placements</div>
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
