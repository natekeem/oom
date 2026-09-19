import type { Session, User } from "@supabase/supabase-js";
import type { LearningSessionRow, LearningAttemptRow } from "../features/history/historyTypes";
import type { LearningPreferencesRow } from "../features/preferences/preferenceTypes";

export type UserPlan = "free" | "pro";
export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};
export type Database = {
  public: {
    Tables: {
    learning_activity_events: {
      Row: import("../features/activity/activityRepository").ActivityEvent;
      Insert: import("../features/activity/activityRepository").StudyUnit & { id: string; user_id: string };
      Update: never;
      Relationships: [];
    };
    profiles: {
      Row: ProfileRow;
      Insert: { id: string; display_name?: string | null; avatar_url?: string | null };
      Update: { display_name?: string | null; avatar_url?: string | null };
      Relationships: [];
    };
    learning_sessions: {
      Row: LearningSessionRow;
      Insert: {
        id?: string;
        user_id: string;
        mode: string;
        status?: string;
        target_level?: string | null;
        question_count?: number;
        answered_count?: number;
        created_at?: string;
        completed_at?: string | null;
        updated_at?: string;
      };
      Update: {
        status?: string;
        target_level?: string | null;
        question_count?: number;
        answered_count?: number;
        completed_at?: string | null;
        updated_at?: string;
      };
      Relationships: [];
    };
    learning_attempts: {
      Row: LearningAttemptRow;
      Insert: {
        id?: string;
        session_id: string;
        user_id: string;
        question_id: string;
        question_order?: number | null;
        duration_seconds?: number | null;
        completed?: boolean;
        answered_at?: string;
      };
      Update: {
        question_order?: number | null;
        duration_seconds?: number | null;
        completed?: boolean;
        answered_at?: string;
      };
      Relationships: [];
    };
    learning_preferences: {
      Row: LearningPreferencesRow;
      Insert: {
        user_id: string;
        target_level?: string | null;
        course_id?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        target_level?: string | null;
        course_id?: string | null;
        updated_at?: string;
      };
      Relationships: [];
    };
  };
  Views: {
    [_ in never]: never;
  };
  Functions: {
    [_ in never]: never;
  };
  Enums: {
    [_ in never]: never;
  };
  CompositeTypes: {
    [_ in never]: never;
  };
};
};
export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}
export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  status: "loading" | "authenticated" | "anonymous" | "unconfigured";
  error: string | null;
  profileError: string | null;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
