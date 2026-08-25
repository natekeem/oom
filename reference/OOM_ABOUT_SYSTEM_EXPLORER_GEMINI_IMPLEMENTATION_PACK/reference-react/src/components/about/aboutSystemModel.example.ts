/*
PSEUDOCODE / ADAPTER EXAMPLE.

DO NOT paste this until you inspect actual OOM exports.
The entire point is to ADAPT current canonical data, not duplicate it.
*/

import type { AboutCourseOption, AboutLevelOption } from "./types";

// Example shape only:
//
// import { trainingCourses } from "...actual registry...";
// import { resolveTrainingContext } from "...actual source...";
// import type { TrainingCourseId, TrainingLevelId } from "...actual types...";

export function makeAboutCourses(/* registry */): AboutCourseOption[] {
  // return registry.map((course) => ({
  //   id: course.id,
  //   label: course.displayName,
  //   helper: course.shortLabel, // ONLY if it actually exists.
  // }));
  throw new Error("Adapt to actual Course registry.");
}

export function makeAboutLevels(/* canonical level ids */): AboutLevelOption[] {
  /*
  return levelIds.map((levelId) => {
    const context = resolveTrainingContext(defaultCourseId, levelId);

    return {
      id: levelId,
      sectionLabel: context.level.sectionLabel,
      label: context.level.displayName,
      targetSecondsLabel: context.level.targetSecondsLabel,
    };
  });
  */

  throw new Error("Adapt to actual level source-of-truth.");
}
