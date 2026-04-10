interface GameHeaderProps {
  elapsed: number;
  gameType: string;
  difficulty: string;
  mistakesEnabled: boolean;
  mistakesCount: number;
  isNoteMode: boolean;
  onPause: () => void;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "cyan" | "violet" | "amber" | "rose" }) {
  const colors: Record<string, string> = {
    default: "border-[var(--btn-ghost-border)] bg-[var(--btn-ghost-bg)] text-[var(--text-muted)]",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${colors[variant]}`}>{children}</span>;
}

export function GameHeader({ elapsed, gameType, difficulty, mistakesEnabled, mistakesCount, isNoteMode, onPause }: GameHeaderProps) {
  return (
    <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2">
      <button onClick={onPause} type="button" className="group mr-auto flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-1.5 text-sm font-mono text-slate-200 transition-colors hover:bg-white/10">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500 group-hover:text-cyan-400">
          <circle cx="7" cy="7" r="5.5" />
          <path d="M7 4.5v2.5l1.75 1.25" />
        </svg>
        {formatTime(elapsed)}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="ml-0.5 text-slate-600">
          <rect x="2" y="1.5" width="2" height="7" rx="0.5" />
          <rect x="6" y="1.5" width="2" height="7" rx="0.5" />
        </svg>
      </button>

      <Badge variant={gameType === "killer" ? "violet" : "cyan"}>
        {gameType === "killer" ? "Killer" : "Classic"}
      </Badge>
      <Badge>{difficulty}</Badge>
      {mistakesEnabled && (
        <Badge variant={mistakesCount > 0 ? "rose" : "default"}>
          {mistakesCount} mistake{mistakesCount !== 1 ? "s" : ""}
        </Badge>
      )}
      {isNoteMode && <Badge variant="amber">Notes</Badge>}
    </div>
  );
}
