import type {
  SurveyPreset,
  TrainingCourseDefinition,
  TrainingLevelId,
  TrainingPracticeQuestion,
  TrainingRoleplay,
  TrainingStoryline,
} from "./trainingTypes.reference";

const LEVELS: TrainingLevelId[] = ["foundation", "intermediate", "advanced"];

export function validateTrainingContent(input: {
  courses: TrainingCourseDefinition[];
  surveys: SurveyPreset[];
  storylines: TrainingStoryline[];
  roleplays: TrainingRoleplay[];
  questions: TrainingPracticeQuestion[];
}) {
  const errors: string[] = [];

  for (const course of input.courses) {
    if (!input.surveys.some((x) => x.id === course.surveyPresetId)) {
      errors.push(`${course.id}: missing survey`);
    }

    const stories = input.storylines.filter((x) => x.courseId === course.id);
    if (!stories.length) errors.push(`${course.id}: no storylines`);

    for (const story of stories) {
      for (const level of LEVELS) {
        if (!story.levels[level]?.englishScript?.trim()) {
          errors.push(`${course.id}/${story.id}/${level}: missing script`);
        }
      }
    }

    const roleplays = input.roleplays.filter((x) => x.courseId === course.id);
    for (const scenario of roleplays) {
      for (const level of LEVELS) {
        if (!scenario.levels[level]?.englishExample?.trim()) {
          errors.push(`${course.id}/${scenario.id}/${level}: missing roleplay`);
        }
      }
    }

    for (const level of LEVELS) {
      const count = input.questions.filter(
        (x) => x.courseId === course.id && x.levelId === level,
      ).length;
      if (count < 12) {
        errors.push(`${course.id}/${level}: expected >= 12 questions, got ${count}`);
      }
    }
  }

  if (errors.length) {
    throw new Error(`Training content validation failed:\n${errors.join("\n")}`);
  }
}
