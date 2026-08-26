import type { TrainingLevelId } from "../../training/types";

export const SELF_INTRODUCTION_PROMPT =
  "Let's start the interview now. Tell me something about yourself.";

export const SELF_INTRODUCTION_COPY = {
  eyebrow: "WARM-UP",
  title: "자기소개",
  summary: "시험 시작에서 첫 목소리를 안정시키는 짧은 워밍업입니다.",
  guide:
    "길게 외우기보다 20~30초 안에서 현재 나 → 평소 일상/취미 → 자연스러운 마무리 정도만 준비하세요.",
  helper: "실전 연습 시작 시 자기소개 워밍업으로 직접 말해볼 수 있어요.",
  magazinePath: "/magazine/opic-self-introduction-strategy/",
} as const;

export type SelfIntroductionExample = {
  durationLabel: string;
  targetSeconds: readonly [number, number];
  description: string;
  example: string;
};

export const SELF_INTRODUCTION_BY_LEVEL: Record<
  TrainingLevelId,
  SelfIntroductionExample
> = {
  foundation: {
    durationLabel: "약 15~20초",
    targetSeconds: [15, 20],
    description: "쉬운 3~4문장으로 현재 일상과 좋아하는 활동을 짧게 연결합니다.",
    example:
      "Hi, I'm happy to be here. These days, I spend most of my time at home and around my neighborhood. I enjoy listening to music and taking short walks on weekends. I'll try to speak comfortably and share my everyday stories.",
  },
  intermediate: {
    durationLabel: "약 20~25초",
    targetSeconds: [20, 25],
    description: "4~5문장으로 평일 루틴과 주말 활동을 자연스럽게 이어 봅니다.",
    example:
      "Hi, it's nice to meet you. These days, I have a simple routine around work and home, and I try to make time for myself. I often listen to music or take a walk after a busy day. On weekends, I usually meet friends or relax at a cafe. I'll speak naturally and share a few everyday experiences today.",
  },
  advanced: {
    durationLabel: "약 25~30초",
    targetSeconds: [25, 30],
    description: "일상과 여가 사이에 자연스러운 연결을 더해 편안한 첫 발화를 만듭니다.",
    example:
      "Hi, it's nice to meet you. These days, I keep a fairly balanced routine, so I take care of my usual responsibilities and save some time to recharge afterward. I often listen to music, take a walk, or visit a quiet cafe when I need a break. On weekends, I like trying something different with friends or family. I'll speak as naturally as I can and share a few everyday experiences along the way.",
  },
};

export function getSelfIntroduction(levelId: TrainingLevelId) {
  return SELF_INTRODUCTION_BY_LEVEL[levelId];
}
