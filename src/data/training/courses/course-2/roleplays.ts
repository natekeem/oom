import type { TrainingRoleplay } from '../../../../training/types';

export const roleplays = [
  {
    "id": "ticket-seat-problem",
    "courseId": "course-2",
    "title": "영화·공연 티켓 좌석 문제",
    "group": "문화 / 음악",
    "situation": "예약한 두 좌석이 떨어져 배정됨",
    "learningFunction": "티켓 문제 설명 → 좌석 확인 → 교환·보상 요청",
    "prompt": "Talk to the ticket desk. Explain the problem with your ticket and ask for another seat or another show.",
    "answerStructure": [
      "티켓 문제",
      "원래 조건",
      "좌석 변경",
      "다른 회차",
      "환불/크레딧"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I think there is a problem with my ticket. I booked two seats together, but these seats are separate. Can you change the seats? If not, can we watch another show? Thank you.",
        "focus": [
          "문제 직접 설명",
          "핵심 요청"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I booked two seats together for tonight's show, but the tickets I received are in different rows. Could you check if there are two seats together? If not, can we change to a later show or get a refund?",
        "focus": [
          "맥락",
          "요청",
          "대안 1~2개"
        ]
      },
      "advanced": {
        "englishExample": "Hello, I need some help with two tickets for tonight's performance. I selected two seats together when I booked online, but the issued tickets are in different rows, which makes it difficult because I came with a friend. Could you check whether any two adjacent seats are available, even in a different section? If the venue is full, we could attend the later show, or I would like to know whether a refund or credit is possible. Which option would be easiest to process?",
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
    "id": "store-exchange",
    "courseId": "course-2",
    "title": "쇼핑 교환·환불 문제",
    "group": "쇼핑 / 생활",
    "situation": "구매한 무선 이어폰의 연결이 자주 끊김",
    "learningFunction": "상품 문제 설명 → 교환 조건 확인 → 환불 대안 요청",
    "prompt": "Return to a store. Explain the problem with an item you bought and ask for an exchange or refund.",
    "answerStructure": [
      "구매 정보",
      "문제 증상",
      "교환",
      "대체 모델/크레딧",
      "환불 조건"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I bought these earphones here, but they do not work well. The connection stops often. Can I exchange them? If not, can I get a refund? I have the receipt.",
        "focus": [
          "문제 직접 설명",
          "핵심 요청"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I bought these wireless earphones here three days ago, but the connection keeps dropping. I have the receipt and the box. Could I exchange them for another pair? If that model is not available, can I get store credit or a refund?",
        "focus": [
          "맥락",
          "요청",
          "대안 1~2개"
        ]
      },
      "advanced": {
        "englishExample": "Hi, I bought these wireless earphones here three days ago after trying the display model, but the pair I received keeps losing connection during normal use. I brought the receipt, original box, and all accessories. Could you first check whether I qualify for an exchange? If the same model is out of stock, I would be open to paying the difference for another model, or receiving store credit. If neither is possible, please explain the refund policy and the fastest option.",
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
    "id": "city-tour-change",
    "courseId": "course-2",
    "title": "도시 여행 예약 변경",
    "group": "집 / 휴가 / 여행",
    "situation": "기차 도착 지연으로 예약한 도시 투어 시간에 맞출 수 없음",
    "learningFunction": "일정 변경 확인 → 가능한 시간 질문 → 취소·환불 요청",
    "prompt": "Call a tour company. Explain that your train arrives late and ask to change the tour time or find another option.",
    "answerStructure": [
      "예약 시간",
      "변경 원인",
      "오후 대안",
      "다음 날/크레딧",
      "수수료"
    ],
    "levels": {
      "foundation": {
        "englishExample": "Hi, I booked a city tour for 10 a.m., but my train will arrive late. Can I change to the afternoon tour? If not, can I use the ticket tomorrow? Thank you.",
        "focus": [
          "문제 직접 설명",
          "핵심 요청"
        ]
      },
      "intermediate": {
        "englishExample": "Hello, I booked the 10 a.m. city tour, but my train schedule changed and I will arrive around 11. Is there an afternoon tour I can join? If it is full, can I move the booking to tomorrow or get credit?",
        "focus": [
          "맥락",
          "요청",
          "대안 1~2개"
        ]
      },
      "advanced": {
        "englishExample": "Hello, I'm calling about my 10 a.m. city tour reservation. The train company changed my arrival time, so I will not reach the city until around 11, and I do not want to keep the group waiting. Could you move me to an afternoon departure if there is space? If all tours are full today, tomorrow morning would also work, or I could accept credit for a future booking. Could you tell me whether any change fee applies and which option you recommend?",
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
