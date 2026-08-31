import { backgroundSurveySections } from "../../../data/fixedSurvey";
import type { ResolvedTrainingContext } from "../../../training/types";
import type { MockSurveySelection } from "./mockSessionTypes";

export function createInitialMockSurveySelection(
  resolved: ResolvedTrainingContext,
): MockSurveySelection {
  return {
    selectedOptionIds: [
      ...resolved.survey.profileOptionIds,
      ...resolved.survey.residenceOptionIds,
      ...resolved.survey.activityOptionIds,
    ],
  };
}

export function validateMockSurveySelection(selection: MockSurveySelection) {
  const selected = new Set(selection.selectedOptionIds);
  const invalidSectionIds = backgroundSurveySections
    .filter((section) => {
      const count = section.options.filter((option) => selected.has(option.id)).length;
      return section.selection === "single" ? count !== 1 : count < (section.minSelections ?? 0);
    })
    .map((section) => section.id);
  return { valid: invalidSectionIds.length === 0, invalidSectionIds };
}

export function getEligibleMockStorylineIds(
  resolved: ResolvedTrainingContext,
  selection: MockSurveySelection,
) {
  const selected = new Set(selection.selectedOptionIds);
  return resolved.storylines
    .filter((storyline) => storyline.surveyOptionIds.some((optionId) => selected.has(optionId)))
    .map((storyline) => storyline.id);
}
