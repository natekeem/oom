/**
 * Phase 2: Learning history types.
 *
 * Frontend model for learning sessions and attempts persisted in Supabase.
 * Database snake_case ↔ camelCase mapping happens at the repository boundary.
 */

// -- Domain types ----------------------------------------------------------

export type LearningMode = "quick_practice" | "mock_test";

export type LearningSessionStatus = "in_progress" | "completed" | "abandoned";

export interface LearningSession {
  id: string;
  mode: LearningMode;
  status: LearningSessionStatus;
  targetLevel: string | null;
  questionCount: number;
  answeredCount: number;
  startedAt: string;
  completedAt: string | null;
}

export interface LearningAttempt {
  id: string;
  sessionId: string;
  questionId: string;
  questionOrder: number | null;
  durationSeconds: number | null;
  completed: boolean;
  answeredAt: string;
}

// -- Database row types (snake_case, matching Supabase REST) ---------------

export type LearningSessionRow = {
  id: string;
  user_id: string;
  mode: LearningMode;
  status: LearningSessionStatus;
  target_level: string | null;
  question_count: number;
  answered_count: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LearningAttemptRow = {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  question_order: number | null;
  duration_seconds: number | null;
  completed: boolean;
  answered_at: string;
  created_at: string;
};

// -- Mapping helpers -------------------------------------------------------

export function mapSession(row: LearningSessionRow): LearningSession {
  return {
    id: row.id,
    mode: row.mode,
    status: row.status,
    targetLevel: row.target_level,
    questionCount: row.question_count,
    answeredCount: row.answered_count,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export function mapAttempt(row: LearningAttemptRow): LearningAttempt {
  return {
    id: row.id,
    sessionId: row.session_id,
    questionId: row.question_id,
    questionOrder: row.question_order,
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    answeredAt: row.answered_at,
  };
}
