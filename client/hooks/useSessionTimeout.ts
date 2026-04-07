import { useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "@/context/AuthContext";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check inactivity every 60 seconds
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= TIMEOUT_MS) {
        logout();
      }
    }, 60_000);

    // Handle app state changes — reset on foreground, check on background return
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          const elapsed = Date.now() - lastActivityRef.current;
          if (elapsed >= TIMEOUT_MS) {
            logout();
          } else {
            resetTimer();
          }
        }
      },
    );

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      subscription.remove();
    };
  }, [isAuthenticated, logout, resetTimer]);

  return { resetTimer };
}
