import type { ResolvedTrainingContext } from "../../training/types";

export type ViewId =
  | "home"
  | "exam-guide"
  | "exam-overview"
  | "exam-apply"
  | "exam-day"
  | "exam-results"
  | "exam-faq"
  | "training-hub"
  | "survey"
  | "difficulty"
  | "script-hub"
  | "script-outdoor"
  | "script-indoor"
  | "script-sports"
  | "script-home"
  | "roleplay"
  | "roleplay-hub"
  | "roleplay-formula"
  | "roleplay-travel"
  | "roleplay-indoor"
  | "roleplay-sports"
  | "roleplay-home"
  | "practice"
  | "ai-settings"
  | "magazine-list"
  | "about"
  | "privacy"
  | "contact"
  | "terms"
  | "editorial-policy"
  | "image-credits";

export const viewTitles: Record<ViewId, string> = {
  home: "홈 / 전략 개요",
  "exam-guide": "OPIc 수험 가이드",
  "exam-overview": "OPIc 수험 가이드 · 소개 · 등급",
  "exam-apply": "OPIc 수험 가이드 · 신청 · 응시료",
  "exam-day": "OPIc 수험 가이드 · 시험 당일",
  "exam-results": "OPIc 수험 가이드 · 성적 · 인증서",
  "exam-faq": "OPIc 수험 가이드 · 자주 묻는 질문",
  "training-hub": "STEP 1. 목표 구간 · 코스 설정",
  survey: "STEP 2. 서베이 고정",
  difficulty: "STEP 3. 난이도 설정",
  "script-hub": "STEP 4. 만능 스크립트",
  "script-outdoor": "STEP 4. 그룹 1 스크립트",
  "script-indoor": "STEP 4. 그룹 2 스크립트",
  "script-sports": "STEP 4. 그룹 3 스크립트",
  "script-home": "STEP 4. 그룹 4 스크립트",
  roleplay: "STEP 5. 롤플레이 공식",
  "roleplay-hub": "STEP 5. 롤플레이 공식",
  "roleplay-formula": "STEP 5. 롤플레이 공식",
  "roleplay-travel": "STEP 5. 그룹 1 롤플레이",
  "roleplay-indoor": "STEP 5. 그룹 2 롤플레이",
  "roleplay-sports": "STEP 5. 그룹 3 롤플레이",
  "roleplay-home": "STEP 5. 그룹 4 롤플레이",
  practice: "STEP 6. 실전 연습",
  "ai-settings": "AI 피드백 / 설정",
  "magazine-list": "오픽 매거진",
  about: "소개",
  privacy: "개인정보처리방침",
  contact: "문의",
  terms: "이용약관",
  "editorial-policy": "편집 원칙",
  "image-credits": "이미지 출처",
};

export function getViewTitle(viewId: ViewId, resolved?: ResolvedTrainingContext | null): string {
  if (resolved) {
    if (viewId === "script-outdoor") return `STEP 4. ${resolved.storylines[0]?.group ?? "그룹 1"}`;
    if (viewId === "script-indoor") return `STEP 4. ${resolved.storylines[1]?.group ?? "그룹 2"}`;
    if (viewId === "script-sports") return `STEP 4. ${resolved.storylines[2]?.group ?? "그룹 3"}`;
    if (viewId === "script-home") return `STEP 4. ${resolved.storylines[3]?.group ?? "그룹 4"}`;
    if (viewId === "roleplay-travel") return `STEP 5. ${resolved.roleplays[0]?.group ?? "그룹 1"}`;
    if (viewId === "roleplay-indoor") return `STEP 5. ${resolved.roleplays[1]?.group ?? "그룹 2"}`;
    if (viewId === "roleplay-sports") return `STEP 5. ${resolved.roleplays[2]?.group ?? "그룹 3"}`;
    if (viewId === "roleplay-home") return `STEP 5. ${resolved.roleplays[3]?.group ?? "그룹 4"}`;
  }
  return viewTitles[viewId] ?? "";
}
