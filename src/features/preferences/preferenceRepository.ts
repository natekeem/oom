/**
 * Phase 2.7: Supabase data-access layer for learning preferences.
 *
 * All `.from('learning_preferences')` calls live here.
 * Every method is best-effort: failures return null/false and log a warning.
 * The UI layer never needs to know raw Supabase table or column names.
 */

import { supabase } from "../../lib/supabase";
import type { TrainingCourseId, TrainingLevelId } from "../../training/types";
import type { LearningPreferences, LearningPreferencesRow } from "./preferenceTypes";
import { mapPreferences } from "./preferenceTypes";

export async function getPreferences(userId: string): Promise<LearningPreferences | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("learning_preferences")
      .select()
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[OOM] Failed to fetch learning preferences:", error.message);
      return null;
    }
    if (!data) return null;
    return mapPreferences(data as LearningPreferencesRow);
  } catch (err) {
    console.warn("[OOM] Failed to fetch learning preferences:", err);
    return null;
  }
}

export async function upsertPreferences(
  userId: string,
  prefs: { targetLevel: TrainingLevelId; courseId: TrainingCourseId },
): Promise<LearningPreferences | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("learning_preferences")
      .upsert(
        {
          user_id: userId,
          target_level: prefs.targetLevel,
          course_id: prefs.courseId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error || !data) {
      console.warn("[OOM] Failed to save learning preferences:", error?.message);
      return null;
    }
    return mapPreferences(data as LearningPreferencesRow);
  } catch (err) {
    console.warn("[OOM] Failed to save learning preferences:", err);
    return null;
  }
}

export async function clearPreferences(userId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("learning_preferences")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.warn("[OOM] Failed to clear learning preferences:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[OOM] Failed to clear learning preferences:", err);
    return false;
  }
}
