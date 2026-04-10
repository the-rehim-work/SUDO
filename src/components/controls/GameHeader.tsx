interface GameHeaderProps {
  elapsed: number;
  gameType: string;
  difficulty: string;
  mistakesEnabled: boolean;
  mistakesCount: number;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "cyan" | "violet" | "emerald" | "amber" | "rose" }) {
  const styles: Record<string, string> = {
    default: "bg-white/5 text-slate-400 border-white/5",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

const difficultyColor: Record<string, "emerald" | "cyan" | "amber" | "rose"> = {
  easy: "emerald",
  medium: "cyan",
  hard: "amber",
  expert: "rose",
};

export function GameHeader({ elapsed, gameType, difficulty, mistakesEnabled, mistakesCount }: GameHeaderProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2">
      <Badge variant="default">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.5V8l2.5 2" />
        </svg>
        <span className="font-mono tabular-nums">{formatTime(elapsed)}</span>
      </Badge>
      <Badge variant={gameType === "killer" ? "violet" : "cyan"}>
        {gameType === "killer" ? "Killer" : "Classic"}
      </Badge>
      <Badge variant={difficultyColor[difficulty] ?? "default"}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
      {mistakesEnabled && (
        <Badge variant={mistakesCount > 0 ? "rose" : "default"}>
          {mistakesCount} mistake{mistakesCount !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  );
}
