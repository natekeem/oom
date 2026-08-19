import type { CourseDefinition } from '../../../../training/types';

export const course = {
  "id": "course-3",
  "version": 1,
  "title": "Nature & Weekend",
  "subtitle": "자연과 주말 활동 중심의 아웃도어 코스",
  "description": "아웃도어와 주말 경험을 선호하는 학습자를 위한 선택형 코스로, 룸메이트 거주 및 캠핑·하이킹·사진 중심의 4개 스토리를 제공한다.",
  "surveyPresetId": "course-3-survey",
  "storylineIds": [
    "trail-photo",
    "coastal-camp",
    "museum-reading",
    "shared-home-vacation"
  ],
  "roleplayIds": [
    "campground-weather-change",
    "museum-ticket-policy",
    "rental-car-problem"
  ],
  "practiceQuestionPoolId": "course-3-questions",
  "status": "ready",
  "recommendedBadge": "아웃도어형"
} as const satisfies CourseDefinition;
