import { discoveredCourses } from "../../training/courseRegistry";
import { TRAINING_LEVELS } from "../../training/levels";
import type { TrainingCourseId, TrainingLevelId } from "../../training/types";
import type { AboutCourseOption, AboutLevelOption } from "./types";

export function makeAboutCourses(): AboutCourseOption<TrainingCourseId>[] {
  return discoveredCourses.map((course) => ({
    id: course.id,
    label: course.title,
    helper: course.subtitle,
  }));
}

export function makeAboutLevels(): AboutLevelOption<TrainingLevelId>[] {
  return TRAINING_LEVELS.map((level) => {
    return {
      id: level.id,
      sectionLabel: level.displayName,
      label: level.targetLabel,
      targetSecondsLabel: `${level.targetSeconds[0]}–${level.targetSeconds[1]}초`,
    };
  });
}
