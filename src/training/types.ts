/**
 * Training system types for the Level × Course architecture.
 *
 * Course owns survey/story context.
 * Level owns difficulty/answer density.
 */
import type { ScriptVariantSet, ScriptReplacementGuide } from "../types";

/* ---------- Level ---------- */

export type TrainingLevelId = "advanced" | "intermediate" | "foundation";

export type DifficultyPreset = {
  initial: 3 | 4 | 5 | 6;
  second: 3 | 4 | 5 | 6;
  label: string;
};

export type TrainingLevelDefinition = {
  id: TrainingLevelId;
  displayOrder: 1 | 2 | 3;
  displayName: string;
  targetGrades: string[];
  targetLabel: string;
  recommendedFor: string[];
  difficulty: DifficultyPreset;
  targetSeconds: [number, number];
  learningFocus: string[];
  disclaimer?: string;
};

/* ---------- Course ---------- */

export type TrainingCourseId = `course-${number}`;

export type TrainingCourseDefinition = {
  id: TrainingCourseId;
  version: number;
  title: string;
  subtitle: string;
  description: string;
  recommendedBadge?: string;
  surveyPresetId: string;
  storylineIds: string[];
  roleplayIds: string[];
  practiceQuestionPoolId: string;
  status: "draft" | "ready";
};

export type CourseDefinition = TrainingCourseDefinition;

/* ---------- Survey ---------- */

export type SurveyPreset = {
  id: string;
  courseId: TrainingCourseId;
  profileOptionIds: string[];
  residenceOptionIds: string[];
  activityOptionIds: string[];
  displaySummary: string[];
  strategyNote?: string;
};

/* ---------- Storyline ---------- */

export type StoryLevelContent = {
  koreanSummary: string;
  englishScript: string;
  skills: string[];
};

export type TrainingStoryline = {
  id: string;
  courseId: TrainingCourseId;
  group: string;
  title: string;
  surveyOptionIds: string[];
  core: {
    anchorScene: string;
    facts: string[];
    reusableFor: string[];
  };
  levels: Record<TrainingLevelId, StoryLevelContent>;
};

/* ---------- Roleplay ---------- */

export type LevelRoleplayContent = {
  englishExample: string;
  focus: string[];
};

export type TrainingRoleplay = {
  id: string;
  courseId: TrainingCourseId;
  title: string;
  group: string;
  situation: string;
  prompt: string;
  answerStructure: string[];
  levels: Record<TrainingLevelId, LevelRoleplayContent>;
};

/* ---------- Practice ---------- */

export type PracticeQuestionType =
  | "description"
  | "routine"
  | "recent-experience"
  | "comparison"
  | "change"
  | "unexpected-situation"
  | "problem"
  | "opinion"
  | "hobby"
  | "shopping";

export type TrainingPracticeQuestion = {
  id: string;
  courseId: TrainingCourseId;
  levelId: TrainingLevelId;
  storylineId: string;
  group: string;
  type: PracticeQuestionType | string;
  prompt: string;
};

/* ---------- Selection & Context ---------- */

export type TrainingSelection = {
  courseId: TrainingCourseId;
  levelId: TrainingLevelId;
  selectedAt: string;
};

export type ResolvedTrainingContext = {
  course: TrainingCourseDefinition;
  level: TrainingLevelDefinition;
  survey: SurveyPreset;
  storylines: Array<TrainingStoryline & { active: StoryLevelContent }>;
  roleplays: Array<TrainingRoleplay & { active: LevelRoleplayContent }>;
  questions: TrainingPracticeQuestion[];
  variantSets: Record<string, ScriptVariantSet>;
  replacementGuides: Record<string, ScriptReplacementGuide>;
};

/* ---------- Course Bundle (for auto-discovery) ---------- */

export type CourseBundle = {
  course: TrainingCourseDefinition;
  survey: SurveyPreset;
  storylines: readonly TrainingStoryline[];
  roleplays: readonly TrainingRoleplay[];
  questions: readonly TrainingPracticeQuestion[];
  variantSets?: Record<string, ScriptVariantSet>;
  replacementGuides?: Record<string, ScriptReplacementGuide>;
};
