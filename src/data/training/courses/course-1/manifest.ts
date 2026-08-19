import type { CourseDefinition } from '../../../../training/types';

export const course = {
  "id": "course-1",
  "version": 1,
  "title": "Everyday & Getaway",
  "subtitle": "가족·일상·취미·짧은 여행을 네 개의 재사용 장면으로 묶는 균형형 코스",
  "description": "현재 OOM의 main 4개 스크립트를 1구간 기준점으로 유지한다. 가족 여행, 카페/휴식, 테니스/쇼핑, 집/동네를 통해 익숙한 일상 주제와 경험·변화·문제 해결을 균형 있게 연습한다.",
  "surveyPresetId": "course-1-survey",
  "storylineIds": [
    "outdoor-travel",
    "indoor-rest",
    "sports-hobby",
    "home-residence"
  ],
  "roleplayIds": [
    "outdoor-hotel-trouble",
    "indoor-cafe-order",
    "sports-court-change",
    "home-repair-request"
  ],
  "practiceQuestionPoolId": "course-1-questions",
  "status": "ready",
  "recommendedBadge": "균형형"
} as const satisfies CourseDefinition;
