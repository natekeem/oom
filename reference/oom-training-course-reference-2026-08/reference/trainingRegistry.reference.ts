import type {
  ResolvedTrainingContext,
  SurveyPreset,
  TrainingCourseDefinition,
  TrainingLevelId,
  TrainingPracticeQuestion,
  TrainingRoleplay,
  TrainingStoryline,
} from "./trainingTypes.reference";
import { TRAINING_LEVELS } from "./levels.reference";

/**
 * Import real data instead of these declarations.
 * See ../content/*.json.
 */
declare const courses: TrainingCourseDefinition[];
declare const surveyPresets: SurveyPreset[];
declare const storylines: TrainingStoryline[];
declare const roleplays: TrainingRoleplay[];
declare const practiceQuestions: TrainingPracticeQuestion[];

export function resolveTrainingContext(
  courseId: TrainingCourseDefinition["id"],
  levelId: TrainingLevelId,
): ResolvedTrainingContext {
  const course = courses.find((x) => x.id === courseId);
  const level = TRAINING_LEVELS.find((x) => x.id === levelId);
  const survey = surveyPresets.find((x) => x.id === course?.surveyPresetId);

  if (!course || !level || !survey) {
    throw new Error(`Invalid training selection: ${courseId}/${levelId}`);
  }

  const activeStorylines = storylines
    .filter((x) => x.courseId === courseId && course.storylineIds.includes(x.id))
    .map((x) => ({ ...x, active: x.levels[levelId] }));

  const activeRoleplays = roleplays
    .filter((x) => x.courseId === courseId && course.roleplayIds.includes(x.id))
    .map((x) => ({ ...x, active: x.levels[levelId] }));

  const activeQuestions = practiceQuestions.filter(
    (x) => x.courseId === courseId && x.levelId === levelId,
  );

  return {
    course,
    level,
    survey,
    storylines: activeStorylines,
    roleplays: activeRoleplays,
    questions: activeQuestions,
  };
}
