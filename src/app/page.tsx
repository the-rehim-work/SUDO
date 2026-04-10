"use client";

import { useEffect, useState } from "react";
import { MainMenu } from "@/components/menu/MainMenu";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasActiveGame(false);
      return;
    }
    apiClient
      .get<{ game: { id: number } | null }>("/api/game/active")
      .then((res) => setHasActiveGame(!!res.game))
      .catch(() => setHasActiveGame(false));
  }, [user]);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-8 px-5 py-10">
      <div className="animate-fade-in-up absolute top-5 right-5 left-5 flex items-center justify-end">
        {loading ? null : user ? (
          <div className="glass flex items-center gap-3 rounded-full py-2 pr-2 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-300">{user.username}</span>
            </div>
            <button
              className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
              onClick={logout}
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            className="btn-primary rounded-full px-5 py-2 text-sm font-medium text-white"
            onClick={() => setShowAuth(true)}
            type="button"
          >
            Sign in
          </button>
        )}
      </div>

      <MainMenu authenticated={!!user} hasActiveGame={hasActiveGame} />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
}
