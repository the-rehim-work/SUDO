import type { Difficulty, GameMode } from "@/types";

interface LeaderboardFiltersProps {
  mode: GameMode;
  difficulty: Difficulty;
  mistakesEnabled: boolean;
  onChange: (next: { mode: GameMode; difficulty: Difficulty; mistakesEnabled: boolean }) => void;
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

export function LeaderboardFilters({ mode, difficulty, mistakesEnabled, onChange }: LeaderboardFiltersProps) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <div className="flex gap-1 rounded-lg border border-white/5 bg-white/[0.03] p-1">
        {(["sudoku", "killer"] as GameMode[]).map((m) => (
          <button
            key={m}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              mode === m ? (m === "killer" ? "bg-violet-500/20 text-violet-400" : "bg-cyan-500/20 text-cyan-400") : "text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => onChange({ mode: m, difficulty, mistakesEnabled })}
            type="button"
          >
            {m === "killer" ? "Killer" : "Classic"}
          </button>
        ))}
      </div>

      <div className="flex gap-1 rounded-lg border border-white/5 bg-white/[0.03] p-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-all ${
              difficulty === d ? "bg-white/10 text-slate-200" : "text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => onChange({ mode, difficulty: d, mistakesEnabled })}
            type="button"
          >
            {d}
          </button>
        ))}
      </div>

      <label className="glass flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5">
        <input
          checked={mistakesEnabled}
          onChange={(e) => onChange({ mode, difficulty, mistakesEnabled: e.target.checked })}
          type="checkbox"
        />
        <span className="text-xs text-slate-400">Mistakes</span>
      </label>
    </div>
  );
}
