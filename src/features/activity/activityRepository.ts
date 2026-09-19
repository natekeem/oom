import { supabase } from "../../lib/supabase";

export type ActivityType = "survey_completed" | "universal_script_completed" | "roleplay_completed";
export type StudyUnit = { activity_type: ActivityType; course_id: string; level_id: string; content_id: string };
export type ActivityEvent = StudyUnit & { id: string; user_id: string; occurred_at: string; created_at: string };

export async function insertActivity(userId: string, id: string, unit: StudyUnit): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("learning_activity_events").insert({ ...unit, user_id: userId, id });
    // A retry of the same completion has the same primary key.
    return !error || error.code === "23505";
  } catch { return false; }
}

export async function getRecentActivities(userId: string): Promise<ActivityEvent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("learning_activity_events").select("*")
    .eq("user_id", userId).order("occurred_at", { ascending: false }).limit(20);
  if (error) throw new Error("학습 활동을 불러오지 못했습니다.");
  return data ?? [];
}
