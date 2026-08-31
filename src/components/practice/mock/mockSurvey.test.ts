import { describe, expect, it } from "vitest";
import { backgroundSurveySections } from "../../../data/fixedSurvey";
import { resolveTrainingContext } from "../../../training/courseRegistry";
import {
  createInitialMockSurveySelection,
  getEligibleMockStorylineIds,
  validateMockSurveySelection,
} from "./mockSurvey";

describe("Mock Survey", () => {
  it("starts from the current Course preset without changing TrainingSelection", () => {
    const resolved = resolveTrainingContext("course-2", "intermediate");
    const selection = createInitialMockSurveySelection(resolved);

    expect(selection.selectedOptionIds).toEqual([
      ...resolved.survey.profileOptionIds,
      ...resolved.survey.residenceOptionIds,
      ...resolved.survey.activityOptionIds,
    ]);
    expect(validateMockSurveySelection(selection).valid).toBe(true);
  });

  it("uses the canonical section selection and minimum rules", () => {
    const resolved = resolveTrainingContext("course-1", "advanced");
    const selection = createInitialMockSurveySelection(resolved);
    const leisureIds = new Set(
      backgroundSurveySections.find((section) => section.id === "leisure")?.options.map((option) => option.id),
    );
    const invalid = {
      selectedOptionIds: selection.selectedOptionIds.filter((optionId) => !leisureIds.has(optionId)),
    };

    expect(validateMockSurveySelection(invalid)).toEqual({ valid: false, invalidSectionIds: ["leisure"] });
  });

  it("derives eligibility only from surveyOptionIds, never prompt text", () => {
    const resolved = resolveTrainingContext("course-3", "foundation");
    const selectedOptionIds = [resolved.storylines[0].surveyOptionIds[0]];

    expect(getEligibleMockStorylineIds(resolved, { selectedOptionIds })).toEqual([resolved.storylines[0].id]);
  });
});
