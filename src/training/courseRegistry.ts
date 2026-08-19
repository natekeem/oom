import type {
  CourseBundle,
  ResolvedTrainingContext,
  TrainingCourseId,
  TrainingLevelId,
} from './types';
import type { ScriptVariantSet, ScriptReplacementGuide } from '../types';
import { TRAINING_LEVELS } from './levels';

const bundleModules = import.meta.glob<{ default: CourseBundle }>(
  '/src/data/training/courses/*/index.ts',
  { eager: true }
);

const bundles = Object.values(bundleModules)
  .map(m => m.default)
  .filter(Boolean)
  .sort((a, b) => a.course.id.localeCompare(b.course.id, undefined, { numeric: true }));

export const discoveredCourses = bundles.map(b => b.course);
export const allSurveyPresets = bundles.map(b => b.survey);
export const allStorylines = bundles.flatMap(b => b.storylines);
export const allRoleplays = bundles.flatMap(b => b.roleplays);
export const allQuestions = bundles.flatMap(b => b.questions);

export function resolveTrainingContext(
  courseId: TrainingCourseId,
  levelId: TrainingLevelId
): ResolvedTrainingContext {
  const bundle = bundles.find(b => b.course.id === courseId);
  const level = TRAINING_LEVELS.find(l => l.id === levelId);
  if (!bundle || !level) throw new Error(`Invalid training selection: ${courseId}/${levelId}`);

  return {
    course: bundle.course,
    level,
    survey: bundle.survey,
    storylines: bundle.storylines.map(s => ({
      ...s,
      active: s.levels[levelId as keyof typeof s.levels],
    })),
    roleplays: bundle.roleplays.map(r => ({
      ...r,
      active: r.levels[levelId as keyof typeof r.levels],
    })),
    questions: bundle.questions.filter(q => q.levelId === levelId),
    variantSets: bundle.variantSets ?? {},
    replacementGuides: bundle.replacementGuides ?? {},
  };
}

export function getTrainingVariantSet(
  courseId: TrainingCourseId,
  storylineId: string
): ScriptVariantSet | undefined {
  const bundle = bundles.find(b => b.course.id === courseId);
  return bundle?.variantSets?.[storylineId];
}

export function getTrainingReplacementGuide(
  courseId: TrainingCourseId,
  storylineId: string,
  variantId: string
): ScriptReplacementGuide | undefined {
  const bundle = bundles.find(b => b.course.id === courseId);
  const key = `${storylineId}:${variantId}`;
  return bundle?.replacementGuides?.[key];
}
