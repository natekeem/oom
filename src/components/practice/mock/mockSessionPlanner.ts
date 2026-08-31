import type {
  ResolvedTrainingContext,
  TrainingLevelId,
  TrainingPracticeQuestion,
  TrainingRoleplay,
} from "../../../training/types";
import type {
  MockAdjustment,
  MockQuestion,
  MockSessionPlan,
  MockSurveySelection,
} from "./mockSessionTypes";
import { getEligibleMockStorylineIds } from "./mockSurvey";

export type MockRng = () => number;

const SESSION_2_COUNTS: Record<TrainingLevelId, number> = {
  foundation: 5,
  intermediate: 7,
  advanced: 8,
};

const ROLEPLAY_COUNTS: Record<TrainingLevelId, number> = {
  foundation: 1,
  intermediate: 2,
  advanced: 3,
};

export function createMockSeed(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createSeededRng(seed: string): MockRng {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], rng: MockRng): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function uniqueQuestions(questions: readonly TrainingPracticeQuestion[]) {
  return [...new Map(questions.map((question) => [question.id, question])).values()];
}

function groupQuestions(questions: readonly TrainingPracticeQuestion[]) {
  const groups = new Map<string, TrainingPracticeQuestion[]>();
  for (const question of uniqueQuestions(questions)) {
    const key = question.storylineId || question.group || "ungrouped";
    const group = groups.get(key) ?? [];
    group.push(question);
    groups.set(key, group);
  }
  return groups;
}

function selectSession1Questions(
  questions: readonly TrainingPracticeQuestion[],
  requestedCount: number,
  rng: MockRng,
) {
  const groups = groupQuestions(questions);
  const groupOrder = shuffled([...groups.keys()], rng);
  const selected: TrainingPracticeQuestion[] = [];
  const selectedIds = new Set<string>();

  // Current Course data has three ordered prompts per storyline. Taking complete
  // shuffled clusters gives the intended 3 + 3 + 1 OOM training heuristic.
  for (const groupId of groupOrder) {
    for (const question of groups.get(groupId) ?? []) {
      if (selected.length >= requestedCount) break;
      if (!selectedIds.has(question.id)) {
        selected.push(question);
        selectedIds.add(question.id);
      }
    }
    if (selected.length >= requestedCount) break;
  }

  // Sparse or irregular future data can still contribute any remaining unique prompts.
  if (selected.length < requestedCount) {
    for (const question of uniqueQuestions(questions)) {
      if (selected.length >= requestedCount) break;
      if (!selectedIds.has(question.id)) {
        selected.push(question);
        selectedIds.add(question.id);
      }
    }
  }
  return selected;
}

function selectBalancedQuestions(
  questions: readonly TrainingPracticeQuestion[],
  requestedCount: number,
  rng: MockRng,
) {
  const groups = groupQuestions(questions);
  const groupOrder = shuffled([...groups.keys()], rng);
  const cursors = new Map(groupOrder.map((groupId) => [groupId, 0]));
  const selected: TrainingPracticeQuestion[] = [];
  const selectedIds = new Set<string>();

  while (selected.length < requestedCount) {
    let added = false;
    for (const groupId of groupOrder) {
      const group = groups.get(groupId) ?? [];
      let cursor = cursors.get(groupId) ?? 0;
      while (cursor < group.length && selectedIds.has(group[cursor].id)) cursor += 1;
      cursors.set(groupId, cursor + 1);
      const question = group[cursor];
      if (!question) continue;
      selected.push(question);
      selectedIds.add(question.id);
      added = true;
      if (selected.length >= requestedCount) break;
    }
    if (!added) break;
  }
  return selected;
}

function fillFromPreferredPool(
  questions: readonly TrainingPracticeQuestion[],
  preferredStorylineIds: ReadonlySet<string>,
  requestedCount: number,
  rng: MockRng,
  selector: (
    pool: readonly TrainingPracticeQuestion[],
    count: number,
    source: MockRng,
  ) => TrainingPracticeQuestion[],
) {
  const preferred = questions.filter((question) => preferredStorylineIds.has(question.storylineId));
  const selected = selector(preferred, requestedCount, rng);
  if (selected.length >= requestedCount) return selected;
  const selectedIds = new Set(selected.map((question) => question.id));
  const fallback = selector(
    questions.filter((question) => !selectedIds.has(question.id)),
    requestedCount - selected.length,
    rng,
  );
  return [...selected, ...fallback];
}

function asPracticeQuestion(
  question: TrainingPracticeQuestion,
  sequence: number,
): MockQuestion {
  return {
    mockId: `practice:${question.levelId}:${question.id}:${sequence}`,
    sourceId: question.id,
    kind: "practice",
    courseId: question.courseId,
    sourceLevelId: question.levelId,
    group: question.group,
    type: question.type,
    prompt: question.prompt,
    storylineId: question.storylineId,
  };
}

