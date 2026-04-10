"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => (typeof window === "undefined" ? null : localStorage.getItem("token")));
  const [loading, setLoading] = useState<boolean>(() => !!(typeof window !== "undefined" && localStorage.getItem("token")));

  useEffect(() => {
    if (!token) return;
    apiClient
      .get<{ user: User }>("/api/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => {
        setToken(null);
        setTokenState(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await apiClient.post<{ token: string; user: User }>("/api/auth/login", { username, password });
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const register = async (username: string, password: string) => {
    const res = await apiClient.post<{ token: string; user: User }>("/api/auth/register", { username, password });
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
