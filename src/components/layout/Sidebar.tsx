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
  "training-hub": "OPIc 실전 훈련하기",
  survey: "STEP 1. 서베이 고정",
  difficulty: "STEP 2. 난이도 설정",
  "script-hub": "STEP 3. 만능 스크립트",
  "script-outdoor": "STEP 3. 야외 / 여행",
  "script-indoor": "STEP 3. 실내 / 휴식",
  "script-sports": "STEP 3. 운동 / 취미",
  "script-home": "STEP 3. 집 / 거주지",
  roleplay: "STEP 4. 롤플레이 공식",
  "roleplay-hub": "STEP 4. 롤플레이 공식",
  "roleplay-formula": "STEP 4. 공식 · 출제 구조",
  "roleplay-travel": "STEP 4. 야외 / 여행",
  "roleplay-indoor": "STEP 4. 실내 / 휴식",
  "roleplay-sports": "STEP 4. 운동 / 취미",
  "roleplay-home": "STEP 4. 집 / 거주지",
  practice: "STEP 5. 실전 연습",
  "ai-settings": "AI 피드백 / 설정",
  "magazine-list": "오픽 매거진",
  about: "소개",
  privacy: "개인정보처리방침",
  contact: "문의",
  terms: "이용약관",
  "editorial-policy": "편집 원칙",
  "image-credits": "이미지 출처",
};
