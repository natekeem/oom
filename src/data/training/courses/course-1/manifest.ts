import type { CourseDefinition } from '../../../../training/types';

export const course = {
  "id": "course-1",
  "version": 1,
  "title": "Everyday & Getaway",
  "subtitle": "가족·일상·취미·짧은 여행을 네 개의 재사용 장면으로 묶는 균형형 코스",
  "description": "현재 OOM의 main 4개 스크립트를 1구간 기준점으로 유지한다. 가족 여행, 카페/휴식, 테니스/쇼핑, 집/동네를 통해 익숙한 일상 주제와 경험·변화·문제 해결을 균형 있게 연습한다.",
  "displaySummary": "여행 · 카페 · 운동 · 집처럼 익숙한 일상 경험을 활용하는 균형형 코스",
  "recommendedFor": ["처음 코스를 고르거나 여러 일상 주제를 고르게 연습하고 싶은 분", "가족 여행과 집·카페·취미 경험을 편하게 말할 수 있는 분"],
  "surveyPresetId": "course-1-survey",
  "storylineIds": [
    "outdoor-travel",
    "indoor-rest",
    "sports-hobby",
    "home-residence"
  ],
  "roleplayIds": [
    "hotel-booking",
    "tennis-court",
    "cleaning-reschedule"
  ],
  "practiceQuestionPoolId": "course-1-questions",
  "status": "ready",
  "recommendedBadge": "균형형"
} as const satisfies CourseDefinition;
