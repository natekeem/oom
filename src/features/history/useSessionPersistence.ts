/**
 * Phase 2: Session persistence hook for practice components.
 *
 * Encapsulates the session lifecycle (create → record attempts → complete).
 * All writes are fire-and-forget: failures are silently caught and logged.
 * Anonymous users get safe no-op implementations.
 */

import { useCallback, useRef } from "react";
import { useAuth } from "../../auth/useAuth";
import type { LearningMode } from "./historyTypes";
import * as repo from "./historyRepository";

export function useSessionPersistence(mode: LearningMode) {
  const { user, status } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const attemptCountRef = useRef(0);

  const isAuthenticated = status === "authenticated" && user !== null;

  const startSession = useCallback(
    async (targetLevel: string | null, questionCount = 0): Promise<string | null> => {
      if (!isAuthenticated || !user) return null;
      try {
        const session = await repo.createSession(user.id, mode, targetLevel, questionCount);
        if (session) {
          sessionIdRef.current = session.id;
          attemptCountRef.current = 0;
        }
        return session?.id ?? null;
      } catch {
        return null;
      }
    },
    [isAuthenticated, mode, user],
  );

  const recordAttempt = useCallback(
    (
      questionId: string,
      questionOrder: number | null,
      durationSeconds: number | null,
      completed = true,
    ): void => {
      if (!isAuthenticated || !user || !sessionIdRef.current) return;
      const sid = sessionIdRef.current;
      attemptCountRef.current += 1;
      void repo.createAttempt(user.id, sid, questionId, questionOrder, durationSeconds, completed);
    },
    [isAuthenticated, user],
  );

  const completeSession = useCallback((): void => {
    if (!isAuthenticated || !sessionIdRef.current) return;
    const sid = sessionIdRef.current;
    const count = attemptCountRef.current;
    void repo.completeSession(sid, count);
  }, [isAuthenticated]);

  const updateSessionQuestionCount = useCallback(
    (questionCount: number): void => {
      if (!isAuthenticated || !sessionIdRef.current) return;
      void repo.updateSession(sessionIdRef.current, { questionCount });
    },
    [isAuthenticated],
  );

  const reset = useCallback(() => {
    sessionIdRef.current = null;
    attemptCountRef.current = 0;
  }, []);

  return {
    /** Current DB session ID, or null if not started / anonymous. */
    getSessionId: () => sessionIdRef.current,
    /** Number of attempts recorded in the current session. */
    getAttemptCount: () => attemptCountRef.current,
    /** Create a new learning session. Only works for authenticated users. */
    startSession,
    /** Record a completed question attempt (fire-and-forget). */
    recordAttempt,
    /** Mark the current session as completed (fire-and-forget). */
    completeSession,
    /** Update the planned question count (e.g., after mock adjustment). */
    updateSessionQuestionCount,
    /** Reset local refs (for restart flows). */
    reset,
  };
}
