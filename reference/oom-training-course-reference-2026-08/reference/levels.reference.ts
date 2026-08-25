import type { TrainingLevelDefinition } from "./trainingTypes.reference";

export const TRAINING_LEVELS: TrainingLevelDefinition[] = [
  {
    id: "advanced",
    displayOrder: 1,
    displayName: "1구간",
    targetGrades: ["AL"],
    targetLabel: "AL (Advanced Low)",
    recommendedFor: ["현재 IH", "현재 IM3"],
    difficulty: { initial: 5, second: 5, label: "5-5" },
    targetSeconds: [60, 90],
    learningFocus: ["구체적 장면", "과거 경험", "비교/변화", "문제 해결", "즉흥 변형"],
    disclaimer: "등급을 보장하는 난이도 프리셋이 아닙니다.",
  },
  {
    id: "intermediate",
    displayOrder: 2,
    displayName: "2구간",
    targetGrades: ["IH", "IM3"],
    targetLabel: "IH / IM3",
    recommendedFor: ["현재 IM2", "현재 IM1"],
    difficulty: { initial: 4, second: 4, label: "4-4" },
    targetSeconds: [45, 65],
    learningFocus: ["장소+루틴+이유", "최근 경험", "간단한 비교/변화"],
  },
  {
    id: "foundation",
    displayOrder: 3,
    displayName: "3구간",
    targetGrades: ["IM2", "IM1"],
    targetLabel: "IM2 / IM1",
    recommendedFor: ["무등급", "OPIc 초보"],
    difficulty: { initial: 3, second: 3, label: "3-3" },
    targetSeconds: [30, 45],
    learningFocus: ["누구/어디/무엇/왜", "짧고 안정적인 문장", "간단한 경험"],
  },
];
