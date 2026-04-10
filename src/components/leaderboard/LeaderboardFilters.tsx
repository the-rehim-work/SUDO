import type { Difficulty, GameMode } from "@/types";

interface LeaderboardFiltersProps {
  mode: GameMode;
  difficulty: Difficulty;
  mistakesEnabled: boolean;
  onChange: (next: { mode: GameMode; difficulty: Difficulty; mistakesEnabled: boolean }) => void;
}

export function LeaderboardFilters({ mode, difficulty, mistakesEnabled, onChange }: LeaderboardFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <select className="rounded bg-slate-800 p-2" onChange={(e) => onChange({ mode: e.target.value as GameMode, difficulty, mistakesEnabled })} value={mode}>
        <option value="sudoku">Classic</option>
        <option value="killer">Killer</option>
      </select>
      <select className="rounded bg-slate-800 p-2" onChange={(e) => onChange({ mode, difficulty: e.target.value as Difficulty, mistakesEnabled })} value={difficulty}>
        <option value="easy">easy</option>
        <option value="medium">medium</option>
        <option value="hard">hard</option>
        <option value="expert">expert</option>
      </select>
      <label className="flex items-center gap-2 rounded bg-slate-800 p-2">
        <input checked={mistakesEnabled} onChange={(e) => onChange({ mode, difficulty, mistakesEnabled: e.target.checked })} type="checkbox" />
        Mistakes
      </label>
    </div>
  );
}