function asRoleplayQuestion(
  roleplay: TrainingRoleplay,
  levelId: TrainingLevelId,
  sequence: number,
): MockQuestion {
  return {
    mockId: `roleplay:${levelId}:${roleplay.id}:${sequence}`,
    sourceId: roleplay.id,
    kind: "roleplay",
    courseId: roleplay.courseId,
    sourceLevelId: levelId,
    group: roleplay.group,
    type: roleplay.title,
    prompt: roleplay.prompt,
    roleplayId: roleplay.id,
  };
}

function interleaveQuestions(general: MockQuestion[], roleplays: MockQuestion[]) {
  if (roleplays.length === 0) return general;
  const result: MockQuestion[] = [];
  let generalIndex = 0;
  let roleplayIndex = 0;

  while (generalIndex < general.length || roleplayIndex < roleplays.length) {
    const remainingGeneral = general.length - generalIndex;
    const remainingRoleplays = roleplays.length - roleplayIndex;
    const generalBeforeRoleplay = Math.max(1, Math.ceil(remainingGeneral / (remainingRoleplays + 1)));

    for (let count = 0; count < generalBeforeRoleplay && generalIndex < general.length; count += 1) {
      result.push(general[generalIndex]);
      generalIndex += 1;
    }
    if (roleplayIndex < roleplays.length) {
      result.push(roleplays[roleplayIndex]);
      roleplayIndex += 1;
    }
  }
  return result;
}

export function resolveAdjustedPromptLevel(
  selectedLevelId: TrainingLevelId,
  adjustment: MockAdjustment,
): TrainingLevelId {
  if (selectedLevelId === "foundation") {
    return adjustment === "harder" ? "intermediate" : "foundation";
  }
  if (selectedLevelId === "advanced") {
    return adjustment === "easier" ? "intermediate" : "advanced";
  }
  if (adjustment === "easier") return "foundation";
  if (adjustment === "harder") return "advanced";
  return "intermediate";
}

export type CreateInitialMockPlanInput = {
  resolved: ResolvedTrainingContext;
  initialLevelId: TrainingLevelId;
  surveySelection: MockSurveySelection;
};

export function createInitialMockPlan(
  { resolved, initialLevelId, surveySelection }: CreateInitialMockPlanInput,
  seed = createMockSeed(),
  rng: MockRng = createSeededRng(seed),
): MockSessionPlan {
  if (resolved.level.id !== initialLevelId) {
    throw new Error("Mock Session 1 context does not match the selected Self Assessment Level.");
  }
  const eligibleStorylineIds = getEligibleMockStorylineIds(resolved, surveySelection);
  const session1 = fillFromPreferredPool(
    resolved.questions,
    new Set(eligibleStorylineIds),
    7,
    rng,
    selectSession1Questions,
  ).map(asPracticeQuestion);
  return {
    seed,
    selectedCourseId: resolved.course.id,
    selectedLevelId: initialLevelId,
    surveySelection: { selectedOptionIds: [...surveySelection.selectedOptionIds] },
    eligibleStorylineIds,
    session1,
    session2: [],
    createdAt: Date.now(),
  };
}

export function completeMockPlanAfterAdjustment(
  plan: MockSessionPlan,
  adjustment: MockAdjustment,
  secondResolved: ResolvedTrainingContext,
  rng: MockRng = createSeededRng(`${plan.seed}:${adjustment}`),
): MockSessionPlan {
  const effectiveLevelId = resolveAdjustedPromptLevel(plan.selectedLevelId, adjustment);
  if (secondResolved.course.id !== plan.selectedCourseId || secondResolved.level.id !== effectiveLevelId) {
    throw new Error("Mock Session 2 context does not match the fixed Course and adjusted Level.");
  }

  const totalCount = SESSION_2_COUNTS[effectiveLevelId];
  const roleplayCount = Math.min(ROLEPLAY_COUNTS[effectiveLevelId], secondResolved.roleplays.length);
  const generalCount = totalCount - roleplayCount;
  const session1Ids = new Set(plan.session1.filter((item) => item.kind === "practice").map((item) => item.sourceId));
  const generalPool = secondResolved.questions.filter(
    (question) => effectiveLevelId !== plan.selectedLevelId || !session1Ids.has(question.id),
  );
  const general = fillFromPreferredPool(
    generalPool,
    new Set(plan.eligibleStorylineIds),
    generalCount,
    rng,
    selectBalancedQuestions,
  ).map(asPracticeQuestion);
  const roleplays = shuffled(
    [...new Map(secondResolved.roleplays.map((roleplay) => [roleplay.id, roleplay])).values()],
    rng,
  )
    .slice(0, roleplayCount)
    .map((roleplay, index) => asRoleplayQuestion(roleplay, effectiveLevelId, index));

  return {
    ...plan,
    adjustment,
    effectiveSecondLevelId: effectiveLevelId,
    session2: interleaveQuestions(general, roleplays).map((question, index) => ({
      ...question,
      mockId: `${question.mockId}:session2:${index}`,
    })),
  };
}

export const mockSessionHeuristics = {
  session2Counts: SESSION_2_COUNTS,
  roleplayCounts: ROLEPLAY_COUNTS,
};
