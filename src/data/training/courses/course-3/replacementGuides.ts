import { defineReplacementGuides } from "../../defineReplacementGuides";

const key = (scriptId: string, variantId: string) => `${scriptId}:${variantId}`;

export const replacementGuides = defineReplacementGuides({
  [key("trail-photo", "favorite-park")]: {
    summary: "산책로와 전망대가 있는 공원 환경 묘사로 출발합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "공원의 숲길 산책로와 전망대 소개로 시작합니다.",
        replacement:
          "There is a large park near my home with an easy trail. The trail leads to a small overlook where I can see trees and the city in the distance.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("trail-photo", "weekend-hiking")]: {
    summary: "룸메이트와 토요일 아침 가볍게 1시간 걷는 주말 하이킹 루틴을 설명합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "토요일 아침 주말 걷기 루틴으로 시작합니다.",
        replacement:
          "On Saturday mornings, my roommate and I walk on the easy park trail. We wear comfortable shoes and take our time on the way to the overlook.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("trail-photo", "photo-memory")]: {
    summary: "전망대에서 아침 햇살과 풍경을 사진으로 담았던 최근 경험에 집중합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "전망대에서 사진을 찍었던 최근 아침으로 시작합니다.",
        replacement:
          "Recently, on a clear Saturday morning, I walked the park trail with my roommate and took photos with my phone at the overlook.",
      },
      {
        block: "details",
        instruction: "풍경 사진을 찍으며 여유를 즐긴 세부 내용을 넣습니다.",
        replacement:
          "I took several photos of the trees and the morning sky. Stopping to capture the scenery made us slow down and enjoy the quiet atmosphere even more.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("trail-photo", "hobby-change")]: {
    summary: "속도 중심에서 주변을 천천히 관찰하고 사진으로 기록하는 태도 변화를 설명합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "하이킹과 걷기를 대하는 태도 변화로 시작합니다.",
        replacement:
          "My way of enjoying outdoor walks has changed over time. In the past, I only focused on finishing the hike quickly for exercise, but now I walk slowly and pay attention to nature.",
      },
      {
        block: "closing",
        instruction: "관찰과 사진이 주는 평화로움으로 마무리합니다.",
        replacement:
          "Taking photos along the trail helps me stay present. It gives me a true sense of calm and recharges my energy for the week ahead.",
      },
    ],
    keepBlocks: ["details"],
  },

  [key("coastal-camp", "camping-trip")]: {
    summary: "메인 스토리의 첫 문단 그대로 해안 캠핑 여행의 시작을 전달합니다.",
    replacements: [],
    keepBlocks: ["opening", "details", "closing"],
  },
  [key("coastal-camp", "travel-problem")]: {
    summary: "캠핑 중 강풍이 불었던 문제 상황과 이웃의 조언으로 안전하게 해결한 과정을 부각합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "여행 중 겪은 예상 밖 날씨 문제로 시작합니다.",
        replacement:
          "During a coastal camping trip with my friend, we ran into an unexpected problem when sudden strong winds started blowing in the late afternoon.",
      },
      {
        block: "details",
        instruction: "바람에 텐트가 흔들렸을 때 해결한 구체적 대처를 넣습니다.",
        replacement:
          "Our tent began to shake, and we were worried it might collapse. Fortunately, an experienced camper nearby saw us struggling and gave us tips on securing the stakes at an angle. With their help, our tent stayed stable.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("coastal-camp", "drive-routine")]: {
    summary: "친구와 두 시간 운전해 같은 해안 캠핑장에 도착한 여정을 설명합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "캠핑장으로 이동한 실제 드라이브로 엽니다.",
        replacement:
          "A friend and I drove for about two hours to reach the coastal campsite. We listened to music and talked during the drive.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("coastal-camp", "travel-style-change")]: {
    summary: "엄격한 일정보다 돌발 상황에도 유연하게 즐기는 여행관으로 바뀐 점을 강조합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "여행 스타일의 변화를 대비합니다.",
        replacement:
          "My outdoor travel philosophy has matured over the years. I used to panic whenever things did not go as planned, but now I know that unexpected challenges often become the best memories.",
      },
      {
        block: "closing",
        instruction: "유연한 대처가 주는 여행의 여유로 닫습니다.",
        replacement:
          "Learning to adapt to changes like sudden weather shifts has made my trips much more enjoyable and stress-free.",
      },
    ],
    keepBlocks: ["details"],
  },

  [key("museum-reading", "museum-description")]: {
    summary: "도심 속 한적한 골목의 작은 사진 박물관과 아늑한 카페 공간을 묘사합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "좋아하는 작은 사진 박물관 소개로 엽니다.",
        replacement:
          "There is a small, quiet photography museum in my city that I really love. It is tucked away on a calm street and features intimate exhibits with natural lighting.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("museum-reading", "recent-exhibition")]: {
    summary: "비 오는 날 방문해 일상 흑백 사진전을 감상했던 최근 경험에 집중합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "최근 비 오던 날의 사진 전시 관람으로 시작합니다.",
        replacement:
          "Recently, on a rainy Sunday afternoon, I visited a special photography exhibition featuring black-and-white photos of everyday city life.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("museum-reading", "reading-routine")]: {
    summary: "전시 후 같은 박물관 카페에서 전시 안내서를 읽은 장면을 자세히 말합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "박물관 카페에서 전시 안내서를 읽은 최근 경험으로 엽니다.",
        replacement:
          "After the photo exhibition, I sat in the museum cafe and read the exhibition guide. It explained why the photographer chose ordinary city scenes.",
      },
      {
        block: "details",
        instruction: "전시 도록을 읽으며 사색하는 디테일을 넣습니다.",
        replacement:
          "After viewing the photo gallery, I sat in the museum cafe and flipped through the exhibition catalog. Reading about the stories behind each photograph made the afternoon feel deeply peaceful.",
      },
    ],
    keepBlocks: ["closing"],
  },
  [key("museum-reading", "perspective-change")]: {
    summary: "화려한 명작보다 일상의 사소한 순간을 포착한 예술을 더 가치 있게 보게 된 변화로 닫습니다.",
    replacements: [
      {
        block: "opening",
        instruction: "예술과 사진을 감상하는 시각의 변화를 설명합니다.",
        replacement:
          "My taste in cultural exhibitions has shifted over time. I used to look only for famous, grand artworks, but now I find much deeper inspiration in simple photographs of daily life.",
      },
      {
        block: "closing",
        instruction: "일상을 관찰하는 눈의 변화로 마무리합니다.",
        replacement:
          "Appreciating these quiet moments reminds me to slow down and value the simple beauty in my own everyday routine.",
      },
    ],
    keepBlocks: ["details"],
  },

  [key("shared-home-vacation", "shared-home")]: {
    summary: "룸메이트와 함께 사는 아파트의 구조와 편안한 거실 공간을 묘사합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "룸메이트와 사는 아파트 소개로 엽니다.",
        replacement:
          "I share an apartment with a close roommate. We each have our own private bedroom, while sharing the living room and kitchen as a comfortable common area.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("shared-home-vacation", "home-holiday")]: {
    summary: "비 오는 연휴에 룸메이트와 집을 정돈하고 음식을 나누며 쉰 루틴을 설명합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "비 오는 날 집에서 보낸 평화로운 연휴로 시작합니다.",
        replacement:
          "During a recent rainy holiday weekend, my roommate and I decided to spend our vacation at home. We cleaned up the living area in the morning and made simple comfort food together.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("shared-home-vacation", "overseas-memory")]: {
    summary: "집에서 사진첩을 보며 떠올렸던 지난 해외여행의 기억을 회상합니다.",
    replacements: [
      {
        block: "opening",
        instruction: "사진을 보며 떠올린 과거 해외여행 이야기로 엽니다.",
        replacement:
          "While relaxing at home, we looked through photos from a memorable trip abroad we took a couple of years ago. Looking at the pictures brought back vivid memories of walking through foreign city streets.",
      },
    ],
    keepBlocks: ["details", "closing"],
  },
  [key("shared-home-vacation", "vacation-preference")]: {
    summary: "무리하게 이동하는 여행 대신 집이나 한곳에서 충분히 충전하는 휴가관의 변화로 닫습니다.",
    replacements: [
      {
        block: "opening",
        instruction: "휴가를 보내는 방식에 대한 생각 변화로 엽니다.",
        replacement:
          "My preferences for vacations have changed significantly. I used to believe a vacation was only worthwhile if I traveled far and stayed busy every day, but now I value genuine rest at home.",
      },
      {
        block: "closing",
        instruction: "진정한 휴식과 재충전의 결론으로 마무리합니다.",
        replacement:
          "Spending quiet time in a comfortable space with someone you get along with can be just as refreshing as any faraway trip.",
      },
    ],
    keepBlocks: ["details"],
  },
});
