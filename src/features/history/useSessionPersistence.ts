import { useMemo } from "react";
import { useAuth } from "../../auth/useAuth";
import type { LearningMode } from "./historyTypes";
import * as repo from "./historyRepository";

/** Best-effort writes, scoped to the current account. No unmount completion. */
export function useSessionPersistence(mode: LearningMode) {
  const { user, status } = useAuth();
  const userId = status === "authenticated" ? user?.id : undefined;
  return useMemo(() => createPersistence(userId, mode), [userId, mode]);
}

function createPersistence(userId: string | undefined, mode: LearningMode) {
  const state = {
    sessionId: null as string | null,
    starting: null as Promise<string | null> | null,
    attempts: new Map<number | string, Promise<string | null>>(),
    count: 0,
    completing: null as Promise<boolean> | null,
    completed: false,
  };
  const startSession = (targetLevel: string | null, questionCount = 0): Promise<string | null> => {
    if (!userId) return Promise.resolve(null);
    if (state.sessionId) return Promise.resolve(state.sessionId);
    if (state.starting) return state.starting;
    state.starting = repo.createSession(userId, mode, targetLevel, questionCount).then(session => {
      state.sessionId = session?.id ?? null;
      return state.sessionId;
    }).catch(() => null).finally(() => { state.starting = null; });
    return state.starting;
  };
  const recordAttempt = (questionId: string, questionOrder: number | null, durationSeconds: number | null, completed = true): Promise<string | null> => {
    if (!userId || state.completed || state.completing) return Promise.resolve(null);
    const key = questionOrder ?? questionId;
    const existing = state.attempts.get(key);
    if (existing) return existing;
    const pending = (async () => {
      const sid = state.sessionId || await state.starting;
      if (!sid) return null;
      const id = await repo.createAttempt(userId, sid, questionId, questionOrder, durationSeconds, completed);
      if (id && completed) state.count += 1;
      return id;
    })().catch(() => null);
    state.attempts.set(key, pending);
    return pending;
  };
  const completeSession = (): Promise<boolean> => {
    if (state.completed) return Promise.resolve(true);
    if (state.completing) return state.completing;
    state.completing = (async () => {
      await state.starting;
      await Promise.all(state.attempts.values());
      if (!state.sessionId) return false;
      const ok = await repo.completeSession(state.sessionId, state.count);
      state.completed = ok;
      return ok;
    })().catch(() => false).finally(() => { state.completing = null; });
    return state.completing;
  };
  const updateSessionQuestionCount = (questionCount: number) => {
    if (state.sessionId) void repo.updateSession(state.sessionId, { questionCount });
  };
  const reset = () => {
    state.sessionId = null; state.starting = null; state.count = 0;
    state.attempts.clear(); state.completed = false; state.completing = null;
  };
  return { getSessionId: () => state.sessionId, getAttemptCount: () => state.count, startSession, recordAttempt, completeSession, updateSessionQuestionCount, reset };
}
