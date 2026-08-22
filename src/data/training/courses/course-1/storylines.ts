import type { TrainingStoryline } from '../../../../training/types';

export const storylines = [
  {
    "id": "outdoor-travel",
    "courseId": "course-1",
    "group": "야외 / 여행",
    "title": "바닷가 리조트에서 보낸 가족 여행",
    "baseQuestion": {
      "en": "Tell me about a memorable family trip you took. Where did you go, and what did you do there?",
      "ko": "기억에 남는 가족 여행을 말해 주세요. 어디에 갔고 그곳에서 무엇을 했나요?",
      "functionLabel": "가족 여행 · 활동 · 기억"
    },
    "surveyOptionIds": [
      "leisure-park",
      "leisure-beach",
      "sport-walking",
      "sport-jogging",
      "vacation-domestic",
      "vacation-overseas"
    ],
    "core": {
      "anchorScene": "따뜻한 토요일, 가족과 바닷가 근처 작은 리조트에서 산책·가벼운 조깅·해산물 저녁을 즐긴 경험",
      "facts": [
        "family getaway",
        "small beach resort",
        "ocean view",
        "walking path",
        "slow walk",
        "pictures",
        "light jog",
        "seafood dinner",
        "felt relaxed"
      ],
      "reusableFor": [
        "공원/해변 묘사",
        "최근 여행",
        "야외 루틴",
        "날씨·풍경",
        "여행 방식 변화"
      ]
    },
    "levels": {
      "advanced": {
        "koreanSummary": "최근 가족과 바닷가 근처 작은 리조트에 갔습니다. 따뜻한 날씨에 바다를 보며 걷고 사진을 찍고, 가볍게 조깅한 뒤 해산물을 먹었습니다. 조용한 풍경 덕분에 평소 스트레스가 풀렸고 오래 기억에 남는 여행이었습니다.",
        "englishScript": "Actually, one of the best outdoor experiences I had recently was a short family getaway to a small resort near the beach. We left early on a warm Saturday morning, so the roads were quiet and the whole trip felt easy from the beginning. When we arrived, I could see the ocean from the balcony, and there was a long walking path next to the beach.\n\nThe thing is, I do not need a complicated plan to enjoy a trip. My family and I took a slow walk, took a few pictures, and sat on a bench to watch the waves. Later, I even did a light jog along the path because the weather was cool and fresh. In the evening, we had seafood at a small restaurant near the resort and talked about our favorite moments from the day.\n\nWhat I remember most is how relaxed I felt. The sound of the water, the open view, and the time with my family helped me forget my usual stress. It was really memorable, and since then I have wanted to visit more parks and beaches whenever I need a break.",
        "skills": [
          "구체적 풍경",
          "루틴+최근 경험 결합",
          "감정 변화",
          "since then 변화"
        ]
      },
      "intermediate": {
        "koreanSummary": "가족과 바닷가 리조트에 가서 바다를 보고 산책하고 사진을 찍었습니다. 저녁에는 해산물을 먹었고, 복잡한 계획 없이 가족과 천천히 시간을 보내서 편안했습니다.",
        "englishScript": "Actually, I recently went to a small beach resort with my family. We arrived on a warm Saturday, and I could see the ocean from our room. There was a nice walking path next to the beach, so we walked slowly, took pictures, and watched the waves.\n\nLater, I did a short jog because the air was cool, and in the evening we had seafood at a nearby restaurant. I liked the trip because we did not have a busy schedule. We just spent time together and enjoyed the view. I felt relaxed, and since then I have wanted to visit the beach more often when I need a break.",
        "skills": [
          "장소+활동",
          "이유",
          "짧은 최근 경험",
          "간단한 변화"
        ]
      },
      "foundation": {
        "koreanSummary": "가족과 바닷가에 갔습니다. 바다를 보고 걷고 사진을 찍었습니다. 저녁에는 해산물을 먹었습니다. 조용하고 편안해서 좋았습니다.",
        "englishScript": "I like going to the beach with my family. Recently, we stayed at a small resort near the ocean. The weather was nice, so we walked along the beach and took some pictures.\n\nI also did a short jog, and later we ate seafood together. The trip was simple, but I really liked it because I felt relaxed. I want to go there again.",
        "skills": [
          "장소",
          "활동 2~3개",
          "간단한 과거 경험",
          "감정"
        ]
      }
    }
  },
  {
    "id": "indoor-rest",
    "courseId": "course-1",
    "group": "실내 / 휴식",
    "title": "조용한 카페와 집에서의 휴식 루틴",
    "baseQuestion": {
      "en": "Tell me about your favorite way to relax after a busy week. Where do you go, and what do you usually do?",
      "ko": "바쁜 한 주 뒤 가장 좋아하는 휴식 방법을 말해 주세요. 어디에 가고 보통 무엇을 하나요?",
      "functionLabel": "휴식 장소 · 일상 루틴"
    },
    "surveyOptionIds": [
      "leisure-cafe",
      "interest-music",
      "vacation-home"
    ],
    "core": {
      "anchorScene": "동네 구석 카페 창가에서 라테와 플레이리스트로 쉬고, 집에서도 같은 음악으로 휴식을 이어가는 주말 루틴",
      "facts": [
        "corner cafe",
        "iced latte",
        "window seat",
        "calm playlist",
        "read or look outside",
        "make dinner",
        "rest on sofa",
        "recharge"
      ],
      "reusableFor": [
        "좋아하는 카페",
        "집에서 쉬기",
        "음악",
        "스트레스 해소",
        "주말 루틴"
      ]
    },
    "levels": {
      "advanced": {
        "koreanSummary": "바쁜 주말 뒤에는 동네 구석 카페에 가서 아이스 라테를 주문하고 창가에 앉아 잔잔한 음악을 듣습니다. 집에 돌아와서는 같은 플레이리스트를 틀고 편하게 쉽니다. 조용한 루틴이 머리를 정리하고 에너지를 채워 줍니다.",
        "englishScript": "To be honest, my favorite way to relax is to visit a small cafe near my home or simply stay in with music. There is a corner cafe with big windows and soft lighting that I go to when I need some quiet time. I usually order an iced latte, choose a window seat, and put on a calm playlist with my earphones.\n\nI mean, it is not a special place, but that is exactly why I like it. The baristas know the usual mood of the cafe, and the background music is never too loud. Sometimes I read a few pages of a book, and sometimes I just look outside and organize my thoughts. You know, after a busy week, having a small routine like that makes a big difference.\n\nWhen I get home, I often continue the same feeling by playing music while I make dinner or rest on the sofa. It helps me recharge without spending a lot of money or making a big plan. That quiet cafe-and-home routine has become an important part of my weekend.",
        "skills": [
          "장소 묘사",
          "루틴",
          "이유",
          "카페→집 전환"
        ]
      },
      "intermediate": {
        "koreanSummary": "집 근처 조용한 카페에서 라테를 마시고 음악을 들으며 쉽니다. 집에 돌아와서도 음악을 틀고 저녁을 만들거나 소파에서 쉬며 기분을 정리합니다.",
        "englishScript": "My favorite way to relax is to go to a small cafe near my home. It has big windows and a quiet atmosphere. I usually order an iced latte, sit by the window, and listen to a calm playlist.\n\nSometimes I read a little, but usually I just look outside and take a break. After I get home, I keep listening to music while I make dinner or rest on the sofa. This routine is simple and cheap, but it helps me clear my mind after a busy week. That is why I do it almost every weekend.",
        "skills": [
          "장소+루틴",
          "구체 명사",
          "이유",
          "반복 습관"
        ]
      },
      "foundation": {
        "koreanSummary": "집 근처 카페에 가서 아이스 라테를 마시고 창가에 앉습니다. 음악을 듣거나 밖을 보며 쉽니다. 집에서도 음악을 들으며 쉬어서 스트레스가 줄어듭니다.",
        "englishScript": "I often go to a small cafe near my home. I order an iced latte and sit by the window. I usually listen to music and look outside.\n\nWhen I go home, I play the same music and rest on the sofa. It is a simple routine, but it helps me relax after a busy week.",
        "skills": [
          "자주 가는 장소",
          "주문",
          "행동",
          "간단한 이유"
        ]
      }
    }
  },
  {
    "id": "sports-hobby",
    "courseId": "course-1",
    "group": "운동 / 취미",
    "title": "주말 테니스와 장비 쇼핑 경험",
    "baseQuestion": {
      "en": "Tell me about a hobby or sport you enjoy. How did you start, and what do you usually do?",
      "ko": "즐기는 취미나 운동을 말해 주세요. 어떻게 시작했고 보통 무엇을 하나요?",
      "functionLabel": "취미 소개 · 시작 계기 · 루틴"
    },
    "surveyOptionIds": [
      "sport-tennis",
      "leisure-shopping"
    ],
    "core": {
      "anchorScene": "친구 권유로 테니스를 시작해 주말마다 연습하고, 그립과 신발을 바꾼 뒤 작은 실력 향상을 느낀 경험",
      "facts": [
        "friend invited me",
        "local court",
        "weekend rally",
        "overgrip",
        "tennis shoes",
        "backhand",
        "small improvement",
        "motivated"
      ],
      "reusableFor": [
        "운동",
        "취미 시작",
        "쇼핑 경험",
        "실력 변화",
        "친구와 활동"
      ]
    },
    "levels": {
      "advanced": {
        "koreanSummary": "친구 권유로 테니스를 시작했고, 주말마다 동네 코트에서 랠리를 연습합니다. 최근에는 손에 잘 맞는 오버그립과 테니스화를 샀습니다. 처음보다 백핸드가 안정되어 실력이 조금씩 늘고 있다는 자신감이 생겼습니다.",
        "englishScript": "Let me think. I started playing tennis because a friend invited me to a local court a while ago. At first, I could barely keep the ball in the court, but I liked that every rally gave me a small challenge. Now I usually practice on weekend mornings with the same friend, and we try to keep a rally going before we start a real game.\n\nActually, one thing that made the hobby more fun was buying a few simple items for it. I recently chose a new overgrip because my old one was slippery, and I bought comfortable tennis shoes that support my ankles better. They were not expensive, but using equipment that fits well made practice feel much easier and safer.\n\nMy backhand is still not perfect, but it has become more consistent than before. What I'm trying to say is that tennis gives me both exercise and a clear sense of progress. Even when I make mistakes, I can notice one small improvement after each practice, and that keeps me motivated to come back.",
        "skills": [
          "시작 계기",
          "장비 구매 이유",
          "과거-현재 변화",
          "불완전함+진전"
        ]
      },
      "intermediate": {
        "koreanSummary": "친구 때문에 테니스를 시작했고 주말마다 같은 코트에서 연습합니다. 최근 새 그립과 테니스화를 샀고, 예전보다 백핸드가 안정돼서 계속하고 싶습니다.",
        "englishScript": "I started playing tennis because one of my friends invited me to a local court. At first, I made a lot of mistakes, but I enjoyed the challenge. Now we practice together on weekend mornings and try to keep a long rally going.\n\nRecently, I bought a new overgrip and comfortable tennis shoes because my old equipment was not very good. The new items made practice easier. My backhand is still difficult, but it is more consistent than before. Seeing that small improvement makes me want to keep practicing.",
        "skills": [
          "시작",
          "주말 루틴",
          "구매 경험",
          "간단한 비교"
        ]
      },
      "foundation": {
        "koreanSummary": "친구와 주말에 테니스를 칩니다. 처음에는 어려웠지만 재미있었습니다. 최근 새 그립과 신발을 샀고, 조금씩 실력이 좋아지고 있습니다.",
        "englishScript": "I play tennis with my friend on weekends. My friend first invited me to a local court, and I liked it even though it was difficult.\n\nRecently, I bought a new grip and tennis shoes. They are comfortable, so practice is easier now. I still make mistakes, but I am getting a little better. That makes tennis fun for me.",
        "skills": [
          "누구와",
          "언제",
          "구매",
          "간단한 변화"
        ]
      }
    }
  },
  {
    "id": "home-residence",
    "courseId": "course-1",
    "group": "집 / 거주지",
    "title": "가족과 사는 집, 동네, 집안일 에피소드",
    "baseQuestion": {
      "en": "Tell me about the home and neighborhood where you live. What do you usually do there with your family?",
      "ko": "살고 있는 집과 동네를 말해 주세요. 그곳에서 가족과 보통 무엇을 하나요?",
      "functionLabel": "집 묘사 · 동네 · 생활 루틴"
    },
    "surveyOptionIds": [
      "residence-family",
      "interest-cooking",
      "leisure-park"
    ],
    "core": {
      "anchorScene": "가족과 사는 아파트, 밝은 거실과 개인 방, 근처 공원·가게, 주말 청소와 가족 행사로 청소 일정을 바꾼 경험",
      "facts": [
        "apartment with family",
        "bright living room",
        "my room",
        "nearby park",
        "grocery store",
        "weekend chores",
        "family dinner/walk",
        "cleaning appointment change"
      ],
      "reusableFor": [
        "집 묘사",
        "동네",
        "가족 생활",
        "집안일",
        "일정 변경"
      ]
    },
    "levels": {
      "advanced": {
        "koreanSummary": "가족과 아파트에 살며 밝은 거실과 제 방을 가장 좋아합니다. 집 근처에는 산책할 공원과 식료품점이 있어 편리합니다. 주말에는 가족과 청소를 나누어 하고, 함께 저녁을 먹으며 집에서 편안하게 쉽니다.",
        "englishScript": "You know, I live in an apartment with my family, and it is a comfortable place for all of us. My favorite area is the living room because it gets a lot of natural light in the afternoon. I also have my own room where I can listen to music or rest when I need quiet time.\n\nActually, the neighborhood is one of the reasons I like living there. There is a small park within walking distance, a grocery store nearby, and several useful cafes. My family often takes a short walk after dinner, so we know many of the streets and small shops around our home.\n\nThe thing is, keeping the home comfortable takes some planning. On weekends, we share chores such as vacuuming, organizing the kitchen, and checking our cleaning schedule. Once, we had to change a cleaning appointment because of a family event, so I learned how important it is to explain the situation politely and suggest another time. Even simple home routines make me feel connected to my family.",
        "skills": [
          "공간 디테일",
          "동네",
          "집안일",
          "문제 경험과 교훈"
        ]
      },
      "intermediate": {
        "koreanSummary": "가족과 아파트에 살고 거실과 제 방을 좋아합니다. 근처 공원과 식료품점이 편리하고, 주말에는 가족과 청소를 나누어 합니다. 한 번은 가족 행사 때문에 청소 일정을 바꾼 적도 있습니다.",
        "englishScript": "I live in an apartment with my family. My favorite place is the living room because it is bright, and I also like my room when I want some quiet time.\n\nOur neighborhood is convenient because there is a park and a grocery store within walking distance. On weekends, my family shares chores like vacuuming and cleaning the kitchen. Once, we had to change a cleaning appointment because of a family event. It was a small problem, but we found another time. I like our home because it is comfortable and easy to live in.",
        "skills": [
          "집+동네",
          "주말 루틴",
          "짧은 문제 경험",
          "이유"
        ]
      },
      "foundation": {
        "koreanSummary": "가족과 아파트에 삽니다. 밝은 거실과 제 방을 좋아합니다. 근처에 공원과 식료품점이 있고, 주말에는 가족과 청소합니다.",
        "englishScript": "I live in an apartment with my family. I like our living room because it is bright, and I also have my own room.\n\nThere is a small park and a grocery store near my home. On weekends, my family cleans the apartment together. I usually vacuum or clean the kitchen. Our home is comfortable, so I like living there.",
        "skills": [
          "집",
          "동네 시설",
          "집안일",
          "감정"
        ]
      }
    }
  }
] as const satisfies readonly TrainingStoryline[];
