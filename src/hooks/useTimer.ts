import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

export function useTimer(gameId: number | null) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const wasRunningRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        wasRunningRef.current = isRunning;
        setIsRunning(false);
      } else if (wasRunningRef.current) {
        setIsRunning(true);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [isRunning]);

  useEffect(() => {
    if (!gameId || !isRunning || elapsed === 0 || elapsed % 10 !== 0) return;
    apiClient.put(`/api/game/${gameId}/time`, { timeSeconds: elapsed }).catch(() => undefined);
  }, [elapsed, gameId, isRunning]);

  return {
    elapsed,
    isRunning,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => {
      setElapsed(0);
      setIsRunning(false);
      wasRunningRef.current = false;
    },
    setElapsed,
  };
}
