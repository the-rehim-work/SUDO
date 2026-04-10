import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

export function useTimer(gameId: number | null) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (!gameId || !isRunning || elapsed === 0 || elapsed % 10 !== 0) return;
    apiClient.put(`/api/game/${gameId}/time`, { timeSeconds: elapsed }).catch(() => undefined);
  }, [elapsed, gameId, isRunning]);

  return {
    elapsed,
    isRunning,
    startTime,
    start: () => {
      startRef.current = Date.now();
      setStartTime(startRef.current);
      setIsRunning(true);
    },
    pause: () => setIsRunning(false),
    reset: () => {
      setElapsed(0);
      setIsRunning(false);
      startRef.current = null;
      setStartTime(null);
    },
    setElapsed,
  };
}
