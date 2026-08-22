import type { CourseDefinition } from '../../../../training/types';

export const course = {
  "id": "course-2",
  "version": 1,
  "title": "Culture & City",
  "subtitle": "문화·도시형 설문과 스토리로 구성한 준비 효율형 코스",
  "description": "2025~2026 공개 서베이 전략에서 자주 언급되는 준비 효율형 조합을 바탕으로, Course 1과 다른 4개의 anchor scene을 새로 작성했다.",
  "displaySummary": "영화 · 공연 · 쇼핑 · 걷기처럼 적은 이야기로 많은 주제를 묶는 준비 효율형 코스",
  "recommendedFor": ["문화생활과 도시 경험을 익숙한 소재로 쓰고 싶은 분", "적은 이야기로 여러 질문을 효율적으로 준비하고 싶은 분"],
  "surveyPresetId": "course-2-survey",
  "storylineIds": [
    "culture-night",
    "smart-shopping",
    "light-fitness",
    "solo-staycation"
  ],
  "roleplayIds": [
    "ticket-seat-problem",
    "store-exchange",
    "city-tour-change"
  ],
  "practiceQuestionPoolId": "course-2-questions",
  "status": "ready",
  "recommendedBadge": "준비 효율 추천"
} as const satisfies CourseDefinition;
