/**
 * Phase 2: Supabase data-access layer for learning history.
 *
 * All `.from('learning_sessions')` and `.from('learning_attempts')` calls live here.
 * Every method is best-effort: failures return null/false and log a warning.
 * The UI layer never needs to know raw Supabase table or column names.
 */

import { supabase } from "../../lib/supabase";
import type {
  LearningAttemptRow,
  LearningMode,
  LearningSession,
  LearningSessionRow,
  LearningSessionStatus,
} from "./historyTypes";
import { mapSession } from "./historyTypes";

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function createSession(
  userId: string,
  mode: LearningMode,
  targetLevel: string | null,
  questionCount: number,
): Promise<LearningSession | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("learning_sessions")
      .insert({
        user_id: userId,
        mode,
        target_level: targetLevel,
        question_count: questionCount,
      } satisfies Partial<LearningSessionRow>)
      .select()
      .single();
    if (error || !data) {
      console.warn("[OOM] Failed to create learning session:", error?.message);
      return null;
    }
    return mapSession(data as LearningSessionRow);
  } catch (err) {
    console.warn("[OOM] Failed to create learning session:", err);
    return null;
  }
}

export async function updateSession(
  sessionId: string,
  updates: {
    status?: LearningSessionStatus;
    questionCount?: number;
    answeredCount?: number;
    completedAt?: string;
  },
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const patch: Record<string, unknown> = {};
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.questionCount !== undefined) patch.question_count = updates.questionCount;
    if (updates.answeredCount !== undefined) patch.answered_count = updates.answeredCount;
    if (updates.completedAt !== undefined) patch.completed_at = updates.completedAt;

    const { error } = await supabase
      .from("learning_sessions")
      .update(patch)
      .eq("id", sessionId);
    if (error) {
      console.warn("[OOM] Failed to update learning session:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[OOM] Failed to update learning session:", err);
    return false;
  }
}

export async function completeSession(
  sessionId: string,
  answeredCount: number,
): Promise<boolean> {
  return updateSession(sessionId, {
    status: "completed",
    answeredCount,
    completedAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

export async function createAttempt(
  userId: string,
  sessionId: string,
  questionId: string,
  questionOrder: number | null,
  durationSeconds: number | null,
  completed: boolean,
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("learning_attempts")
      .insert({
        session_id: sessionId,
        user_id: userId,
        question_id: questionId,
        question_order: questionOrder,
        duration_seconds: durationSeconds,
        completed,
      } satisfies Partial<LearningAttemptRow>)
      .select("id")
      .single();
    if (error || !data) {
      // Unique constraint violation for duplicate question_order is expected on retry
      if (error?.code === "23505") return null;
      console.warn("[OOM] Failed to create learning attempt:", error?.message);
      return null;
    }
    return (data as { id: string }).id;
  } catch (err) {
    console.warn("[OOM] Failed to create learning attempt:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Queries (for My Page)
// ---------------------------------------------------------------------------

export async function getRecentSessions(
  limit = 20,
): Promise<LearningSession[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("learning_sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error || !data) {
      console.warn("[OOM] Failed to fetch learning sessions:", error?.message);
      throw new Error("학습 기록을 불러오지 못했습니다.");
    }
    return (data as LearningSessionRow[]).map(mapSession);
  } catch (err) {
    if (err instanceof Error && err.message === "학습 기록을 불러오지 못했습니다.") throw err;
    console.warn("[OOM] Failed to fetch learning sessions:", err);
    throw new Error("학습 기록을 불러오지 못했습니다.", { cause: err });
  }
}
