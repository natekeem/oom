import type { VoiceCandidate } from "./types";

export const VOICE_CANDIDATES: VoiceCandidate[] = [
  {
    id: "af_heart",
    label: "Heart",
    grade: "A",
    note: "첫 비교 기준. 안정적이고 또렷한 미국 여성 음성.",
  },
  {
    id: "af_bella",
    label: "Bella",
    grade: "A-",
    note: "따뜻하고 선명한 톤. interviewer / script 둘 다 비교 가치가 큼.",
  },
  {
    id: "af_sarah",
    label: "Sarah",
    grade: "C+",
    note: "상대적으로 담백한 톤. Bella와의 대비 청취용.",
  },
  {
    id: "af_nicole",
    label: "Nicole",
    grade: "B-",
    note: "학습 음성량이 많은 편. 사람다운 리듬인지 확인하기 좋은 후보.",
  },
  {
    id: "af_nova",
    label: "Nova",
    grade: "C",
    note: "밝은 계열 비교 후보. 시험 음성보다는 script 쪽도 함께 평가.",
  },
  {
    id: "af_sky",
    label: "Sky",
    grade: "C-",
    note: "가벼운 음색 비교 후보. Ava-like 기준에서는 직접 청취 후 판단.",
  },
];

export const EXAM_DEFAULT_TEXT =
  "Let's begin. Tell me about a place you visit often. What does it look like, and what do you usually do there? Give me as many details as you can.";

export const SCRIPT_DEFAULT_TEXT =
  "One place I really enjoy visiting is a quiet beach near my city. I usually go there on weekends with a close friend. We walk along the shore, take a few pictures, and sometimes stay until sunset. What I like most is that the place feels calm and gives me time to slow down.";

export const STORAGE_KEYS = {
  examVoice: "oom.voiceLab.examVoice",
  scriptVoice: "oom.voiceLab.scriptVoice",
  ratings: "oom.voiceLab.ratings",
} as const;
