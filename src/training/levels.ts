import type { TrainingLevelDefinition } from "./types";

export const TRAINING_LEVELS: TrainingLevelDefinition[] = [
  {
    id: "advanced",
    displayOrder: 1,
    displayName: "1구간",
    targetGrades: ["AL"],
    targetLabel: "AL",
    recommendedFor: ["현재 IH", "현재 IM3"],
    difficulty: { initial: 5, second: 5, label: "5-5" },
    targetSeconds: [60, 90],
    learningFocus: [
      "구체적 장면",
      "과거 경험",
      "비교/변화",
      "문제/예상 밖 상황",
      "질문별 즉흥 변형",
    ],
    disclaimer:
      "이 난이도와 스크립트는 AL 등급을 보장하지 않는 OOM 학습 프리셋이다.",
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
    learningFocus: [
      "장소·루틴·이유 연결",
      "최근 경험 1개",
      "간단한 비교/변화",
      "핵심 블록 재사용",
    ],
    disclaimer:
      "이 난이도와 스크립트는 특정 등급을 보장하지 않는 OOM 학습 프리셋이다.",
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
    learningFocus: [
      "누구·어디·무엇·왜",
      "짧고 안정적인 문장",
      "기본 현재 루틴",
      "간단한 최근 경험",
    ],
    disclaimer:
      "짧더라도 질문에 직접 답하고 장면을 끝까지 완성하는 것을 우선한다.",
  },
];

export function formatTrainingPreset(level: TrainingLevelDefinition) {
  return `${level.displayName} · ${level.targetLabel} · ${level.targetSeconds[0]}~${level.targetSeconds[1]}초 연습 preset`;
}
