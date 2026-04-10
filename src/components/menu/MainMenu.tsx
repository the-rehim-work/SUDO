import Link from "next/link";

interface MainMenuProps {
  hasActiveGame: boolean;
  authenticated: boolean;
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4l5 5-5 5" />
    </svg>
  );
}

export function MainMenu({ hasActiveGame, authenticated }: MainMenuProps) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="animate-fade-in-up flex flex-col items-center gap-2">
        <h1 className="gradient-title text-6xl font-black tracking-tight sm:text-7xl">SUDO</h1>
        <p className="text-sm tracking-widest text-slate-500 uppercase">Sudoku Reimagined</p>
      </div>

      <nav className="animate-fade-in-up flex w-full flex-col gap-3" style={{ animationDelay: "0.1s" }}>
        {hasActiveGame && (
          <Link href="/game?resume=1" className="group glass-strong flex items-center gap-4 rounded-2xl p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 transition-colors group-hover:bg-emerald-500/25">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor"><polygon points="8,5 18,11 8,17" /></svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-100">Continue Game</div>
              <div className="text-xs text-slate-500">Resume where you left off</div>
            </div>
            <ArrowIcon />
          </Link>
        )}

        <Link href="/game" className="group glass-strong flex items-center gap-4 rounded-2xl p-4 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 transition-colors group-hover:bg-cyan-500/25">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5v12M5 11h12" /></svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-100">New Game</div>
            <div className="text-xs text-slate-500">Classic or Killer Sudoku</div>
          </div>
          <ArrowIcon />
        </Link>

        <Link href="/leaderboard" className="group glass-strong flex items-center gap-4 rounded-2xl p-4 transition-all hover:border-amber-500/30 hover:bg-amber-500/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 transition-colors group-hover:bg-amber-500/25">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 17V10M11 17V5M16 17V12" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-100">Leaderboard</div>
            <div className="text-xs text-slate-500">Top times & rankings</div>
          </div>
          <ArrowIcon />
        </Link>

        {authenticated ? (
          <Link href="/statistics" className="group glass-strong flex items-center gap-4 rounded-2xl p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 transition-colors group-hover:bg-violet-500/25">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M11 8v3l2 1.5" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-100">Statistics</div>
              <div className="text-xs text-slate-500">Your history & personal bests</div>
            </div>
            <ArrowIcon />
          </Link>
        ) : (
          <div className="glass rounded-2xl p-4 text-center text-sm text-slate-500">
            Sign in to save your progress, view statistics, and compete on the leaderboard.
          </div>
        )}
      </nav>
    </div>
  );
}
