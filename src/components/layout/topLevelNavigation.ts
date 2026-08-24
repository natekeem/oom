import {
  Bot,
  BookOpenCheck,
  BookOpenText,
  CirclePlay,
  House,
} from "lucide-react";

export const topLevelNavigation = {
  about: {
    icon: House,
    label: "오픽온미란?",
  },
  examGuide: {
    icon: BookOpenCheck,
    label: "OPIc 수험 가이드",
  },
  training: {
    icon: CirclePlay,
    label: "OPIc 실전 훈련하기",
  },
  magazine: {
    icon: BookOpenText,
    label: "오픽 매거진",
  },
  aiSettings: {
    icon: Bot,
    label: "AI 피드백 / 설정",
  },
} as const;
