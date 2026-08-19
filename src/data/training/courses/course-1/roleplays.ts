import type { TrainingRoleplay } from '../../../../training/types';

export const roleplays = [
  {
    "id": "hotel-booking",
    "courseId": "course-1",
    "title": "호텔 예약 문제",
    "group": "야외 / 여행",
    "situation": "가족 여행을 위해 예약한 바닷가 호텔의 객실 유형이 예약 내용과 다름",
    "prompt": "You are at a hotel. Explain that there is a problem with your reservation and ask the front desk to help you.",
    "answerStructure": [
      "상황 시작",
      "예약 내용 vs 실제",
      "해결 요청",
      "대안",
      "감사"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I have a problem with my room. I booked an ocean-view room, but this room does not have an ocean view. Could you check my reservation? If possible, can I move to another room? Thank you.",
        "focus": [
          "문제 직접 설명",
          "핵심 요청"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I have a problem with my reservation. I booked an ocean-view room for my family, but the room we received faces the parking lot. Could you check if another ocean-view room is available? If not, could we move tomorrow or get a partial refund? Thank you for your help.",
        "focus": [
          "맥락",
          "요청",
          "대안 1~2개"
        ]
      },
      "advanced": {
        "englishExample": "Hello, I'm sorry, but there seems to be a problem with my family reservation. I booked an ocean-view room for two nights, but the room we received faces the parking lot. Could you first check whether the original room type is available today? If it is fully booked, would it be possible to move us tomorrow and offer a partial refund for tonight, or suggest another room with a similar view? I understand the hotel may be busy, so I would appreciate whichever option causes the least disruption.",
        "focus": [
          "구체 조건",
          "여러 대안",
          "협상/최적안",
          "비용·조건 확인"
        ]
      }
    }
  },
  {
    "id": "tennis-court",
    "courseId": "course-1",
    "title": "테니스 코트 예약 문제",
    "group": "운동 / 취미",
    "situation": "비 때문에 야외 테니스 코트를 사용할 수 없음",
    "prompt": "Call the sports center. Explain the court reservation problem and ask for a new time or another solution.",
    "answerStructure": [
      "예약·날씨 문제",
      "동행자 맥락",
      "대안 1",
      "대안 2",
      "조건 확인"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I have a tennis court reservation for Saturday, but it is raining. Can I change the time? Do you have an indoor court? If not, can I use the reservation on another day? Thank you.",
        "focus": [
          "문제 직접 설명",
          "핵심 요청"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I have a tennis court reservation for Saturday morning, but I heard the outdoor court may close because of the rain. My friend and I still want to practice. Is an indoor court available? If not, can we move the reservation to Sunday afternoon or keep the payment as credit?",
        "focus": [
          "맥락",
          "요청",
          "대안 1~2개"
        ]
      },
      "advanced": {
        "englishExample": "Hello, I'm calling about our Saturday morning tennis reservation. I received a notice that the outdoor courts may close because of the rain, and my practice partner and I already arranged our schedules around the booking. Could you check whether an indoor court is available around the same time? If all indoor courts are full, Sunday afternoon would work, or we could keep the payment as credit for next weekend. Could you tell me which option has no extra fee?",
        "focus": [
          "구체 조건",
          "여러 대안",
          "협상/최적안",
          "비용·조건 확인"
        ]
      }
    }
  },
  {
    "id": "cleaning-reschedule",
    "courseId": "course-1",
    "title": "청소 일정 변경",
    "group": "집 / 거주지",
    "situation": "가족 행사와 청소업체 방문 시간이 겹침",
    "prompt": "Call a cleaning company. Explain your scheduling problem and ask to reschedule the service.",
    "answerStructure": [
      "기존 예약",
      "변경 이유",
      "희망 시간",
      "대안",
      "비용/크레딧"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I need to change my cleaning appointment this Saturday. I have a family event. Can I move it to next week? Is Tuesday evening available? Thank you.",
        "focus": [
          "문제 직접 설명",
          "핵심 요청"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I'm calling about my cleaning appointment this Saturday afternoon. A family event changed, so nobody will be home. Can I move the appointment to Tuesday evening or Saturday morning next week? Please also tell me if there is a change fee.",
        "focus": [
          "맥락",
          "요청",
          "대안 1~2개"
        ]
      },
      "advanced": {
        "englishExample": "Hi, I'm calling about the cleaning appointment scheduled for this Saturday afternoon. A family event was unexpectedly moved to the same time, so nobody will be home to let the cleaner in. Could we move it to Tuesday evening or next Saturday morning? If those times are unavailable, I would be happy to keep the payment as credit. Please let me know whether any change fee applies and what the earliest available slot would be.",
        "focus": [
          "구체 조건",
          "여러 대안",
          "협상/최적안",
          "비용·조건 확인"
        ]
      }
    }
  }
] as const satisfies readonly TrainingRoleplay[];
