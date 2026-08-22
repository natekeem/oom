import { defineReplacementGuides } from "../../defineReplacementGuides";

const key = (scriptId: string, variantId: string) => `${scriptId}:${variantId}`;

export const replacementGuides = defineReplacementGuides({
  [key("culture-night", "favorite-culture")]: {
    summary: "우연한 발견의 스토리 대신, 영화와 라이브 음악을 함께 즐기는 문화 선호로 시작합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "문화 활동을 즐기는 주말 선호로 시작합니다.",
        replacement:
          "Actually, the cultural activity I enjoy most is spending an evening around a downtown arts complex. I like watching a movie with a friend and checking out live music nearby on weekend nights.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("culture-night", "recent-culture")]: {
    summary: "메인 스토리가 최근 문화 경험에 바로 부합합니다. 시간과 현장 분위기를 선명히 말합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "최근에 친구와 도심에 방문했던 날로 엽니다.",
        replacement:
          "Recently, I had a memorable cultural night with a friend. We met on a Friday evening at a cultural complex downtown to watch a movie and explore the area.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("culture-night", "music-routine")]: {
    summary: "영화 부분을 줄이고 라이브에서 들은 노래와 귀가길 플레이리스트 청취 루틴을 강조합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "평소 음악을 듣고 즐기는 루틴으로 출발합니다.",
        replacement:
          "I listen to music almost every day, especially when I travel back home in the evening. I like discovering songs at small live shows and making calm playlists on my phone.",
      },
      {
        block: "details",
        instruction: "라이브 무대에서 들었던 음악 경험을 구체화합니다.",
        replacement:
          "When I hear a song I like at a live venue, I look it up right away. On the subway ride home, listening to that same song helps me relax and remember the energetic atmosphere.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("culture-night", "culture-change")]: {
    summary: "대형 이벤트에서 소규모 라이브와 복합 문화공간으로 바뀐 취향을 대비합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "과거와 현재의 문화생활 선호를 대비합니다.",
        replacement:
          "My taste in cultural activities has changed over time. I used to go only to big blockbuster movies or large concerts, but now I prefer smaller venues where I can enjoy live music up close.",
      },
      {
        block: "closing",
        instruction: "소규모 장소가 주는 친근함을 결론으로 말합니다.",
        replacement:
          "These days, smaller places feel more personal and relaxing. It allows me to enjoy the performance without the stress of huge crowds.",
      },
    ],
    keepBlocks: ["details"],
  },

  [key("smart-shopping", "shopping-routine")]: {
    summary: "이어폰 고장 사건 대신 평소 필요한 전자기기를 비교 구매하는 쇼핑 루틴으로 시작합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "쇼핑몰 방문 루틴과 비교하는 습관으로 엽니다.",
        replacement:
          "When I need to buy electronics or everyday items, I usually visit a large shopping mall near my neighborhood. I prefer seeing products in person so I can compare options directly.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("smart-shopping", "recent-purchase")]: {
    summary: "메인 스토리가 최근 구매 경험에 해당하므로 필요성과 결정 과정을 유지합니다.",
    replacements: [],
    keepBlocks: ["opening", "details", "closing"],
  },
  [key("smart-shopping", "product-comparison")]: {
    summary: "두 모델의 가격, 착용감, 배터리 비교를 중심 문단으로 부각합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "비교 경험 질문에 맞게 두 가지 모델 비교로 출발합니다.",
        replacement:
          "Recently, when I needed a new pair of wireless earphones, I spent time comparing two different models at an electronics shop.",
      },
      {
        block: "details",
        instruction: "두 제품의 장단점 비교를 명확히 설명합니다.",
        replacement:
          "One model was very affordable, but the fit felt a bit loose. The other was slightly more expensive, but it offered better battery life, a comfortable fit, and a clear return policy.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("smart-shopping", "spending-change")]: {
    summary: "충동구매에서 실용적이고 꼼꼼한 비교 구매로 바뀐 소비 방식을 설명합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "소비 습관의 변화를 첫 문장에 선언합니다.",
        replacement:
          "My shopping habits have changed a lot over the years. In the past, I used to buy things quickly online without checking details, but now I take time to research and try products in person.",
      },
      {
        block: "closing",
        instruction: "실용적인 소비가 주는 만족감으로 마무리합니다.",
        replacement:
          "Because I check comfort, warranty, and return terms before buying, I rarely regret my purchases now. It saves me both time and money.",
      },
    ],
    keepBlocks: ["details"],
  },

  [key("light-fitness", "park-description")]: {
    summary: "공원의 산책로와 쾌적한 환경을 먼저 설명하고 가벼운 걷기 루틴을 이어 갑니다.",
    replacements: [
      {
        block: "opening",
        instruction: "아파트 근처 공원의 환경 묘사로 시작합니다.",
        replacement:
          "There is a small park right near my apartment that I visit frequently. It has a paved walking trail lined with trees, gentle lighting in the evening, and plenty of benches to rest.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("light-fitness", "walking-routine")]: {
    summary: "무리 없는 30분 걷기 루틴을 질문의 첫 문장에 직접 답합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "부담 없는 30분 산책 루틴으로 엽니다.",
        replacement:
          "To be honest, I am not someone who does heavy workouts, but I have a consistent light fitness routine. I walk for about 30 minutes in the park after work wearing comfortable shoes.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("light-fitness", "recent-walk")]: {
    summary: "최근 날씨가 좋아 걷다가 짧게 조깅했던 특정한 날을 강조합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "최근 맑았던 날의 공원 산책 경험으로 시작합니다.",
        replacement:
          "Just last week, the weather was exceptionally clear in the evening, so I went to the park for a longer walk than usual. The cool breeze made the walk feel very refreshing.",
      },
      {
        block: "details",
        instruction: "걷다가 기분 좋게 10분 조깅한 경험을 넣습니다.",
        replacement:
          "I put on my favorite playlist and walked for about thirty minutes. Because I felt energetic, I even did a light ten-minute jog along the trail, which felt great.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("light-fitness", "fitness-change")]: {
    summary: "과도한 헬스장 목표 실패에서 지속 가능한 걷기로 바뀐 태도를 대비합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "운동을 대하는 태도의 변화로 출발합니다.",
        replacement:
          "My attitude toward fitness has completely changed over the last few years. I used to set ambitious gym goals that I could not keep, but now I focus on sustainable, low-pressure walking.",
      },
      {
        block: "closing",
        instruction: "꾸준한 루틴이 주는 건강과 정신적 여유로 마무리합니다.",
        replacement:
          "By removing the pressure, I actually exercise more regularly now. A simple thirty-minute walk keeps me healthy and helps clear my head every day.",
      },
    ],
    keepBlocks: ["details"],
  },

  [key("solo-staycation", "home-staycation")]: {
    summary: "혼자 사는 집에서 청소 후 영화를 보며 보내는 평화로운 집 휴가로 시작합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "1인 가구의 집 휴가 루틴으로 엽니다.",
        replacement:
          "When I take a vacation at home, I like to keep my days simple and comfortable. I clean my apartment in the morning, make a quick meal, and spend the afternoon watching movies on the sofa.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("solo-staycation", "recent-daytrip")]: {
    summary: "기차를 타고 가까운 도시로 가벼운 당일치기 여행을 다녀온 날을 묘사합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "최근 기차 당일 여행 이야기로 출발합니다.",
        replacement:
          "Recently, I took a relaxing day trip to a nearby city by train. Instead of rushing between famous landmarks, I chose just one quiet neighborhood to explore on foot.",
      },
      {
        block: "details",
        instruction: "로컬 식당과 카페에서의 여유로운 시간을 설명합니다.",
        replacement:
          "I found a cozy local cafe, read for a bit, and had a simple lunch at a small restaurant. Walking along the unfamiliar streets without a strict schedule felt very peaceful.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("solo-staycation", "home-description")]: {
    summary: "혼자 사는 아파트의 구조와 내가 가장 아끼는 소파·책상 공간을 묘사합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "혼자 사는 아파트 소개로 엽니다.",
        replacement:
          "I live alone in a cozy one-bedroom apartment. It is not very big, but it has everything I need to rest and recharge after a busy day.",
      },
      {
        block: "details",
        instruction: "창가 책상과 소파 공간의 아늑함을 설명합니다.",
        replacement:
          "My favorite spot is the area by the window, where I have my desk and a small sofa. In the evening, the streetlights outside make the room feel quiet and warm.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("solo-staycation", "vacation-change")]: {
    summary: "많은 관광지를 돌아다니던 여행에서 한 곳에 머무는 느린 휴가로 바뀐 점을 강조합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "과거와 현재의 휴가 스타일 변화를 비교합니다.",
        replacement:
          "My idea of a great vacation has evolved over time. I used to pack my schedule with too many sightseeing spots, but now I prefer slow vacations where I stay in one place and relax.",
      },
      {
        block: "closing",
        instruction: "느린 휴식이 주는 재충전 효과로 마무리합니다.",
        replacement:
          "Whether I stay at home or visit a quiet neighborhood nearby, slowing down helps me return to daily life feeling truly refreshed.",
      },
    ],
    keepBlocks: ["details"],
  },
});
