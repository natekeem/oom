import type { TrainingRoleplay } from '../../../../training/types';

export const roleplays = [
  {
    "id": "campground-weather-change",
    "courseId": "course-3",
    "title": "캠핑장 날씨·예약 변경",
    "group": "캠핑 / 해변 / 드라이브",
    "situation": "강풍 예보 때문에 예약한 텐트 사이트를 그대로 쓰기 어려운 상황",
    "prompt": "Call the campground. Explain the weather problem and ask for a safer option.",
    "answerStructure": [
      "예약 확인",
      "날씨 문제 설명",
      "대안 요청",
      "비용/변경 조건 확인"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I have a campsite reservation for Saturday, but the weather forecast says there will be strong wind. Can I change the date? If not, do you have a cabin? Thank you.",
        "focus": [
          "문제",
          "요청 1개",
          "대안 1개"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I have a tent-site reservation for Saturday, but the forecast says there may be very strong wind near the coast. Could I move the reservation to Sunday? If that is not possible, do you have a cabin or a more protected site available? Please also tell me if there is a change fee.",
        "focus": [
          "예약 맥락",
          "대안 2개",
          "수수료"
        ]
      },
      "advanced": {
        "englishExample": "Hello, I’m calling about my coastal campsite reservation for this Saturday. The latest forecast shows strong wind, and I’m concerned that our small tent may not be safe in an exposed site. Could you first check whether we can move the reservation to Sunday without losing the payment? If Sunday is full, I’d also be interested in a cabin or a more sheltered site for Saturday. Could you compare the additional cost and cancellation rules for those options so I can choose the safest one?",
        "focus": [
          "위험 설명",
          "우선순위",
          "복수 대안 비교",
          "조건 확인"
        ]
      }
    }
  },
  {
    "id": "museum-ticket-policy",
    "courseId": "course-3",
    "title": "박물관 티켓·촬영 정책 문의",
    "group": "박물관 / 사진 / 독서",
    "situation": "예약한 전시 시간에 늦을 것 같고 사진 촬영 가능 여부도 확인해야 하는 상황",
    "prompt": "Call the museum. Explain that you may be late and ask about your ticket and the photography policy.",
    "answerStructure": [
      "티켓 정보",
      "지각 문제",
      "다른 시간 요청",
      "촬영 정책 확인"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I have a ticket for the 2 p.m. exhibition, but I may be late. Can I enter at 3 p.m.? Also, can I take pictures inside? Thank you.",
        "focus": [
          "시간 문제",
          "변경 요청",
          "질문"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I have a 2 p.m. ticket for the photography exhibition, but my bus is delayed and I may arrive around 2:40. Can I use the same ticket for a later time slot? Also, are phone pictures allowed if I do not use a flash?",
        "focus": [
          "구체 시간",
          "대안 시간",
          "촬영 조건"
        ]
      },
      "advanced": {
        "englishExample": "Hello, I have a timed ticket for the photography exhibition at 2 p.m., but my bus has been delayed and I will probably arrive about forty minutes late. Could you tell me whether the ticket is still valid, or whether I should move it to the next available time slot? I’m also bringing my phone because I enjoy photography. Are personal photos allowed in this exhibition if I avoid flash, and are there any rooms where photography is completely restricted?",
        "focus": [
          "상황 설명",
          "규칙 확인",
          "조건부 질문",
          "대안"
        ]
      }
    }
  },
  {
    "id": "rental-car-problem",
    "courseId": "course-3",
    "title": "로드트립 렌터카 문제",
    "group": "캠핑 / 해변 / 드라이브",
    "situation": "예약한 작은 차 대신 너무 큰 차량만 준비되어 있어 변경이 필요한 상황",
    "prompt": "Talk to the rental-car desk. Explain the problem and ask for another car or another solution.",
    "answerStructure": [
      "예약 차량",
      "현재 문제",
      "대체 차량",
      "가격/반납 조건"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I booked a small car, but this car is too big for me. Do you have another small car? If not, can I get the same price for a different car?",
        "focus": [
          "예약",
          "문제",
          "교체 요청"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I reserved a compact car for a weekend trip, but only a large SUV is ready. I am not comfortable driving such a big car. Could you check for another compact or midsize car? If none is available, can I use a different model without paying an upgrade fee?",
        "focus": [
          "사용 이유",
          "대체 차종",
          "추가비용"
        ]
      },
      "advanced": {
        "englishExample": "Hello, I reserved a compact car for a coastal road trip because I’m more comfortable with a smaller vehicle, but I was told that only a large SUV is available. Could you check nearby inventory for a compact or midsize car first? If there is no smaller vehicle today, I could take the SUV as long as there is no upgrade charge, or I could wait for the next returned car if the delay is reasonable. Could you explain which option would affect my return time or total price the least?",
        "focus": [
          "선호 이유",
          "재고 대안",
          "비용/시간 비교",
          "협상"
        ]
      }
    }
  }
] as const satisfies readonly TrainingRoleplay[];
