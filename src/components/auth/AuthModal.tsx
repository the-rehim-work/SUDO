"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setError("");
      setLoading(true);
      if (isSignIn) await login(username, password);
      else await register(username, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-scale-in glass-strong mx-4 w-full max-w-sm rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{isSignIn ? "Welcome back" : "Create account"}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {isSignIn ? "Sign in to track your progress" : "Join to save scores & compete"}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            {error}
          </div>
        )}

        <button
          className="btn-primary mt-5 flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          onClick={submit}
          disabled={loading || !username || !password}
          type="button"
        >
          {loading ? <div className="spinner" /> : isSignIn ? "Sign In" : "Create Account"}
        </button>

        <button
          className="mt-3 w-full rounded-xl py-2.5 text-sm transition-colors hover:opacity-90"
          style={{ color: "var(--text-muted)" }}
          onClick={() => { setIsSignIn((v) => !v); setError(""); }}
          type="button"
        >
          {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <button
          className="mt-1 w-full rounded-xl py-2 text-xs transition-colors hover:opacity-90"
          style={{ color: "var(--text-faint)" }}
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
