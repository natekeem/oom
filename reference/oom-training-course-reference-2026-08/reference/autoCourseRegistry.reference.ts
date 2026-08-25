/**
 * Vite build-time auto discovery reference.
 * Goal: Course 4+ should be addable by creating a course folder, without editing a TS union or UI list.
 *
 * Recommended real source layout:
 * src/data/training/courses/course-1/{manifest,survey,storylines,roleplays,questions}.ts
 * src/data/training/courses/course-2/{...}
 * src/data/training/courses/course-3/{...}
 * src/data/training/courses/course-4/{...}
 */

import type {
  SurveyPreset,
  TrainingCourseDefinition,
  TrainingPracticeQuestion,
  TrainingRoleplay,
  TrainingStoryline,
} from "./trainingTypes.reference";

type CourseModule = {
  default?: TrainingCourseDefinition;
  course?: TrainingCourseDefinition;
};

// Build-time glob: a newly committed course folder is discovered on the next Vite build.
const manifestModules = import.meta.glob(
  "/src/data/training/courses/*/manifest.ts",
  { eager: true },
) as Record<string, CourseModule>;

export const discoveredCourses = Object.values(manifestModules)
  .map((mod) => mod.default ?? mod.course)
  .filter((value): value is TrainingCourseDefinition => Boolean(value))
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

/**
 * For survey/storyline/roleplay/question payloads, either:
 * A) import them from each manifest and expose one CourseBundle (recommended), or
 * B) use additional import.meta.glob calls.
 *
 * Runtime note: this is static hosting. Adding a source file requires a rebuild/deploy.
 * It does NOT mean the already-deployed site can discover arbitrary new files at runtime.
 */
export type CourseBundle = {
  course: TrainingCourseDefinition;
  survey: SurveyPreset;
  storylines: TrainingStoryline[];
  roleplays: TrainingRoleplay[];
  questions: TrainingPracticeQuestion[];
};
