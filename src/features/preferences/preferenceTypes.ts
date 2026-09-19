import type { TrainingLevelId, TrainingCourseId } from "../../training/types";

export type LearningPreferences = {
  userId: string;
  targetLevel: TrainingLevelId | null;
  courseId: TrainingCourseId | null;
  createdAt: string;
  updatedAt: string;
};

export type LearningPreferencesRow = {
  user_id: string;
  target_level: string | null;
  course_id: string | null;
  created_at: string;
  updated_at: string;
};

export function mapPreferences(row: LearningPreferencesRow): LearningPreferences {
  const validLevels: TrainingLevelId[] = ["advanced", "intermediate", "foundation"];
  const targetLevel =
    row.target_level && validLevels.includes(row.target_level as TrainingLevelId)
      ? (row.target_level as TrainingLevelId)
      : null;

  return {
    userId: row.user_id,
    targetLevel,
    courseId: (row.course_id as TrainingCourseId) || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
