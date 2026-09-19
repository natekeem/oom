/**
 * Phase 2: React hook for loading learning history on My Page.
 *
 * Fetches recent sessions when the user is authenticated.
 * Clears state on auth changes (logout, user switch).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import type { LearningSession } from "./historyTypes";
import { getRecentSessions } from "./historyRepository";

export type HistoryStatus = "idle" | "loading" | "success" | "error";

export function useLearningHistory() {
  const { user, status: authStatus } = useAuth();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [status, setStatus] = useState<HistoryStatus>("idle");
  const requestRef = useRef(0);

  const userId = authStatus === "authenticated" ? user?.id : null;
  const previousUserIdRef = useRef(userId);

  if (userId !== previousUserIdRef.current) {
    previousUserIdRef.current = userId;
    if (!userId) {
      setSessions([]);
      setStatus("idle");
    }
  }

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      return;
    }
    requestRef.current += 1;
    const requestId = requestRef.current;
    
    // Avoid synchronous setState in effect
    await Promise.resolve();
    setStatus("loading");
    try {
      const data = await getRecentSessions(20);
      if (requestId !== requestRef.current) return;
      setSessions(data);
      setStatus("success");
    } catch {
      if (requestId !== requestRef.current) return;
      setSessions([]);
      setStatus("error");
    }
  }, [userId]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (!userId) {
      requestRef.current += 1;
      return;
    }
    const run = async () => {
      await fetchHistory();
    };
    run();
  }, [userId, fetchHistory]);

  return {
    /** Recent learning sessions, newest first. */
    sessions,
    /** Current loading status. */
    status,
    /** Whether the user has any history. */
    isEmpty: status === "success" && sessions.length === 0,
    /** Retry fetching after a failure. */
    retry: fetchHistory,
  };
}
