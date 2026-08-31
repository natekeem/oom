import { describe, expect, it } from "vitest";
import { resolveTrainingContext } from "../../../training/courseRegistry";
import type {
  ResolvedTrainingContext,
  TrainingPracticeQuestion,
  TrainingRoleplay,
} from "../../../training/types";
import {
  completeMockPlanAfterAdjustment,
  createInitialMockPlan,
  mockSessionHeuristics,
  resolveAdjustedPromptLevel,
} from "./mockSessionPlanner";
import { createInitialMockSurveySelection } from "./mockSurvey";

const fixedRng = () => 0.42;
const inputFor = (resolved: ResolvedTrainingContext) => ({
  resolved,
  initialLevelId: resolved.level.id,
  surveySelection: createInitialMockSurveySelection(resolved),
});

describe("mockSessionPlanner", () => {
  it("builds one deterministic seven-question Session 1 from the selected Course and Level", () => {
    const resolved = resolveTrainingContext("course-2", "intermediate");
    const first = createInitialMockPlan(inputFor(resolved), "fixed-seed", fixedRng);
    const second = createInitialMockPlan(inputFor(resolved), "fixed-seed", fixedRng);

    expect(first.session1).toEqual(second.session1);
    expect(first.session1).toHaveLength(7);
    expect(first.session1.every((question) => question.kind === "practice")).toBe(true);
    expect(new Set(first.session1.map((question) => question.sourceId)).size).toBe(7);
    expect(first.session1.every((question) => question.courseId === "course-2")).toBe(true);
    expect(first.session1.every((question) => question.sourceLevelId === "intermediate")).toBe(true);
    expect(first.session1.every(Boolean)).toBe(true);

    const distribution = new Map<string, number>();
    for (const question of first.session1) {
      const key = question.storylineId ?? question.group;
      distribution.set(key, (distribution.get(key) ?? 0) + 1);
    }
    expect(Math.max(...distribution.values())).toBeLessThanOrEqual(3);
    expect(distribution.size).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ["foundation", "easier", "foundation"],
    ["foundation", "similar", "foundation"],
    ["foundation", "harder", "intermediate"],
    ["intermediate", "easier", "foundation"],
    ["intermediate", "similar", "intermediate"],
    ["intermediate", "harder", "advanced"],
    ["advanced", "easier", "intermediate"],
    ["advanced", "similar", "advanced"],
    ["advanced", "harder", "advanced"],
  ] as const)("maps %s + %s to %s", (selected, adjustment, expected) => {
    expect(resolveAdjustedPromptLevel(selected, adjustment)).toBe(expected);
  });

  it.each(["foundation", "intermediate", "advanced"] as const)(
    "builds the %s Session 2 count and bounded, separated roleplays",
    (effectiveLevel) => {
      const adjustment = effectiveLevel === "foundation" ? "easier" : effectiveLevel === "advanced" ? "harder" : "similar";
      const selectedLevel = effectiveLevel === "foundation" ? "intermediate" : effectiveLevel;
      const selected = resolveTrainingContext("course-1", selectedLevel);
      const initial = createInitialMockPlan(inputFor(selected), `seed-${effectiveLevel}`, fixedRng);
      const secondResolved = resolveTrainingContext("course-1", effectiveLevel);
      const completed = completeMockPlanAfterAdjustment(initial, adjustment, secondResolved, fixedRng);
      const roleplays = completed.session2.filter((question) => question.kind === "roleplay");

      expect(completed.session2).toHaveLength(mockSessionHeuristics.session2Counts[effectiveLevel]);
      expect(roleplays.length).toBeLessThanOrEqual(mockSessionHeuristics.roleplayCounts[effectiveLevel]);
      expect(roleplays.length).toBeLessThanOrEqual(secondResolved.roleplays.length);
      expect(new Set(roleplays.map((question) => question.sourceId)).size).toBe(roleplays.length);
      expect(completed.session2.every((question) => question.courseId === "course-1")).toBe(true);
      expect(completed.session2.every((question) => question.sourceLevelId === effectiveLevel)).toBe(true);
      for (let index = 1; index < completed.session2.length; index += 1) {
        expect(
          completed.session2[index - 1].kind === "roleplay" && completed.session2[index].kind === "roleplay",
        ).toBe(false);
      }
    },
  );

  it("does not repeat general source IDs when Session 2 stays on the same Level", () => {
    const resolved = resolveTrainingContext("course-3", "advanced");
    const initial = createInitialMockPlan(inputFor(resolved), "same-level", fixedRng);
    const completed = completeMockPlanAfterAdjustment(initial, "similar", resolved, fixedRng);
    const allGeneral = [...initial.session1, ...completed.session2].filter((question) => question.kind === "practice");
    expect(new Set(allGeneral.map((question) => question.sourceId)).size).toBe(allGeneral.length);
  });

  it("degrades safely for sparse future pools without pushing undefined", () => {
    const base = resolveTrainingContext("course-1", "foundation");
    const sparseQuestions: TrainingPracticeQuestion[] = base.questions.slice(0, 3);
    const sparseRoleplays: TrainingRoleplay[] = base.roleplays.slice(0, 1);
    const sparse = {
      ...base,
      questions: sparseQuestions,
      roleplays: sparseRoleplays.map((roleplay) => ({ ...roleplay, active: roleplay.levels.foundation })),
    } satisfies ResolvedTrainingContext;

    const initial = createInitialMockPlan(inputFor(sparse), "sparse", fixedRng);
    expect(initial.session1).toHaveLength(3);
    expect(initial.session1.every(Boolean)).toBe(true);

    const completed = completeMockPlanAfterAdjustment(initial, "similar", sparse, fixedRng);
    expect(completed.session2.every(Boolean)).toBe(true);
    expect(new Set(completed.session2.map((question) => `${question.kind}:${question.sourceId}`)).size).toBe(
      completed.session2.length,
    );
  });

  it("uses explicit surveyOptionIds to prioritize eligible storylines without keyword matching", () => {
    const resolved = resolveTrainingContext("course-1", "advanced");
    const eligibleStorylines = resolved.storylines.slice(0, 3);
    const excludedOptionIds = new Set(resolved.storylines[3].surveyOptionIds);
    const selectedOptionIds = eligibleStorylines
      .flatMap((storyline) => storyline.surveyOptionIds)
      .filter((optionId) => !excludedOptionIds.has(optionId));
    const initial = createInitialMockPlan(
      {
        resolved,
        initialLevelId: "advanced",
        surveySelection: { selectedOptionIds },
      },
      "survey-filter",
      fixedRng,
    );

    expect(initial.eligibleStorylineIds).toEqual(eligibleStorylines.map((storyline) => storyline.id));
    expect(initial.session1).toHaveLength(7);
    expect(initial.session1.every((question) => initial.eligibleStorylineIds.includes(question.storylineId ?? ""))).toBe(true);
  });
});
