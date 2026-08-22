import type { TrainingStoryline } from '../../../../training/types';

export const storylines = [
  {
    "id": "trail-photo",
    "courseId": "course-3",
    "group": "공원 / 걷기 / 하이킹",
    "title": "전망대까지 걸으며 사진을 찍는 주말 트레일",
    "baseQuestion": {
      "en": "Tell me about an outdoor activity you enjoy on weekends. Where do you go, and what do you do there?",
      "ko": "주말에 즐기는 야외 활동을 말해 주세요. 어디에 가고 그곳에서 무엇을 하나요?",
      "functionLabel": "야외 활동 · 장소 · 루틴"
    },
    "surveyOptionIds": [
      "leisure-park",
      "sport-walking",
      "sport-hiking",
      "interest-photo"
    ],
    "core": {
      "anchorScene": "룸메이트와 토요일 아침 집 근처 큰 공원의 완만한 트레일을 걸어 전망대에 올라가 사진을 찍은 경험",
      "facts": [
        "roommate",
        "large local park",
        "Saturday morning",
        "easy trail",
        "comfortable shoes",
        "small overlook",
        "photos",
        "slowed down and noticed details"
      ],
      "reusableFor": [
        "공원 묘사",
        "걷기 루틴",
        "하이킹 경험",
        "사진 촬영",
        "활동 방식 변화"
      ]
    },
    "levels": {
      "foundation": {
        "koreanSummary": "주말 아침 룸메이트와 집 근처 큰 공원에 갑니다. 편한 신발을 신고 천천히 걷고 전망대에서 사진을 찍습니다. 어렵지 않고 기분이 좋아져서 좋아합니다.",
        "englishScript": "I like walking in a large park near my home. On weekend mornings, I sometimes go there with my roommate. We wear comfortable shoes and walk on an easy trail.\n\nThere is a small overlook, and I usually take a few pictures there. The walk is not very difficult, so I can enjoy the view and talk with my roommate. I always feel better after the walk.",
        "skills": [
          "장소",
          "누구와",
          "걷기",
          "사진",
          "감정"
        ]
      },
      "intermediate": {
        "koreanSummary": "룸메이트와 주말마다 공원 트레일을 걷습니다. 최근에는 날씨가 맑아 전망대까지 올라가 사진을 많이 찍었습니다. 예전에는 빨리 걷는 데 집중했지만 지금은 주변을 천천히 보며 즐깁니다.",
        "englishScript": "One of my favorite weekend activities is walking on a trail in a large park near my home. I usually go with my roommate on Saturday morning, and we choose an easy route because we want to relax, not do a hard workout.\n\nRecently, the weather was very clear, so we walked all the way to a small overlook and took several pictures of the trees and the city in the distance. I used to focus on walking fast, but now I slow down and pay more attention to the scenery. That change makes the activity much more enjoyable.",
        "skills": [
          "루틴",
          "최근 경험",
          "사진 디테일",
          "과거-현재 변화"
        ]
      },
      "advanced": {
        "koreanSummary": "룸메이트와 가까운 공원의 트레일을 걷는 루틴을 갖고 있습니다. 최근 맑은 날 전망대에서 사진을 찍다가 평소 지나치던 작은 풍경들을 발견했고, 운동 기록보다 주변을 관찰하는 방식으로 취미가 바뀌었다는 흐름입니다.",
        "englishScript": "A simple outdoor routine that has become surprisingly important to me is walking and hiking in a large park near my apartment. My roommate and I usually go early on Saturday mornings, when the paths are still quiet. We wear comfortable shoes, take the easier trail, and carry only water and our phones because the point is to enjoy the morning rather than complete a serious workout.\n\nA few weeks ago, the air was unusually clear, so we continued to a small overlook that we normally skip. I started taking pictures there and noticed details I had ignored before, like the light between the trees and the way the city looked much calmer from a distance. We ended up staying much longer than we expected.\n\nIn the past, I treated walking almost like a number on a fitness app, so I cared about speed and distance. These days, I use the same activity to slow down, notice my surroundings, and spend time with someone I know well. That small change is why I can keep the routine without feeling pressured.",
        "skills": [
          "연결된 문단",
          "구체 장면",
          "예상보다 길어진 경험",
          "과거-현재 변화",
          "의미"
        ]
      }
    }
  },
  {
    "id": "coastal-camp",
    "courseId": "course-3",
    "group": "캠핑 / 해변 / 드라이브",
    "title": "바닷가 캠핑장으로 떠난 짧은 로드트립",
    "baseQuestion": {
      "en": "Tell me about a memorable camping trip. Where did you go, and what happened during the trip?",
      "ko": "기억에 남는 캠핑 여행을 말해 주세요. 어디에 갔고 여행 중 무슨 일이 있었나요?",
      "functionLabel": "캠핑 여행 · 사건 · 결과"
    },
    "surveyOptionIds": [
      "leisure-camping",
      "leisure-beach",
      "leisure-drive",
      "vacation-domestic"
    ],
    "core": {
      "anchorScene": "친구와 차를 타고 해안 캠핑장으로 1박 국내여행을 갔고 바람 때문에 텐트 설치가 어려웠지만 함께 해결한 경험",
      "facts": [
        "friend",
        "two-hour drive",
        "coastal campsite",
        "small tent",
        "strong wind",
        "asked neighboring camper for tip",
        "simple dinner",
        "sunrise by beach"
      ],
      "reusableFor": [
        "캠핑",
        "해변",
        "드라이브",
        "국내 여행",
        "여행 문제 경험"
      ]
    },
    "levels": {
      "foundation": {
        "koreanSummary": "친구와 차를 타고 바닷가 캠핑장에 갔습니다. 텐트를 치고 간단히 저녁을 먹고 해변을 걸었습니다. 바람이 조금 강했지만 재미있었고 다음 날 일출이 좋았습니다.",
        "englishScript": "Last year, I went camping near the beach with a friend. We drove for about two hours and stayed at a small campsite. We put up a tent, ate a simple dinner, and walked along the beach.\n\nIt was a little windy, but we had a good time. The next morning, we watched the sunrise near the water. It was a short trip, but it was very memorable.",
        "skills": [
          "드라이브",
          "캠핑",
          "해변",
          "간단한 문제",
          "기억"
        ]
      },
      "intermediate": {
        "koreanSummary": "친구와 두 시간 정도 운전해 해안 캠핑장에 갔습니다. 바람이 강해 텐트 설치가 잘 안 됐지만 주변 캠퍼의 도움을 받아 해결했고, 저녁과 해변 산책, 다음 날 일출을 즐겼습니다.",
        "englishScript": "A memorable domestic trip I took was a one-night camping trip near the coast. A friend and I drove for about two hours, and the drive itself was relaxing because we listened to music and talked.\n\nWhen we arrived, the wind was stronger than we expected, so setting up our small tent was difficult. A camper nearby showed us how to secure it better, and after that everything was fine. We made a simple dinner, walked on the beach, and watched the sunrise the next morning. The problem was small, but solving it together made the trip more memorable.",
        "skills": [
          "여행 흐름",
          "예상 밖 문제",
          "간단한 해결",
          "감정"
        ]
      },
      "advanced": {
        "koreanSummary": "친구와 해안 캠핑장으로 짧은 로드트립을 갔고, 강풍 때문에 텐트가 계속 들리는 문제를 주변 캠퍼의 조언으로 해결했습니다. 계획이 완벽하지 않아도 문제를 조정하며 즐긴 경험을 통해 여행 스타일이 바뀌었다는 흐름입니다.",
        "englishScript": "One of my most useful travel stories is a short road trip I took with a friend to a coastal campsite. We drove for about two hours, stopped once for coffee, and arrived in the afternoon with a very simple plan: set up the tent, cook dinner, and spend the evening near the beach.\n\nThe only real problem was the wind. It was much stronger than the forecast suggested, and one side of our tent kept lifting off the ground. We tried to fix it ourselves, but after a few frustrating minutes, a camper next to us showed us a better way to angle the stakes and use an extra rope. That small piece of advice solved the problem immediately.\n\nAfter that, the trip felt easy again. We cooked a simple meal, walked along the dark beach, and woke up early enough to see the sunrise. I used to think a good trip required a perfect schedule, but experiences like this taught me that being flexible and solving small problems together can make a trip more memorable than following a plan exactly.",
        "skills": [
          "road-trip narrative",
          "문제 해결",
          "타인과 상호작용",
          "시간 프레임",
          "여행관 변화"
        ]
      }
    }
  },
  {
    "id": "museum-reading",
    "courseId": "course-3",
    "group": "박물관 / 사진 / 독서",
    "title": "사진 전시를 보고 전시 도록을 읽은 조용한 오후",
    "baseQuestion": {
      "en": "Tell me about a memorable visit to a museum or exhibition. What did you see, and how did it affect you?",
      "ko": "기억에 남는 박물관이나 전시 관람을 말해 주세요. 무엇을 보았고 어떤 영향을 받았나요?",
      "functionLabel": "전시 경험 · 감상 · 변화"
    },
    "surveyOptionIds": [
      "leisure-museum",
      "interest-photo",
      "interest-reading"
    ],
    "core": {
      "anchorScene": "비 오는 오후 혼자 사진 전시가 있는 작은 박물관에 가서 작품을 보고, 카페에서 전시 도록을 읽은 경험",
      "facts": [
        "rainy afternoon",
        "small museum",
        "photo exhibition",
        "black-and-white city photos",
        "quiet gallery",
        "exhibition guide",
        "museum cafe",
        "looked at everyday scenes differently"
      ],
      "reusableFor": [
        "박물관 묘사",
        "사진 취미",
        "독서",
        "최근 문화 경험",
        "관점 변화"
      ]
    },
    "levels": {
      "foundation": {
        "koreanSummary": "비 오는 날 작은 박물관에 가서 사진 전시를 봤습니다. 흑백 도시 사진이 마음에 들었고, 박물관 카페에서 전시 안내 책자를 읽었습니다. 조용해서 좋았습니다.",
        "englishScript": "I sometimes go to a small museum when the weather is bad. Recently, I saw a photo exhibition there. I especially liked some black-and-white pictures of city streets.\n\nAfter the exhibition, I sat in the museum cafe and read the exhibition guide. The museum was quiet and comfortable, so I enjoyed the afternoon very much.",
        "skills": [
          "박물관",
          "사진",
          "독서",
          "좋아한 이유"
        ]
      },
      "intermediate": {
        "koreanSummary": "비 오는 오후 사진 전시를 보러 작은 박물관에 갔습니다. 평범한 도시 장면을 찍은 흑백 사진이 인상적이었고, 카페에서 전시 도록을 읽으며 사진가가 왜 그런 장면을 골랐는지 이해하게 됐습니다.",
        "englishScript": "Recently, on a rainy afternoon, I visited a small museum that was showing a photography exhibition. The gallery was quiet, and most of the pictures were black-and-white scenes from ordinary city life. I liked them because they made simple places look interesting.\n\nAfter I finished looking around, I went to the museum cafe and read part of the exhibition guide. It explained why the photographer focused on everyday streets and people. I normally take pictures quickly with my phone, but after that visit I started thinking more about what I want to show in a photo.",
        "skills": [
          "구체 전시",
          "이유",
          "독서 연결",
          "취미 변화"
        ]
      },
      "advanced": {
        "koreanSummary": "비 오는 오후 작은 사진 전시를 본 뒤 도록을 읽으며, 평범한 장면도 시선에 따라 달라진다는 점을 이해한 경험입니다. 이후 휴대폰으로 사진을 찍을 때도 무엇을 보여주고 싶은지 생각하게 됐다는 변화로 마무리합니다.",
        "englishScript": "A museum experience that changed the way I look at photography happened on a rainy afternoon. I went to a small museum mainly because I wanted somewhere quiet to spend a few hours, but the main exhibition turned out to be a collection of black-and-white photographs of very ordinary city scenes. There were bus stops, old signs, people waiting at crosswalks, and small stores that most people would normally walk past.\n\nAt first, I wondered why those simple scenes were worth displaying. Then I read part of the exhibition guide in the museum cafe, and it explained how the photographer was interested in details people stop noticing when they become too familiar with a place. That idea stayed with me.\n\nBefore that visit, I usually took quick phone pictures just to record where I had been. Now, even when I am taking an ordinary picture, I pause for a moment and think about what detail or feeling I actually want to capture. The museum itself was quiet and simple, but it gave me a new way to enjoy both photography and reading.",
        "skills": [
          "의문→이해",
          "구체 예시",
          "독서로 의미 확장",
          "관점 변화",
          "connected discourse"
        ]
      }
    }
  },
  {
    "id": "shared-home-vacation",
    "courseId": "course-3",
    "group": "집 / 휴가 / 해외여행",
    "title": "룸메이트와 집에서 쉬며 지난 해외여행을 정리한 연휴",
    "baseQuestion": {
      "en": "Tell me about a vacation you spent at home. What did you do, and what did you learn about the way you like to travel?",
      "ko": "집에서 보낸 휴가를 말해 주세요. 무엇을 했고 자신이 좋아하는 여행 방식에 대해 무엇을 알게 되었나요?",
      "functionLabel": "집 휴가 · 여행 회상 · 선호 변화"
    },
    "surveyOptionIds": [
      "residence-roommate",
      "vacation-home",
      "vacation-overseas",
      "interest-photo",
      "interest-reading"
    ],
    "core": {
      "anchorScene": "비 오는 연휴에 룸메이트와 집에서 쉬면서 예전 해외 도시여행 사진을 정리하고 여행책을 보며 다음 여행 아이디어를 이야기함",
      "facts": [
        "shared apartment",
        "rainy long weekend",
        "staycation",
        "old overseas trip photos",
        "small travel book",
        "one neighborhood per day",
        "simple food at home",
        "less rushed travel style"
      ],
      "reusableFor": [
        "집/룸메이트",
        "집 휴가",
        "해외 여행",
        "사진",
        "여행 계획",
        "여행 방식 변화"
      ]
    },
    "levels": {
      "foundation": {
        "koreanSummary": "룸메이트와 아파트에 살고 있습니다. 비 오는 연휴에는 집에서 쉬며 예전 해외여행 사진을 보고 여행책을 읽었습니다. 집에서 쉬는 것도 편하고 다음 여행을 생각하는 것도 재미있었습니다.",
        "englishScript": "I live in an apartment with a roommate. During a rainy holiday, we decided to stay home and relax. We looked at some pictures from an old overseas trip and read a small travel book.\n\nWe also ate simple food and talked about places we might visit in the future. I like traveling, but sometimes a quiet vacation at home is exactly what I need.",
        "skills": [
          "거주",
          "집 휴가",
          "해외여행 회상",
          "간단한 비교"
        ]
      },
      "intermediate": {
        "koreanSummary": "비 오는 연휴에 룸메이트와 집에서 쉬면서 예전 해외 도시여행 사진을 정리하고 여행책을 읽었습니다. 예전에는 하루에 많은 곳을 보려 했지만 이제는 한 동네를 천천히 보는 여행을 하고 싶다고 이야기했습니다.",
        "englishScript": "I share an apartment with a roommate, and sometimes we spend a long weekend at home instead of traveling. During a recent rainy holiday, we organized photos from an overseas city trip and looked through a small travel book while eating simple food at home.\n\nThe pictures reminded us that we had tried to visit too many places on that trip. We were tired almost every evening. So we talked about doing things differently next time and choosing only one neighborhood or a few places each day. Staying home was relaxing, but it also helped us think about how we want to travel in the future.",
        "skills": [
          "집 휴가",
          "과거 해외 경험",
          "문제 인식",
          "다음 여행 변화"
        ]
      },
      "advanced": {
        "koreanSummary": "룸메이트와 집에서 쉬는 연휴 동안 예전 해외여행 사진과 여행책을 보며, 관광지를 많이 찍는 여행에서 한 지역을 천천히 경험하는 여행으로 선호가 바뀐 이유를 설명합니다. 집 휴가와 해외여행을 같은 “재충전” 목적 아래 연결합니다.",
        "englishScript": "I share an apartment with a roommate, and one rainy long weekend gave us an unexpectedly good staycation. We had originally talked about taking a short trip, but the weather was terrible, so we stayed home, made simple food, and finally organized photos from an overseas city trip we had taken earlier. We also pulled out a small travel book and started comparing the places we had actually enjoyed with the places we had rushed through just to check them off a list.\n\nLooking at the photos made something very clear. On that earlier trip, we had planned too many attractions in a single day, so by evening we were tired and barely remembered some of them. The pictures I liked most were actually from slow moments in one neighborhood: a quiet street, a small local store, and a long walk with no schedule.\n\nSince then, my idea of a good vacation has changed. I still enjoy overseas travel, but I no longer think I need to see everything. Whether I stay home for a weekend or travel far away, I want enough time to slow down and actually notice where I am. That makes both kinds of vacation feel more restorative.",
        "skills": [
          "home/overseas comparison",
          "past problem",
          "evidence from photos",
          "preference change",
          "abstract meaning within familiar topic"
        ]
      }
    }
  }
] as const satisfies readonly TrainingStoryline[];
