const gradeSpeakingPractice = new URL("../assets/magazine/grade-speaking-practice.webp", import.meta.url).href;
const naturalConversation = new URL("../assets/magazine/natural-conversation.webp", import.meta.url).href;
const oomStudyWorkflow = new URL("../assets/magazine/oom-study-workflow.webp", import.meta.url).href;
const opic55DifficultyGuideCover = new URL("../assets/magazine/opic-55-difficulty-guide-cover.jpg", import.meta.url).href;
const opicAnswerChecklistCover = new URL("../assets/magazine/opic-answer-checklist-cover.jpg", import.meta.url).href;
const opicHomeTopicScriptGuideCover = new URL("../assets/magazine/opic-home-topic-script-guide-cover.jpg", import.meta.url).href;
const opicImToIhPracticePlanCover = new URL("../assets/magazine/opic-im-to-ih-practice-plan-cover.jpg", import.meta.url).href;
const opicIndoorTopicGuideCover = new URL("../assets/magazine/opic-indoor-topic-guide-cover.jpg", import.meta.url).href;
const opicLastWeekStudyPlanCover = new URL("../assets/magazine/opic-last-week-study-plan-cover.jpg", import.meta.url).href;
const opicRecordingReviewRoutineCover = new URL("../assets/magazine/opic-recording-review-routine-cover.jpg", import.meta.url).href;
const opicRoleplay6StepTemplateCover = new URL("../assets/magazine/opic-roleplay-6-step-template-cover.jpg", import.meta.url).href;
const opicSurveyChoiceGuideCover = new URL("../assets/magazine/opic-survey-choice-guide-cover.jpg", import.meta.url).href;
const opicTravelTopicScriptGuideCover = new URL("../assets/magazine/opic-travel-topic-script-guide-cover.jpg", import.meta.url).href;
const selfIntroductionCover = new URL("../assets/magazine/self-introduction-cover.jpg", import.meta.url).href;
const selfIntroductionWarmup = new URL("../assets/magazine/self-introduction-warmup.jpg", import.meta.url).href;
const strategyStoryPractice = new URL("../assets/magazine/strategy-story-practice.webp", import.meta.url).href;

export type MagazineExample = {
  title: string;
  description?: string;
  lines: string[];
};

export type MagazineArticleSection = {
  heading: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  bullets?: string[];
  example?: MagazineExample;
  note?: { title: string; text: string };
};

export type MagazineArticle = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  date: string;
  readMinutes: string;
  summary: string;
  image: string;
  imageAlt: string;
  takeaway: string;
  disclaimer?: string;
  sections: MagazineArticleSection[];
};

type StudyArticleInput = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  takeaway: string;
  focus: string;
  scene: string;
  routine: string;
  example: string[];
  checklist: string[];
};

const studyArticleDetails: Record<string, { image: string; imageAlt: string; sections: MagazineArticleSection[] }> = {
  "opic-survey-choice-guide": {
    image: opicSurveyChoiceGuideCover,
    imageAlt: "책상 위 노트와 펜, 안경을 놓고 OPIc 서베이 선택지를 정리하는 장면",
    sections: [
      {
        heading: "시험 전날 바꾸고 싶어지는 선택지",
        paragraphs: [
          "서베이를 고를 때 가장 흔한 함정은 '있어 보이는 취미'를 찾는 것입니다. 수영을 거의 하지 않는데 수영을 고르거나, 여행 이야기가 부족한데 여행을 크게 열어 두면 질문을 받는 순간 머릿속이 바빠집니다.",
          "오히려 좋은 선택지는 소박합니다. 집 근처 산책, 자주 가는 카페, 주말에 보는 영화처럼 말이 바로 나오는 소재가 낫습니다. 시험장은 새로운 이야기를 만드는 곳이 아니라, 이미 익숙한 장면을 꺼내는 곳에 가깝습니다.",
        ],
      },
      {
        heading: "고르기 전에 10초만 말해 보기",
        paragraphs: [
          "선택지를 누르기 전에 한국어로라도 10초 안에 장면 하나가 떠오르는지 확인하세요. 장소, 함께 있던 사람, 내가 한 행동 중 두 가지가 바로 떠오르면 연습용 소재로 쓸 가능성이 높습니다.",
          "반대로 '좋아하긴 하는데 설명할 말이 없다'면 시험 준비에는 조금 불리할 수 있습니다. 관심과 답변 가능성은 다릅니다. 오픽온미의 서베이 고정 화면은 이 둘을 분리해서 보게 만드는 용도로 쓰면 좋습니다.",
        ],
        bullets: ["10초 안에 장소 하나가 떠오른다", "반복 행동을 말할 수 있다", "최근 변화나 작은 문제 상황으로 확장할 수 있다"],
      },
      {
        heading: "답변 범위를 줄이면 말이 길어진다",
        paragraphs: [
          "선택지를 줄이면 답변도 짧아질 것 같지만 실제로는 반대인 경우가 많습니다. 말할 장면이 적어질수록 한 장면을 여러 각도로 다시 쓰게 되고, 그때 답변의 밀도가 올라갑니다.",
          "예를 들어 카페를 고른다면 묘사 질문에서는 조용한 자리와 음악을 말하고, 비교 질문에서는 예전에는 붐비는 곳을 갔지만 요즘은 조용한 곳을 찾는다고 말할 수 있습니다. 소재는 하나지만 입구는 여러 개가 됩니다.",
        ],
      },
      {
        heading: "선택지 점검 예시",
        paragraphs: [
          "아래 문장은 그대로 외우기보다 내가 왜 그 선택지를 고정했는지 확인하는 말입니다. 이 정도 설명이 자연스럽게 나오면 연습을 시작해도 됩니다.",
          "영어 문장이 완벽하지 않아도 괜찮습니다. 중요한 것은 그 선택지가 실제 내 루틴과 붙어 있는지입니다.",
        ],
        example: {
          title: "서베이 선택 이유 말하기",
          lines: [
            "I choose walking because it is part of my real routine.",
            "I can talk about the park near my home, the time I usually go there, and how I feel after walking.",
            "So if the question changes a little, I can still use the same scene.",
          ],
        },
      },
      {
        heading: "오픽온미에서는 이렇게 이어가기",
        paragraphs: [
          "서베이를 고정했다면 바로 난이도나 스크립트로 넘어가기 전에 선택한 소재를 한 줄씩 적어 보세요. '카페 - 퇴근 후 - 노트 정리'처럼 짧아도 충분합니다.",
          "그 다음 스크립트 훈련에서 같은 장면을 60초 답변으로 키우고, 실전 연습에서 녹음해 보세요. 서베이는 체크리스트가 아니라 이후 답변을 좁혀 주는 시작점입니다.",
        ],
      },
    ],
  },
  "opic-55-difficulty-guide": {
    image: opic55DifficultyGuideCover,
    imageAlt: "노트북을 켜 두고 OPIc 난이도와 답변 길이를 정리하는 책상",
    sections: [
      {
        heading: "5-5가 어려운 단어를 뜻하지는 않는다",
        paragraphs: [
          "난이도 5-5를 고르면 갑자기 고급 단어를 써야 한다고 느끼기 쉽습니다. 하지만 연습 기준으로 볼 때 5-5의 핵심은 단어 수준보다 답변의 폭입니다.",
          "한 질문에 장소, 행동, 이유, 변화가 들어가면 답변은 자연스럽게 길어집니다. 반대로 어려운 표현을 넣어도 장면이 비어 있으면 말은 금방 끊깁니다.",
        ],
      },
      {
        heading: "45초와 90초를 둘 다 준비하기",
        paragraphs: [
          "처음부터 모든 답변을 90초로 만들 필요는 없습니다. 먼저 45초로 핵심 장면을 말하고, 같은 답변에 이유와 최근 변화를 붙여 90초로 늘려 보세요.",
          "이 연습은 시험장에서 질문이 짧게 느껴질 때와 길게 말할 수 있을 때를 모두 대비하게 해 줍니다. 길이 조절이 되면 난이도 선택도 덜 불안해집니다.",
        ],
        bullets: ["45초: 장소와 행동만 분명히 말한다", "60초: 이유나 감정을 하나 붙인다", "90초: 과거와 지금의 차이를 더한다"],
      },
      {
        heading: "카페 답변 하나로 보는 밀도",
        paragraphs: [
          "카페 답변을 예로 들면 'I like cafes'에서 멈추는 답변과 '퇴근 후 조용한 자리에서 노트를 정리한다'고 말하는 답변은 완전히 다르게 들립니다.",
          "5-5 연습에서는 두 번째 답변을 목표로 삼습니다. 화려한 표현보다 듣는 사람이 장면을 따라올 수 있는 구체성이 먼저입니다.",
        ],
        example: {
          title: "답변 확장 예시",
          lines: [
            "There is a small cafe near my office, and I usually go there after work.",
            "I sit near the window, order an iced latte, and write down what I need to do the next day.",
            "It is not a special place, but that quiet routine helps me reset.",
          ],
        },
      },
      {
        heading: "무리해서 길게 말할 때 생기는 문제",
        paragraphs: [
          "답변을 길게 만들겠다고 같은 말을 반복하면 오히려 불안정하게 들립니다. 'really nice', 'very good', 'I like it'이 계속 나오면 길이는 늘어도 정보는 늘지 않습니다.",
          "한 문장을 더 말하고 싶을 때는 형용사를 반복하기보다 행동을 하나 넣으세요. 무엇을 주문했는지, 어디에 앉았는지, 왜 그 시간이 편했는지가 답변을 살립니다.",
        ],
      },
      {
        heading: "난이도 페이지에서 확인할 것",
        paragraphs: [
          "오픽온미의 난이도 페이지는 등급을 보장하는 화면이 아니라 답변 길이와 연습 밀도를 맞춰 보는 화면입니다. 현재 내 답변이 45초에서 멈추는지, 90초까지 버티는지 확인하는 기준으로 쓰면 좋습니다.",
          "난이도를 정한 뒤에는 스크립트 훈련으로 넘어가 같은 장면을 여러 질문에 붙여 보세요. 그때 난이도 선택이 실제 말하기 습관으로 바뀝니다.",
        ],
      },
    ],
  },
  "opic-roleplay-6-step-template": {
    image: opicRoleplay6StepTemplateCover,
    imageAlt: "노트북과 휴대폰이 놓인 책상에서 롤플레이 요청 흐름을 정리하는 장면",
    sections: [
      {
        heading: "롤플레이는 친절한 문장 암기가 아니다",
        paragraphs: [
          "롤플레이를 준비할 때 가장 먼저 외우는 말은 보통 'Could you...'입니다. 물론 필요한 표현이지만, 그 문장만 많아지면 정작 무엇을 요청하는지 흐려집니다.",
          "롤플레이 답변은 작은 전화 한 통처럼 생각하는 편이 쉽습니다. 왜 연락했는지, 무엇을 확인해야 하는지, 어떤 대안을 원하는지 순서대로 말하면 됩니다.",
        ],
      },
      {
        heading: "6단계를 짧게 붙이는 순서",
        paragraphs: [
          "여섯 단계라고 해서 답변이 길어야 하는 것은 아닙니다. 상황 확인, 문제 설명, 정보 질문, 대안 요청, 조건 확인, 감사 표현을 짧게 붙이면 충분합니다.",
          "중요한 건 단계 이름을 외우는 것이 아니라, 중간에 멈췄을 때 다음에 물어볼 정보가 무엇인지 떠올리는 것입니다.",
        ],
        bullets: ["상황을 받아들인다", "문제를 한 문장으로 말한다", "필요한 정보를 묻는다", "가능한 대안을 요청한다", "조건이나 시간을 확인한다", "감사 표현으로 닫는다"],
      },
      {
        heading: "예약 변경 상황으로 연습하기",
        paragraphs: [
          "여행 예약이나 수업 예약은 6단계를 붙여 보기 좋은 소재입니다. 날짜와 시간이 있어 정보 질문이 자연스럽고, 대안 요청도 분명하게 만들 수 있습니다.",
          "아래 예시는 시험용 정답이 아니라 흐름을 보는 예시입니다. 실제 연습에서는 room, class, court 같은 명사만 바꿔도 여러 상황에 쓸 수 있습니다.",
        ],
        example: {
          title: "짧은 롤플레이 예시",
          lines: [
            "Hi, I booked a room for this Friday, but my schedule changed.",
            "Could you check if I can move it to Saturday afternoon?",
            "If there is an extra fee, please let me know. Thank you for your help.",
          ],
        },
      },
      {
        heading: "말이 막히는 지점은 대부분 정보 질문이다",
        paragraphs: [
          "롤플레이에서 멈추는 이유는 영어 표현을 몰라서만은 아닙니다. 어떤 정보를 물어봐야 할지 정하지 않은 상태에서 문장을 찾으려 하기 때문에 멈춥니다.",
          "연습할 때는 영어로 말하기 전 한국어로 '시간 확인', '비용 확인', '가능한 날짜 확인'처럼 질문 목적을 먼저 적어 보세요. 목적이 보이면 문장은 짧아도 이어집니다.",
        ],
      },
      {
        heading: "공식 페이지와 연결하기",
        paragraphs: [
          "오픽온미의 롤플레이 공식 페이지에서는 이 흐름을 상황별 카드로 다시 연습할 수 있습니다. 먼저 공식을 익히고, 여행·실내·운동·집 시나리오로 넘어가면 구조가 덜 흔들립니다.",
          "처음에는 친절한 표현을 늘리기보다 문제 설명과 대안 요청 두 문장을 안정시키는 데 집중하세요.",
        ],
      },
    ],
  },
  "opic-recording-review-routine": {
    image: opicRecordingReviewRoutineCover,
    imageAlt: "책상 위 마이크와 녹음 장비로 OPIc 답변을 다시 들어보는 장면",
    sections: [
      {
        heading: "녹음 파일을 다시 들을 때 먼저 보이는 것",
        paragraphs: [
          "처음 녹음을 들으면 문법보다 먼저 '어, 여기서 왜 멈췄지?' 하는 지점이 들립니다. 바로 그 멈춤이 다음 연습의 출발점입니다.",
          "녹음 복습은 완벽한 파일을 만드는 시간이 아닙니다. 내가 어느 부분에서 장면을 잃어버렸는지 확인하고, 다음 답변에서 하나만 고치는 시간입니다.",
        ],
      },
      {
        heading: "10분 안에 끝내는 이유",
        paragraphs: [
          "한 답변을 오래 붙잡으면 고칠 것이 끝없이 보입니다. 그러다 보면 다음 질문으로 넘어가지 못하고, 실제 시험처럼 즉석에서 회복하는 힘도 잘 생기지 않습니다.",
          "10분 루틴은 일부러 짧습니다. 질문 읽기, 녹음하기, 한 번 듣기, 하나만 표시하기, 다시 말하기로 끝내면 연습이 가벼워집니다.",
        ],
        bullets: ["1분: 질문을 읽고 장면을 고른다", "2분: 멈추지 말고 녹음한다", "3분: 한 번만 듣고 끊긴 곳을 표시한다", "4분: 첫 문장이나 마무리만 바꿔 다시 녹음한다"],
      },
      {
        heading: "문법보다 먼저 표시할 것",
        paragraphs: [
          "첫 복습에서 문법 오류를 모두 잡으려 하면 답변의 흐름을 놓치기 쉽습니다. 먼저 질문에 직접 답했는지, 장면이 보이는지, 마지막 문장이 닫혔는지 확인하세요.",
          "문법은 두 번째나 세 번째 복습에서 다뤄도 늦지 않습니다. 말하기 시험 준비에서는 흐름을 잃지 않는 것이 먼저입니다.",
        ],
      },
      {
        heading: "수정 녹음은 같은 질문으로 한 번만",
        paragraphs: [
          "같은 질문을 세 번, 네 번 반복하면 점점 외운 말처럼 변합니다. 수정 녹음은 한 번만 하고, 바로 비슷한 질문으로 넘어가 보세요.",
          "예를 들어 카페 답변에서 첫 문장을 고쳤다면, 다음에는 '최근에 간 장소' 질문으로 바꿔 같은 장면을 다시 써 보는 식입니다.",
        ],
        example: {
          title: "복습 후 다시 말하기",
          lines: [
            "First try: I like this cafe because it is good.",
            "Second try: I often go to a small cafe near my office after work.",
            "Next question: A place I visited recently was that same cafe, but I can start from a different angle.",
          ],
        },
      },
      {
        heading: "실전 연습 화면에서 이어가기",
        paragraphs: [
          "오픽온미의 실전 연습 화면은 질문, 타이머, 녹음을 한곳에 모아 둡니다. 답변을 저장해 오래 보관하는 도구라기보다, 지금 말한 답변을 바로 듣고 다음 답변으로 넘기는 흐름에 맞춰져 있습니다.",
          "복습할 때마다 고칠 항목을 하나만 정해 보세요. 그렇게 쌓인 작은 수정이 실제 시험장에서 멈췄을 때 돌아오는 길이 됩니다.",
        ],
      },
    ],
  },
  "opic-home-topic-script-guide": {
    image: opicHomeTopicScriptGuideCover,
    imageAlt: "집 안 책상과 창가를 배경으로 거주지 답변 장면을 떠올리는 홈 오피스",
    sections: [
      {
        heading: "집 이야기는 특별하지 않아도 된다",
        paragraphs: [
          "집 주제에서 막히는 이유는 대단한 집을 설명하려 하기 때문입니다. 시험에서 필요한 것은 멋진 인테리어가 아니라 내가 그 공간에서 무엇을 하는지입니다.",
          "책상, 창문, 침대 옆 작은 선반처럼 아주 좁은 공간도 괜찮습니다. 그곳에서 반복하는 행동이 있으면 답변은 충분히 살아납니다.",
        ],
      },
      {
        heading: "공간 하나만 고르기",
        paragraphs: [
          "집 전체를 소개하려 하면 답변이 금방 목록처럼 변합니다. 대신 한 공간을 고르고 그 공간에 머무는 시간을 말해 보세요.",
          "예를 들어 '창가 책상'을 고르면 퇴근 후 노트를 정리하는 루틴, 주말 아침 커피, 최근 자리 배치를 바꾼 이야기까지 자연스럽게 이어집니다.",
        ],
        bullets: ["방 전체보다 책상 하나를 고른다", "언제 그곳에 앉는지 말한다", "그곳에서 하는 반복 행동을 붙인다"],
      },
      {
        heading: "묘사에서 문제 해결까지 확장하기",
        paragraphs: [
          "집 주제는 묘사 질문에서 끝나지 않습니다. 예전 집과 지금 집 비교, 이사 경험, 고장이나 수리 요청 같은 문제 해결 질문으로도 자주 변합니다.",
          "그래서 처음부터 작은 문제 하나를 준비해 두면 좋습니다. 인터넷이 느렸던 일, 책상이 좁았던 일, 창문 근처가 추웠던 일처럼 평범한 문제면 충분합니다.",
        ],
      },
      {
        heading: "집 주제 답변 예시",
        paragraphs: [
          "아래 예시는 집을 자랑하는 답변이 아니라, 공간과 루틴을 연결하는 방식입니다. 단어를 바꿔 내 방, 거실, 주방에도 그대로 적용할 수 있습니다.",
          "문장이 길지 않아도 장면이 분명하면 듣는 사람이 따라오기 쉽습니다.",
        ],
        example: {
          title: "창가 책상 답변",
          lines: [
            "My favorite spot at home is my desk near the window.",
            "After work, I sit there for about twenty minutes and write down what I need to do the next day.",
            "It is a small habit, but it makes my room feel like a place where I can slow down.",
          ],
        },
      },
      {
        heading: "집 롤플레이로 넘어가기",
        paragraphs: [
          "스크립트에서 공간을 정했다면, 롤플레이에서는 같은 공간에 문제가 생겼다고 생각해 보세요. 싱크대 누수, 인터넷 문제, 청소 일정 변경 같은 소재가 바로 이어집니다.",
          "오픽온미의 집 롤플레이 페이지에서 문제 위치, 증상, 원하는 시간을 짧게 말하는 연습을 붙이면 집 주제가 더 단단해집니다.",
        ],
      },
    ],
  },
  "opic-travel-topic-script-guide": {
    image: opicTravelTopicScriptGuideCover,
    imageAlt: "여행 가방과 지도, 노트를 펼쳐 두고 여행 답변 소재를 정리하는 장면",
    sections: [
      {
        heading: "여행지는 하나만 있어도 충분하다",
        paragraphs: [
          "여행 주제를 준비할 때 도시 이름을 많이 모으는 것보다 한 번의 여행을 제대로 말할 수 있는지가 더 중요합니다. 장소가 하나라도 출발, 분위기, 변수, 마무리가 있으면 여러 질문에 쓸 수 있습니다.",
          "특히 OPIc에서는 같은 여행을 묘사, 비교, 문제 해결 질문으로 바꿔 물을 수 있습니다. 그래서 여행 리스트보다 장면 하나의 구조가 더 쓸모 있습니다.",
        ],
      },
      {
        heading: "계획과 달라진 일을 넣기",
        paragraphs: [
          "여행 답변은 계획대로 흘러간 이야기보다 작은 변수가 있을 때 말하기 쉬워집니다. 비가 왔다, 길을 잘못 들었다, 예약 시간이 바뀌었다 같은 일은 답변에 방향을 만들어 줍니다.",
          "문제가 너무 극적일 필요는 없습니다. 오히려 작고 현실적인 변수가 자연스럽습니다. 그 변수를 어떻게 바꿨는지가 답변의 후반부가 됩니다.",
        ],
        bullets: ["처음 계획을 한 문장으로 말한다", "예상과 달라진 일을 넣는다", "바꾼 선택과 느낀 점으로 닫는다"],
      },
      {
        heading: "묘사 질문과 비교 질문을 나누기",
        paragraphs: [
          "묘사 질문에서는 장소의 분위기와 내가 한 행동을 먼저 말합니다. 비교 질문에서는 예전의 여행 방식과 지금의 여행 방식을 나누면 답변이 깔끔해집니다.",
          "한 여행 장면을 두 번 쓰더라도 시작 문장만 바꾸면 다른 답변처럼 들립니다. 이게 스크립트를 통째로 새로 만들지 않는 요령입니다.",
        ],
      },
      {
        heading: "여행 답변 예시",
        paragraphs: [
          "아래 예시는 바닷가 여행이지만, 산책길이나 당일치기 여행으로 바꿔도 흐름은 같습니다. 장소보다 변수와 선택이 핵심입니다.",
          "답변을 녹음할 때는 'weather changed' 뒤에 바로 해결 행동이 나오는지 확인해 보세요.",
        ],
        example: {
          title: "변수가 있는 여행 장면",
          lines: [
            "I still remember a short beach trip I took last spring.",
            "We planned to walk outside, but the weather changed suddenly, so we found a small cafe near the beach.",
            "That was not our original plan, but it made the trip more relaxed and memorable.",
          ],
        },
      },
      {
        heading: "여행 롤플레이와 연결하기",
        paragraphs: [
          "여행 스크립트를 만들었다면 예약 변경이나 교통 문제 롤플레이로 바로 이어갈 수 있습니다. 같은 여행 장면에서 '문제가 생겼다'고 상상하면 롤플레이 소재가 자연스럽게 나옵니다.",
          "오픽온미에서는 여행 스크립트와 여행 롤플레이를 따로 외우기보다 같은 장면을 두 방식으로 바꿔 말하는 연습을 추천합니다.",
        ],
      },
    ],
  },
  "opic-indoor-topic-guide": {
    image: opicIndoorTopicGuideCover,
    imageAlt: "카페 테이블에서 노트북과 커피를 두고 실내 활동 답변을 정리하는 장면",
    sections: [
      {
        heading: "카페 이야기가 짧아지는 이유",
        paragraphs: [
          "카페나 실내 활동은 너무 평범해서 말할 게 없다고 느끼기 쉽습니다. 하지만 평범한 장소일수록 루틴을 붙이면 답변이 안정됩니다.",
          "어떤 메뉴를 주문하는지보다 언제 가는지, 어디에 앉는지, 그 시간이 왜 필요한지가 더 중요합니다. 그 세 가지가 있으면 카페 답변은 금방 길어집니다.",
        ],
      },
      {
        heading: "감각 단서 하나만 넣기",
        paragraphs: [
          "실내 주제는 소리, 조명, 좌석, 냄새 같은 감각 단서가 잘 맞습니다. 단, 모든 감각을 다 넣으려 하면 산만해집니다.",
          "하나만 고르세요. 조용한 음악, 창가 자리, 낮은 조명처럼 장면을 보여 주는 단서 하나면 충분합니다.",
        ],
        bullets: ["시간대: 퇴근 후, 주말 아침, 점심시간", "장소 단서: 창가 자리, 벽 쪽 좌석, 조용한 구석", "감정: 머리가 정리된다, 쉬는 느낌이 든다"],
      },
      {
        heading: "집과 카페를 함께 쓰는 법",
        paragraphs: [
          "실내 활동은 집 주제와 겹쳐도 괜찮습니다. 집에서는 혼자 정리하는 루틴을 말하고, 카페에서는 분위기와 외부 공간이 주는 차이를 말하면 됩니다.",
          "같은 '노트 정리'라도 장소가 바뀌면 답변의 느낌이 달라집니다. 이 차이를 비교 질문에 활용할 수 있습니다.",
        ],
      },
      {
        heading: "실내 주제 답변 예시",
        paragraphs: [
          "예시는 일부러 단순하게 두는 편이 좋습니다. 실제 시험장에서 너무 꾸민 장면은 떠올리기 어렵기 때문입니다.",
          "아래 답변처럼 루틴과 감정만 분명해도 실내 주제는 충분히 자연스럽게 들립니다.",
        ],
        example: {
          title: "카페 루틴 답변",
          lines: [
            "There is a quiet cafe near my office, and I usually go there after work.",
            "I sit near the wall, order coffee, and check my notes for a few minutes.",
            "The place is not fancy, but the quiet music helps me slow down.",
          ],
        },
      },
      {
        heading: "실내 서비스 롤플레이로 바꾸기",
        paragraphs: [
          "실내 주제는 롤플레이로도 쉽게 이어집니다. 주문이 잘못 나왔거나 예약 시간이 바뀌었거나 자리가 없는 상황을 붙이면 됩니다.",
          "스크립트에서 만든 카페 장면을 롤플레이에서 다시 쓰면 새 소재를 만들지 않아도 됩니다. 오픽온미의 실내 롤플레이 페이지에서 같은 장소를 서비스 상황으로 바꿔 보세요.",
        ],
      },
    ],
  },
  "opic-im-to-ih-practice-plan": {
    image: opicImToIhPracticePlanCover,
    imageAlt: "작은 노트에 답변 확장 계획을 적어 IM에서 IH로 가는 연습을 준비하는 장면",
    sections: [
      {
        heading: "짧은 답변이 나쁜 건 아니다",
        paragraphs: [
          "IM 단계의 답변은 대체로 질문에 직접 답합니다. 이것 자체가 나쁜 것은 아닙니다. 문제는 거기서 바로 멈출 때 생깁니다.",
          "IH를 목표로 연습한다면 짧은 답변 위에 행동, 이유, 감정을 한 겹씩 얹어야 합니다. 어려운 단어보다 이 확장 습관이 먼저입니다.",
        ],
      },
      {
        heading: "한 문장 뒤에 행동을 붙이기",
        paragraphs: [
          "'I like walking'이라고 말했다면 바로 다음 문장에는 언제, 어디서, 어떻게 걷는지가 나와야 합니다. 이 행동 문장이 답변을 장면으로 바꿉니다.",
          "행동이 붙으면 이유도 자연스럽게 따라옵니다. 왜 걷는지, 걷고 나면 기분이 어떻게 달라지는지를 말할 수 있기 때문입니다.",
        ],
        bullets: ["직접 답변을 먼저 말한다", "반복 행동을 하나 붙인다", "그 행동이 나에게 주는 느낌을 말한다"],
      },
      {
        heading: "같은 단어 반복 줄이기",
        paragraphs: [
          "IH를 준비할 때 단어를 많이 외우는 것보다 반복을 줄이는 편이 체감 효과가 큽니다. good, nice, like가 계속 나오면 답변이 납작하게 들립니다.",
          "대신 quiet, crowded, familiar, relaxing처럼 장면을 보여 주는 단어를 조금씩 넣어 보세요. 단어 수는 적어도 답변의 표정이 달라집니다.",
        ],
      },
      {
        heading: "IM 답변을 IH 쪽으로 늘리는 예시",
        paragraphs: [
          "아래 예시는 답변을 어렵게 만드는 예시가 아닙니다. 이미 말할 수 있는 문장에 구체적 행동과 이유를 붙이는 방식입니다.",
          "이런 확장은 스크립트 훈련보다 녹음 복습에서 더 잘 보입니다. 내 녹음을 들으며 비어 있는 행동 문장을 찾아 보세요.",
        ],
        example: {
          title: "짧은 답변 확장",
          lines: [
            "Short answer: I like walking in my neighborhood.",
            "Expanded answer: I usually walk after dinner because the streets are quiet, and that small routine helps me clear my head.",
            "Next step: I can add a recent change, like a new park path I found last month.",
          ],
        },
      },
      {
        heading: "오픽온미에서 2주만 반복하기",
        paragraphs: [
          "서베이에서 고른 소재 3개만 골라 같은 방식으로 확장해 보세요. 매일 새 질문을 많이 푸는 것보다, 같은 장면을 더 선명하게 만드는 연습이 도움이 됩니다.",
          "실전 연습에서는 답변마다 '행동이 있는가'만 체크해도 충분합니다. 그 기준 하나가 IM에서 IH로 넘어가는 말하기 습관을 바꿉니다.",
        ],
      },
    ],
  },
  "opic-last-week-study-plan": {
    image: opicLastWeekStudyPlanCover,
    imageAlt: "노트와 필기구를 펼쳐 시험 일주일 전 OPIc 연습 일정을 정리하는 장면",
    sections: [
      {
        heading: "마지막 일주일에는 새 노트를 만들지 않는다",
        paragraphs: [
          "시험이 가까워지면 새 자료를 더 찾아보고 싶어집니다. 하지만 마지막 주에 소재를 늘리면 말할 장면이 오히려 흐려질 수 있습니다.",
          "이 시기에는 이미 고른 장면을 시험장에서 바로 꺼낼 수 있게 만드는 쪽이 낫습니다. 새로움보다 회수율이 중요합니다.",
        ],
      },
      {
        heading: "하루 두 질문이면 충분하다",
        paragraphs: [
          "마지막 주 연습은 길게 잡지 않아도 됩니다. 하루에 질문 두 개를 고르고, 각각 한 번 녹음한 뒤 하나만 수정해 보세요.",
          "이 루틴은 부담이 적어서 매일 이어 가기 쉽습니다. 컨디션이 흔들리는 주간에는 꾸준히 반복 가능한 양이 더 중요합니다.",
        ],
        bullets: ["새 주제 추가를 멈춘다", "기존 장면을 45초와 90초로 말한다", "롤플레이 공식은 하루 한 상황만 반복한다"],
      },
      {
        heading: "D-7부터 D-1까지의 흐름",
        paragraphs: [
          "초반 3일은 서베이와 스크립트 장면을 정리합니다. 중간 2일은 롤플레이와 문제 해결 질문을 붙입니다. 마지막 2일은 녹음 복습만 가볍게 합니다.",
          "시험 전날에는 새 표현을 외우기보다 첫 문장만 천천히 말해 보는 편이 좋습니다. 시작이 안정되면 뒤 문장도 따라올 가능성이 높습니다.",
        ],
      },
      {
        heading: "마지막 주 답변 예시",
        paragraphs: [
          "마지막 주에는 영어 문장을 많이 바꾸지 마세요. 이미 익숙한 장면을 길이만 다르게 말해 보는 것이 더 실전적입니다.",
          "아래처럼 같은 이야기를 짧게, 길게 바꾸는 연습을 하면 질문 길이에 덜 흔들립니다.",
        ],
        example: {
          title: "같은 장면 길이 조절",
          lines: [
            "Short version: I often go to a small cafe after work because it helps me relax.",
            "Longer version: I sit near the window, order coffee, and write down my plan for the next day.",
            "Closing: That simple routine makes my evening feel organized.",
          ],
        },
      },
      {
        heading: "시험 전날 확인할 것",
        paragraphs: [
          "전날에는 전체 스크립트를 다시 외우려 하지 말고 첫 문장 목록만 확인하세요. 첫 문장이 떠오르면 답변의 방향을 잡기 쉽습니다.",
          "오픽온미의 실전 연습에서 질문을 몇 개만 랜덤으로 돌려 보고, 녹음은 짧게 확인하세요. 많이 하는 것보다 무리하지 않는 것이 마지막 주에는 더 중요합니다.",
        ],
      },
    ],
  },
  "opic-answer-checklist": {
    image: opicAnswerChecklistCover,
    imageAlt: "체크리스트 노트에 답변 녹음 후 확인할 항목을 적어 둔 장면",
    sections: [
      {
        heading: "녹음을 들을 때 가장 먼저 볼 것",
        paragraphs: [
          "녹음을 다시 들으면 발음이나 문법부터 고치고 싶어집니다. 하지만 첫 번째 확인은 질문에 직접 답했는지입니다.",
          "질문이 장소를 묻는데 취미 이야기로 오래 돌아가거나, 경험을 묻는데 일반 설명만 하면 답변이 약해집니다. 체크리스트의 첫 줄은 항상 질문 대응입니다.",
        ],
      },
      {
        heading: "문법보다 먼저 표시할 지점",
        paragraphs: [
          "문법 오류를 표시하기 전에 말이 멈춘 지점을 표시하세요. 그곳은 단어가 부족한 곳일 수도 있지만, 대개 다음 장면이 준비되지 않은 곳입니다.",
          "멈춘 지점을 찾으면 다음 녹음에서 넣을 행동 하나를 정합니다. 예를 들어 '카페가 좋다'에서 멈췄다면 '창가에 앉아 노트를 정리한다'를 붙이는 식입니다.",
        ],
        bullets: ["질문에 바로 답했는가", "장소나 행동이 눈에 보이는가", "같은 표현이 세 번 이상 반복되는가", "마지막 문장이 닫혔는가"],
      },
      {
        heading: "두 번째 녹음에서 하나만 바꾸기",
        paragraphs: [
          "첫 녹음을 듣고 모든 것을 고치려 하면 답변이 무거워집니다. 두 번째 녹음에서는 하나만 바꾸세요. 첫 문장, 연결어, 마무리 중 하나면 충분합니다.",
          "이렇게 해야 다음 질문으로 넘어갈 수 있습니다. OPIc 연습은 한 답변을 완성하는 작업이 아니라 여러 질문에서 회복하는 연습에 가깝습니다.",
        ],
      },
      {
        heading: "체크리스트 적용 예시",
        paragraphs: [
          "체크리스트는 길게 쓰지 않아도 됩니다. 녹음 옆에 짧은 표시를 남기는 정도가 실제 연습에서는 더 잘 이어집니다.",
          "아래처럼 한 줄씩만 적어도 다음 답변에서 무엇을 바꿀지 충분히 보입니다.",
        ],
        example: {
          title: "녹음 메모 예시",
          lines: [
            "Question match: yes, but the opening was too slow.",
            "Scene: cafe seat and coffee were clear.",
            "Fix next time: add one closing sentence about why the routine matters.",
          ],
        },
      },
      {
        heading: "실전 연습 화면에서 쓰는 법",
        paragraphs: [
          "오픽온미의 실전 연습에서 녹음한 뒤에는 체크리스트를 전부 채우려 하지 않아도 됩니다. 오늘은 질문 대응, 내일은 마무리처럼 하나씩만 봐도 좋습니다.",
          "중요한 것은 점수표처럼 자신을 평가하는 것이 아니라, 다음 녹음에서 바로 바꿀 행동을 하나 남기는 것입니다.",
        ],
      },
    ],
  },
};

function makeStudyArticle(input: StudyArticleInput, index: number): MagazineArticle {
  const detail = studyArticleDetails[input.id];

  return {
    id: input.id,
    category: "OPIc 훈련 가이드",
    title: input.title,
    subtitle: input.subtitle,
    date: `2026.07.${String(1 + index).padStart(2, "0")}`,
    readMinutes: "7분 읽기",
    summary: input.summary,
    image: detail.image,
    imageAlt: detail.imageAlt,
    takeaway: input.takeaway,
    disclaimer: "이 글은 OPIc 말하기를 준비하는 학습자를 위한 연습용 참고 자료입니다. 공식 시험기관의 보증이나 특정 등급 취득을 의미하지 않습니다.",
    sections: detail.sections,
  };
}

const additionalStudyArticles: MagazineArticle[] = [
  makeStudyArticle(
    {
      id: "opic-survey-choice-guide",
      title: "OPIc 서베이 선택, 답변 범위를 좁히는 기준",
      subtitle: "많이 고르는 선택지가 아니라 내가 바로 말할 수 있는 장면을 기준으로 서베이를 정리하는 방법입니다.",
      summary: "OPIc 서베이는 관심사 목록처럼 보이지만 연습에서는 답변 소재를 줄이는 장치로 써야 합니다. 오픽온미의 고정 서베이를 활용해 말할 범위를 좁히는 기준을 정리했습니다.",
      takeaway: "좋은 서베이 선택은 멋진 취미가 아니라 10초 안에 장소, 행동, 감정이 떠오르는 선택입니다.",
      focus: "서베이 선택",
      scene: "자주 가는 장소나 반복하는 활동",
      routine: "내가 실제로 말할 수 있는 선택지 5-7개",
      checklist: ["10초 안에 경험 하나가 떠오른다", "장소와 행동을 함께 말할 수 있다", "최근 변화나 문제 상황으로 확장할 수 있다"],
      example: ["I usually choose topics that are close to my real routine.", "For example, walking and cafes are easy for me because I can describe a real place.", "That way, I do not need to invent a new story during the test."],
    },
    0,
  ),
  makeStudyArticle(
    {
      id: "opic-55-difficulty-guide",
      title: "오픽 난이도 5-5, 누구에게 맞고 어떻게 연습할까",
      subtitle: "난이도 5-5를 어려운 단어의 문제가 아니라 답변 길이와 구체성의 기준으로 이해하는 가이드입니다.",
      summary: "5-5 연습은 긴 답변을 무조건 만들기 위한 단계가 아닙니다. 한 장면을 60-90초로 설명하고 이유와 변화를 붙이는 기준으로 활용해야 합니다.",
      takeaway: "난이도 5-5는 말할 내용을 크게 만드는 설정이 아니라 답변 안의 장면을 더 구체적으로 만드는 연습 기준입니다.",
      focus: "난이도 5-5",
      scene: "60-90초로 설명할 수 있는 생활 장면",
      routine: "장소, 행동, 이유, 변화가 들어간 답변 길이",
      checklist: ["답변 시작 전에 장면 하나를 정한다", "구체적 행동을 한 문장 이상 넣는다", "마지막에 느낌이나 변화로 닫는다"],
      example: ["I would choose level 5-5 as a practice target because it pushes me to explain more clearly.", "Instead of using difficult words, I try to add a specific action and a reason.", "That makes my answer easier to follow."],
    },
    1,
  ),
  makeStudyArticle(
    {
      id: "opic-roleplay-6-step-template",
      title: "롤플레이 6단계 답변 구조와 예시",
      subtitle: "문제 설명, 정보 질문, 대안 요청, 감사 표현으로 이어지는 OPIc 롤플레이 답변 뼈대입니다.",
      summary: "롤플레이는 표현을 많이 외우는 것보다 상황을 정리하고 필요한 정보를 묻는 순서가 중요합니다. 여섯 단계로 답변을 안정시키는 방법을 정리했습니다.",
      takeaway: "롤플레이 답변은 친절한 문장 모음이 아니라 상대가 도와줄 수 있게 정보를 정리하는 순서입니다.",
      focus: "롤플레이 6단계",
      scene: "예약 변경이나 서비스 문제 상황",
      routine: "문제 확인, 정보 질문, 대안 요청, 감사 마무리",
      checklist: ["누구에게 연락하는지 말한다", "문제를 한 문장으로 설명한다", "원하는 대안을 분명히 요청한다"],
      example: ["I'm calling because I have a problem with my reservation.", "Could you check if I can change it to tomorrow afternoon?", "If that is not possible, please let me know another available time."],
    },
    2,
  ),
  makeStudyArticle(
    {
      id: "opic-recording-review-routine",
      title: "녹음으로 답변을 고치는 10분 루틴",
      subtitle: "녹음 후 모든 실수를 고치려 하지 않고 다음 답변으로 이어지는 수정 포인트만 찾는 연습법입니다.",
      summary: "녹음 복습은 평가가 아니라 다음 답변을 설계하는 과정입니다. 10분 안에 질문, 녹음, 표시, 재녹음을 끝내는 실전 루틴을 소개합니다.",
      takeaway: "녹음 복습의 목표는 완벽한 파일이 아니라 다음 질문에서 바로 써먹을 수정 포인트 하나를 찾는 것입니다.",
      focus: "녹음 복습",
      scene: "실전 연습 화면에서 말한 60초 답변",
      routine: "질문 선택, 첫 녹음, 끊긴 지점 표시, 수정 녹음",
      checklist: ["첫 문장이 질문에 직접 답한다", "중간에 같은 단어가 반복되지 않는다", "마지막 문장이 자연스럽게 닫힌다"],
      example: ["First, I record my answer without stopping.", "Then I listen once and mark only one weak point.", "Finally, I record the same answer again with a clearer opening."],
    },
    3,
  ),
  makeStudyArticle(
    {
      id: "opic-home-topic-script-guide",
      title: "집/거주지 주제 답변을 하나의 장면으로 만드는 법",
      subtitle: "평범한 집 이야기를 위치, 루틴, 변화, 문제 해결로 확장하는 스크립트 가이드입니다.",
      summary: "집 주제는 특별한 사건보다 익숙한 공간을 구체적으로 말하는 힘이 중요합니다. 한 공간을 골라 여러 질문으로 바꾸는 방법을 설명합니다.",
      takeaway: "집 답변은 멋진 집 소개가 아니라 내가 자주 머무는 공간과 반복 행동을 보여 주는 장면입니다.",
      focus: "집/거주지 주제",
      scene: "책상, 창문, 방 구조, 동네 길 같은 익숙한 공간",
      routine: "공간 하나와 반복 행동 하나",
      checklist: ["공간 이름을 정한다", "언제 그곳에 머무는지 말한다", "최근 변화나 불편한 문제를 붙인다"],
      example: ["My favorite part of my home is my desk near the window.", "I usually sit there after work and write down my plan for the next day.", "It is a small space, but it helps me feel calm."],
    },
    4,
  ),
  makeStudyArticle(
    {
      id: "opic-travel-topic-script-guide",
      title: "여행 주제를 묘사·비교·문제해결로 확장하는 법",
      subtitle: "하나의 여행 장면을 여러 질문 유형으로 바꾸는 OPIc 스크립트 훈련법입니다.",
      summary: "여행 글을 많이 외우는 대신 한 번의 여행 장면을 묘사, 비교, 문제 해결 질문으로 변형하는 연습이 필요합니다.",
      takeaway: "여행 주제는 장소명보다 계획, 예상과 다른 일, 해결 과정이 있어야 여러 질문에 버팁니다.",
      focus: "여행 주제",
      scene: "짧은 여행이나 당일치기 경험",
      routine: "출발 이유, 장소 묘사, 예상과 다른 일, 마무리 감정",
      checklist: ["왜 갔는지 말한다", "예상과 달랐던 일을 넣는다", "문제를 어떻게 바꾸었는지 설명한다"],
      example: ["I still remember a short beach trip I took last spring.", "We planned to walk outside, but the weather changed suddenly.", "So we found a small cafe, and that actually made the trip more relaxing."],
    },
    5,
  ),
  makeStudyArticle(
    {
      id: "opic-indoor-topic-guide",
      title: "카페·집·실내활동 답변 소재 만드는 법",
      subtitle: "실내 주제를 감각 묘사와 루틴으로 바꿔 말하는 오픽온미식 답변 설계입니다.",
      summary: "실내활동은 평범해 보이지만 소리, 조명, 좌석, 시간대 같은 단서를 넣으면 충분히 구체적인 답변 소재가 됩니다.",
      takeaway: "실내 주제는 장소의 화려함보다 내가 그곳에서 반복하는 행동과 느끼는 안정감이 핵심입니다.",
      focus: "실내활동 주제",
      scene: "카페, 방, 영화관, 음악 듣는 공간",
      routine: "장소 감각, 반복 행동, 쉬는 이유",
      checklist: ["시간대를 정한다", "감각 단서 하나를 넣는다", "내가 쉬는 이유를 말한다"],
      example: ["There is a quiet cafe near my office.", "I usually go there in the afternoon, order coffee, and check my notes.", "The soft music helps me slow down before going home."],
    },
    6,
  ),
  makeStudyArticle(
    {
      id: "opic-im-to-ih-practice-plan",
      title: "IM에서 IH로 올릴 때 바꿔야 할 답변 습관",
      subtitle: "짧은 직접 답변에서 장면 중심 답변으로 넘어가기 위한 연습 계획입니다.",
      summary: "IM에서 IH를 목표로 할 때는 어려운 단어보다 답변 안의 정보 밀도와 연결 방식이 중요합니다. 짧은 답변을 장면으로 확장하는 습관을 정리했습니다.",
      takeaway: "IH를 목표로 할수록 답변은 더 어려워지는 것이 아니라 더 선명해져야 합니다.",
      focus: "IM에서 IH로 가는 연습",
      scene: "짧은 답변을 60초 장면으로 확장하는 과정",
      routine: "직접 답변, 구체적 행동, 이유, 감정 추가",
      checklist: ["한 문장 답변에서 멈추지 않는다", "행동을 하나 더 붙인다", "개인적인 이유로 마무리한다"],
      example: ["I like walking in my neighborhood.", "I usually walk after dinner because the streets are quiet.", "That small routine helps me clear my head after a long day."],
    },
    7,
  ),
  makeStudyArticle(
    {
      id: "opic-last-week-study-plan",
      title: "시험 일주일 전 OPIc 학습 플랜",
      subtitle: "새 자료를 늘리기보다 기존 장면을 정리하고 녹음 루틴을 유지하는 마지막 주 계획입니다.",
      summary: "시험 일주일 전에는 새 스크립트를 많이 추가하기보다 이미 고른 장면을 짧게 말하고 다시 녹음하는 루틴이 필요합니다.",
      takeaway: "마지막 주의 목표는 더 많이 아는 것이 아니라 이미 아는 장면을 시험장에서 바로 꺼내는 것입니다.",
      focus: "시험 일주일 전 계획",
      scene: "이미 준비한 서베이와 스크립트 장면",
      routine: "하루 2개 질문 녹음과 한 가지 수정",
      checklist: ["새 주제 추가를 줄인다", "기존 장면을 45초와 90초로 말한다", "롤플레이 공식만 짧게 반복한다"],
      example: ["During the last week, I try not to add too many new topics.", "Instead, I record the same story in different lengths.", "That helps me stay calm when the question changes."],
    },
    8,
  ),
  makeStudyArticle(
    {
      id: "opic-answer-checklist",
      title: "답변 녹음 후 확인할 체크리스트",
      subtitle: "OPIc 답변을 들은 뒤 무엇부터 고쳐야 할지 정리하는 실전 점검표입니다.",
      summary: "녹음 후에는 모든 오류를 찾기보다 질문 대응, 장면 선명도, 연결, 마무리 순서로 확인해야 합니다. 실전 연습과 바로 연결되는 체크리스트를 제공합니다.",
      takeaway: "좋은 체크리스트는 실수를 많이 찾는 표가 아니라 다음 녹음에서 하나를 고치게 만드는 표입니다.",
      focus: "답변 녹음 체크리스트",
      scene: "실전 연습에서 저장한 답변 녹음",
      routine: "질문 대응, 장면, 연결어, 마무리 점검",
      checklist: ["질문에 직접 답했다", "장소나 행동이 눈에 보인다", "중간에 멈춘 이유를 표시했다", "마지막 문장이 닫혔다"],
      example: ["After recording, I first check if I answered the question directly.", "Then I listen for one missing detail, not every grammar mistake.", "For the next try, I only fix that one point."],
    },
    9,
  ),
];

export const magazineArticles: MagazineArticle[] = [
  {
    id: "opic-self-introduction-strategy",
    category: "시험 전략",
    title: "OPIc 자기소개, 꼭 해야 할까? 대충 해도 될까?",
    subtitle: "점수용 답변처럼 길게 외우기보다, 첫 목소리를 안정시키는 짧은 워밍업으로 쓰는 편이 현실적입니다.",
    date: "2026.06.26",
    readMinutes: "6분 읽기",
    summary: "자기소개는 OPIc 준비생들 사이에서도 의견이 갈립니다. 어떤 사람은 채점 핵심이 아니니 시간을 쓰지 말라고 하고, 어떤 사람은 첫 발화가 흔들리면 뒤 답변까지 영향을 준다고 말합니다. 결론은 단순합니다. 길게 외울 필요는 없지만, 20~30초짜리 자연스러운 시작 문장은 준비해 두는 편이 좋습니다.",
    image: selfIntroductionCover,
    imageAlt: "헤드셋을 끼고 노트에 자기소개 답변을 정리하는 학습자",
    takeaway: "자기소개는 점수를 따는 긴 답변이 아니라 시험장에 내 목소리를 올려놓는 짧은 예열입니다. 이름과 신상보다 오늘 어떤 사람으로 말할지 보여 주는 20~30초면 충분합니다.",
    disclaimer: "OPIc의 세부 채점 방식은 공개되어 있지 않습니다. 이 글은 공식 점수 보장 기준이 아니라, 준비생들이 자주 나누는 관점과 실전 연습 경험을 바탕으로 정리한 학습 전략입니다.",
    sections: [
      {
        heading: "의견이 갈리는 이유",
        paragraphs: [
          "자기소개를 두고 가장 많이 나오는 말은 크게 두 가지입니다. 첫째, 자기소개는 본격 질문이 아니니 너무 공들일 필요가 없다는 의견입니다. 둘째, 그래도 시험의 첫 발화이기 때문에 준비 없이 들어가면 말 속도와 목소리 크기가 흔들릴 수 있다는 의견입니다.",
          "공식 안내에서도 OPIc는 외운 발표를 확인하는 시험이 아니라 실제 상황에서 언어를 얼마나 사용할 수 있는지 보는 말하기 평가에 가깝다고 설명합니다. 그래서 자기소개도 완성된 대본을 보여 주는 시간으로 잡기보다, 자연스럽게 말하기 모드로 들어가는 짧은 예열로 보는 편이 안전합니다.",
          "두 의견은 사실 서로 충돌하지 않습니다. 자기소개를 길게 외우는 것은 비효율적이지만, 짧고 쉬운 문장으로 입을 푸는 것은 도움이 됩니다. 특히 긴장하면 첫 문장이 갑자기 안 나오는 학습자라면 자기소개를 작은 안전장치처럼 준비하는 편이 낫습니다.",
        ],
        note: {
          title: "OOM 관점",
          text: "자기소개는 메인 답변의 리허설이 아닙니다. 시험장에서 내 발음, 속도, 호흡을 한번 맞춰 보는 시작 버튼에 가깝습니다.",
        },
      },
      {
        heading: "해야 한다면 어디까지 해야 할까",
        paragraphs: [
          "추천 길이는 20~30초입니다. 이름, 직업, 학교, 가족관계처럼 개인정보를 자세히 나열하기보다 내가 어떤 일상을 가진 사람인지 가볍게 보여 주면 충분합니다. 예를 들어 일하거나 공부하는 상황, 요즘 관심 있는 활동, 말하기 시험이라 조금 긴장된다는 자연스러운 한마디 정도면 됩니다.",
          "반대로 1분이 넘는 자기소개를 외우면 본 질문에서 쓸 집중력이 먼저 빠질 수 있습니다. 게다가 지나치게 매끈한 암기문은 뒤의 즉흥 답변과 톤 차이가 커져서 오히려 어색하게 들릴 수 있습니다.",
        ],
        image: selfIntroductionWarmup,
        imageAlt: "길게 외운 자기소개 메모와 짧은 워밍업 메모가 책상 위에 놓인 모습",
        imageCaption: "긴 암기문보다 짧은 키워드 3개가 시험장에서는 더 오래 살아남습니다.",
        bullets: [
          "좋은 목표: 첫 목소리 크기 확인, 말 속도 안정, 쉬운 문장으로 시작하기",
          "줄일 내용: 회사명, 학교명, 가족관계, 상세 주소, 길고 복잡한 목표 설명",
          "적당한 길이: 천천히 말했을 때 4~5문장, 약 20~30초",
        ],
      },
      {
        heading: "대충 하는 것과 짧게 하는 것은 다릅니다",
        paragraphs: [
          "자기소개를 대충 해도 된다는 말은 아무 말이나 해도 된다는 뜻이 아닙니다. 핵심은 힘을 빼되 흐름은 갖추는 것입니다. 너무 짧게 끝내면 첫 답변부터 자신감이 없어 보일 수 있고, 너무 길게 말하면 다음 질문에서 리듬을 잃기 쉽습니다.",
          "가장 좋은 방식은 쉬운 문장을 정확하게 말하고, 마지막을 다음 답변으로 넘어가기 좋은 분위기로 닫는 것입니다. 어려운 단어를 넣기보다 평소 내 말투에 가까운 표현을 고르세요.",
        ],
        example: {
          title: "25초 자기소개 예시",
          description: "그대로 외우기보다 내 상황에 맞는 단어만 바꿔 쓰세요.",
          lines: [
            "Hi, I'm Min. I work during the week, so I usually try to rest well on weekends.",
            "These days, I like taking short walks and listening to music after work.",
            "I'm a little nervous today, but I'll try to speak naturally and explain my experiences clearly.",
          ],
        },
      },
      {
        heading: "자기소개에 넣으면 좋은 3가지",
        paragraphs: [
          "첫째, 현재 상태를 아주 간단히 말합니다. 직장인인지 학생인지, 혹은 요즘 어떤 생활 패턴인지 정도면 충분합니다. 둘째, 시험에서 다시 꺼낼 수 있는 취미나 일상 소재를 하나 넣습니다. 산책, 음악, 카페, 운동처럼 뒤 질문과 연결 가능한 소재가 좋습니다.",
          "셋째, 오늘 말하기 태도를 한 문장으로 정리합니다. 예를 들어 자연스럽게 말해 보겠다, 내 경험을 천천히 설명하겠다는 식입니다. 이 문장은 실제 점수용 표현이라기보다 긴장한 나에게 주는 신호에 가깝습니다.",
        ],
        bullets: [
          "현재 상태: I work during the week / I'm currently studying / I spend most days at home",
          "연결 소재: I like walking, watching movies, or meeting friends on weekends",
          "말하기 태도: I'll try to speak naturally and give clear examples",
        ],
      },
      {
        heading: "마지막 점검 루틴",
        paragraphs: [
          "시험 전날에는 자기소개 전체를 10번 외우기보다, 키워드 3개만 보고 말하는 연습을 3번 해보세요. 같은 문장을 완벽히 반복하는 것보다 조금씩 다르게 말해도 30초 안에 끝낼 수 있는지가 더 중요합니다.",
          "시험 당일에는 첫 문장을 천천히 시작하세요. 빠르게 시작하면 자기소개가 끝난 뒤 본 질문에서도 계속 빨라지는 경우가 많습니다. 자기소개는 짧게, 또렷하게, 그리고 다음 질문을 받을 준비가 된 상태로 마무리하면 됩니다.",
        ],
        note: {
          title: "한 줄 결론",
          text: "안 해도 된다고 생각하고 버리기보다는, 길게 외우지 않는 짧은 예열문으로 준비하는 쪽이 가장 부담이 적습니다.",
        },
      },
    ],
  },
  {
    id: "opic-2026-strategy",
    category: "학습 전략",
    title: "2026 오픽 준비, 기출 소문보다 먼저 잡아야 할 3가지",
    subtitle: "외운 답을 늘리는 대신, 어떤 질문에도 꺼내 쓸 수 있는 ‘내 장면’을 만드는 법",
    date: "2026.06.21",
    readMinutes: "6분 읽기",
    summary: "최근 문제를 쫓느라 공부가 흔들린다면, 장면·변형·회복의 세 축부터 다시 잡아 보세요. 예상 밖 질문에도 무너지지 않는 답변 설계를 소개합니다.",
    image: strategyStoryPractice,
    imageAlt: "노트를 앞에 두고 자신의 경험을 말로 설명하는 학습자",
    takeaway: "기출은 답안을 베끼는 재료가 아니라, 내 장면에 어떤 입구가 붙을 수 있는지 확인하는 지도입니다.",
    sections: [
      {
        heading: "기출을 외울수록 답이 짧아지는 이유",
        paragraphs: [
          "오픽을 준비하다 보면 ‘이번에는 이 주제가 나왔다’는 후기가 가장 먼저 눈에 들어옵니다. 물론 주제 감각을 익히는 데는 도움이 됩니다. 문제는 그 후기를 문장째 저장해 두고, 시험장에서 질문이 조금만 바뀌어도 다음 문장을 찾느라 멈추는 순간입니다.",
          "실전에서는 하나의 경험을 소개·비교·과거 경험·최근 변화·문제 해결처럼 여러 각도에서 물을 수 있습니다. 따라서 준비의 단위는 질문 하나가 아니라, 질문이 닿을 수 있는 하나의 ‘장면’이어야 합니다. 장면이 선명하면 질문의 입구가 바뀌어도 말의 중심은 유지됩니다.",
        ],
        note: {
          title: "기출을 쓰는 가장 좋은 방식",
          text: "후기를 볼 때는 ‘무슨 답을 했나’ 대신 ‘이 질문은 내 어느 경험과 연결되는가’를 한 줄로 적어 보세요. 이 전환만으로 암기 노트가 장면 노트가 됩니다.",
        },
      },
      {
        heading: "하나의 장면은 네 가지 정보로 완성됩니다",
        paragraphs: [
          "60~90초짜리 이야기는 특별한 사건일 필요가 없습니다. 오히려 내 말로 설명하기 쉬운 평범한 장면이 오래 갑니다. 최근에 갔던 공원, 혼자 정리한 방, 주말마다 듣는 운동 수업처럼 감각이 남아 있는 경험을 고르세요.",
          "선택한 장면은 다음 네 칸으로 정리합니다. 각 칸에 두세 개의 단어만 적어 두면, 스크립트를 외우지 않아도 말의 순서를 되찾을 수 있습니다.",
        ],
        bullets: [
          "배경: 언제, 어디서, 누구와 있었는가",
          "디테일: 보였던 것·들렸던 것·내가 한 행동 하나",
          "작은 변화: 기대와 달랐던 점, 문제, 혹은 계획 변경",
          "의미: 그래서 무엇을 느꼈고 지금은 어떻게 하는가",
        ],
      },
      {
        heading: "질문이 바뀌어도 같은 장면으로 답하는 법",
        paragraphs: [
          "여행 장면 하나를 골랐다고 가정해 보겠습니다. ‘여행지를 설명해 달라’에는 장소와 분위기부터, ‘예전과 지금을 비교해 달라’에는 계획 방식의 변화를 먼저 꺼내면 됩니다. 소재는 같지만 질문에 맞춰 첫 문장과 강조점만 바뀝니다.",
          "이 연습에서 중요한 것은 완벽한 문장보다 ‘다시 돌아오는 문장’을 갖는 일입니다. 중간에 막혀도 배경이나 감정으로 돌아가면 이야기는 계속됩니다. 이 회복 능력이 자연스러운 발화의 뼈대가 됩니다.",
        ],
        example: {
          title: "같은 장면, 다른 시작",
          description: "주말 바닷가 여행이라는 한 장면을 세 질문에 연결해 보세요.",
          lines: [
            "Describe: “One place I still remember clearly is a quiet beach I visited last spring.”",
            "Compare: “I used to plan every hour of a trip, but that beach trip changed my mind.”",
            "Problem: “The funny thing is, the weather changed suddenly, so we had to change our plan.”",
          ],
        },
      },
      {
        heading: "시험 전 30분, 새 소재를 늘리지 않는 루틴",
        paragraphs: [
          "시험 직전에는 새로운 표현을 더 넣기보다 이미 고른 네 장면을 짧게 돌리는 편이 낫습니다. 한 장면당 90초를 재고 말한 뒤, 같은 장면을 45초로 줄여 보세요. 길이를 바꾸는 연습은 질문의 난이도와 시간 압박에 적응하게 해 줍니다.",
          "마지막으로 녹음 한 번을 듣고 ‘문법 오류’보다 ‘멈춘 자리’를 표시합니다. 그 자리에 연결어 하나나 다음 장면으로 돌아가는 문장 하나만 추가하세요. 전부 고치려는 욕심보다, 다음 답변에서 이어 말할 출구를 만드는 편이 훨씬 실전적입니다.",
        ],
      },
    ],
  },
  {
    id: "opic-grade-guide",
    category: "등급 가이드",
    title: "IM·IH·AL, 답변에서 실제로 느껴지는 차이",
    subtitle: "문법 문제집보다 먼저 살펴볼 것: 한 답변이 얼마나 ‘이야기’로 들리는가",
    date: "2026.06.21",
    readMinutes: "7분 읽기",
    summary: "등급은 어려운 단어의 개수보다 내용을 이어 가는 방식에서 갈립니다. 같은 질문을 세 단계로 확장하며, 목표 등급에 맞는 다음 연습을 정리했습니다.",
    image: gradeSpeakingPractice,
    imageAlt: "마이크 앞에서 답변을 연습하며 손으로 설명하는 학습자",
    takeaway: "한 단계 올라가는 핵심은 더 화려하게 말하는 것이 아니라, 상대가 장면을 따라올 수 있도록 한 번 더 구체화하는 것입니다.",
    disclaimer: "공식 채점 산식과 세부 기준은 공개되어 있지 않습니다. 아래 비교는 목표 등급별 학습 방향을 이해하기 위한 실전형 가이드이며, 특정 등급을 보장하지 않습니다.",
    sections: [
      {
        heading: "등급을 ‘문장 난이도’ 하나로 보면 놓치는 것",
        paragraphs: [
          "같은 문법을 써도 답변의 인상은 크게 다릅니다. 질문을 들은 뒤 핵심만 말하고 끝내면 정보는 전달되지만, 듣는 사람에게 장면이 남지는 않습니다. 반대로 배경을 깔고 구체적인 행동 하나를 보여 준 뒤 감정이나 결과를 덧붙이면, 복잡한 어휘가 많지 않아도 훨씬 안정적인 이야기로 들립니다.",
          "그래서 연습을 점검할 때는 ‘틀리지 않았나?’와 함께 ‘내가 왜 그 이야기를 꺼냈는지 들리는가?’를 물어야 합니다. 대답의 길이를 무작정 늘리는 것이 아니라, 질문에 직접 답한 뒤 한 장면을 더 보여 주는 것이 핵심입니다.",
        ],
      },
      {
        heading: "같은 질문을 세 번 확장해 보기",
        paragraphs: [
          "질문이 “Tell me about a place you like to visit.”라고 가정해 보겠습니다. 아래는 정답 예시가 아니라, 답변이 확장되는 방향을 보기 위한 비교입니다. 내 서베이 주제로 바꿔서 소리 내 읽어 보세요.",
        ],
        example: {
          title: "답변의 밀도 비교",
          lines: [
            "IM에 가까운 출발: “I like going to a park near my home. It is quiet and I go there on weekends.”",
            "IH를 향한 확장: “There is a small park near my home, and I usually go there on Sunday mornings. I walk slowly, buy a coffee on the way, and sit near the pond for a while.”",
            "AL을 향한 확장: “What I like about that park is not that it is famous—it is actually very ordinary. But after a busy week, the quiet path and the sound of people walking their dogs make me feel like my weekend has really started.”",
          ],
        },
      },
      {
        heading: "IM에서 IH로: ‘한 문장 더’의 정체",
        paragraphs: [
          "IM 단계에서 가장 먼저 할 일은 질문에 대한 직접 답을 또렷하게 만드는 것입니다. 장소·사람·활동 중 하나를 고르고, 언제 하는지와 이유까지 말해 보세요. 여기까지가 답의 골격입니다.",
          "IH를 목표로 한다면 그 골격 뒤에 관찰 가능한 디테일 하나를 붙입니다. ‘좋았다’ 대신 무엇이 좋았는지, ‘자주 간다’ 대신 언제 어떤 순서로 가는지를 말합니다. 듣는 사람에게 카메라 한 장면을 보여 주는 느낌으로 구체화하면 됩니다.",
        ],
        bullets: [
          "막연한 형용사 하나를 감각 정보 하나로 바꾸기: nice → quiet, sunny, crowded, familiar",
          "행동을 한 번만 더 이어 말하기: go there → walk there, order coffee, call a friend",
          "이유를 개인 경험으로 바꾸기: relaxing → it helps me slow down after work",
        ],
      },
      {
        heading: "IH에서 AL로: 완벽함보다 ‘관점’",
        paragraphs: [
          "AL을 목표로 할수록 문장을 끊김 없이 길게 끌기보다, 자신의 관점과 변화가 드러나는 이야기를 연습하는 편이 좋습니다. 예전과 지금을 비교하거나, 예상과 달랐던 순간을 넣거나, 말하다가 자연스럽게 덧붙이는 식입니다.",
          "작은 실수가 있어도 바로 회복하는 태도도 중요합니다. 단어가 생각나지 않으면 “I can’t remember the exact name, but it was a small local place”처럼 설명으로 우회하세요. 침묵보다 자연스러운 보완이 대화의 흐름을 살립니다.",
        ],
        note: {
          title: "연습의 기준을 바꾸기",
          text: "녹음을 들을 때 오류 개수만 세지 마세요. ‘배경-행동-의미’가 모두 들리는 답변이 몇 개인지 체크하면 다음 연습이 훨씬 선명해집니다.",
        },
      },
      {
        heading: "내 목표 등급에 맞는 15분 연습",
        paragraphs: [
          "IM 목표라면 질문 3개에 대해 30초짜리 직접 답을 만들고, IH 목표라면 그 답마다 구체적인 행동과 감정을 하나씩 보탭니다. AL 목표라면 같은 장면을 비교·문제·최근 변화 질문으로 각각 다시 시작해 보세요.",
          "모든 단계에서 공통으로 필요한 것은 녹음입니다. 말할 때는 괜찮았다고 느껴도, 재생하면 같은 시작 문장이나 긴 정적이 반복되는 경우가 많습니다. 한 번 들은 뒤에는 가장 큰 문제 한 가지만 정해 다음 녹음에서 고치세요.",
        ],
      },
    ],
  },
  {
    id: "oom-full-guide",
    category: "OOM 사용법",
    title: "OOM 100% 활용법: 스크립트에서 실전 답변까지",
    subtitle: "많이 보는 순서가 아니라, 내 답을 실제로 움직이게 만드는 훈련 순서",
    date: "2026.06.21",
    readMinutes: "8분 읽기",
    summary: "서베이 고정부터 실전 녹음까지 OOM의 다섯 단계를 하나의 루틴으로 연결합니다. 앱을 ‘읽는 곳’에서 ‘내 목소리를 고치는 곳’으로 쓰는 방법입니다.",
    image: oomStudyWorkflow,
    imageAlt: "말하기 계획을 색으로 나눈 노트와 녹음 화면을 함께 보는 학습자",
    takeaway: "OOM의 각 단계는 따로 끝내는 체크리스트가 아닙니다. 한 장면을 고르고, 바꿔 말하고, 녹음으로 확인하는 하나의 순환입니다.",
    sections: [
      {
        heading: "시작 전: 목표를 ‘등급’이 아니라 장면으로 적기",
        paragraphs: [
          "‘IH가 필요하다’는 목표는 중요하지만 오늘 무엇을 말할지까지 알려 주지는 않습니다. 첫날에는 서베이에서 고를 주제와, 그 주제에서 꺼낼 수 있는 실제 경험을 연결해 보세요. 예를 들어 운동을 골랐다면 ‘처음 수업에 갔던 날’ 혹은 ‘비 때문에 계획을 바꾼 주말’처럼 한 장면을 정합니다.",
          "장면을 정하면 필요한 어휘가 자연스럽게 좁혀집니다. 생활과 무관한 고급 표현을 쌓는 대신, 내가 실제로 아는 장소·사람·순서를 영어로 말할 수 있게 됩니다. 이 단계에서 솔직함은 전략입니다.",
        ],
      },
      {
        heading: "STEP 1·2: 선택을 고정하고 말의 길이를 정합니다",
        paragraphs: [
          "STEP 1에서는 실제 관심사와 가까운 선택지를 고정해 답변의 재료를 확보합니다. 남들이 많이 고르는 항목이 아니라, 내가 세부 묘사와 작은 사건을 만들 수 있는 항목이 좋은 선택입니다. 한 번 고른 뒤에는 주제를 자주 바꾸지 마세요.",
          "STEP 2에서는 목표 난이도에 맞춰 답변의 기본 길이와 확장 방식을 정합니다. 처음에는 45초로 편하게 말할 수 있는지를 확인하고, 익숙해지면 60~90초까지 확장하세요. 단어를 더 외우기 전 ‘배경-행동-감정’ 세 덩어리가 들어가는지부터 봅니다.",
        ],
        note: {
          title: "좋은 고정의 기준",
          text: "질문을 들었을 때 10초 안에 장소·사람·사건 중 하나가 떠오른다면, 그 주제는 이미 좋은 출발점입니다.",
        },
      },
      {
        heading: "STEP 3: 스크립트는 암기본이 아니라 블록입니다",
        paragraphs: [
          "스크립트 화면에서는 그룹마다 하나의 기본 스토리를 고릅니다. 여기서 중요한 것은 전부 외우는 일이 아니라, 같은 장면을 여는 문장·디테일·문제·마무리 블록으로 나눠 보는 것입니다. 질문이 바뀌면 전체 답을 버리는 대신 필요한 블록만 갈아 끼울 수 있습니다.",
          "처음에는 텍스트를 보고 소리 내 읽고, 다음에는 키워드만 보고 말해 보세요. 마지막에는 질문 변형 탭에서 첫 문장만 바꾼 뒤 나머지 장면으로 자연스럽게 이어 갑니다. 이 순서가 되면 ‘외운 티’가 빠르게 줄어듭니다.",
        ],
        example: {
          title: "블록 한 세트 만들기",
          description: "여행 장면을 예로 들면 다음 네 블록이면 충분합니다.",
          lines: [
            "Open: “One trip I still talk about is…”",
            "Detail: “The part I remember most clearly is…”",
            "Turn: “Things did not go exactly as planned because…”",
            "Close: “Looking back, that is why I would go there again.”",
          ],
        },
      },
      {
        heading: "STEP 4: 롤플레이는 예의 표현보다 문제 해결 순서",
        paragraphs: [
          "롤플레이에서 막히는 이유는 친절한 문장을 몰라서가 아니라, 어떤 정보를 먼저 물어야 할지 흐려지기 때문인 경우가 많습니다. OOM의 공식 흐름처럼 상황을 밝히고, 필요한 정보를 묻고, 대안을 요청하고, 마무리하는 순서를 입에 붙여 보세요.",
          "한 상황을 연습할 때는 부탁 문장 세 개를 외우는 대신, ‘내가 지금 원하는 것’과 ‘상대가 해 줄 수 있는 것’을 한국어로 먼저 한 줄씩 적어 보세요. 그 뒤에 영어 문장을 얹으면 문장 자체를 잊어도 요청의 목적을 잃지 않습니다.",
        ],
      },
      {
        heading: "STEP 5: 녹음은 평가가 아니라 다음 답의 설계도",
        paragraphs: [
          "실전 연습에서는 무작위 질문을 듣고, 완성되지 않은 답이라도 시간 안에 끝까지 말해 보세요. 녹음을 재생할 때는 발음·문법·내용을 한꺼번에 평가하지 않습니다. 첫 번째 재생에서는 멈춘 곳, 두 번째 재생에서는 반복한 단어 하나만 찾습니다.",
          "수정한 뒤 똑같은 질문을 다시 말하지 말고, 비슷한 다른 질문으로 옮겨 보세요. 그래야 방금 고친 연결어와 장면 블록이 실제로 이동 가능한지 확인할 수 있습니다. 이 작은 순환을 매일 한 번만 해도 학습이 ‘읽기’에서 ‘발화’로 넘어갑니다.",
        ],
      },
    ],
  },
  {
    id: "opic-filler-tips",
    category: "표현 클리닉",
    title: "필러는 시간을 버는 말이 아니라, 생각을 연결하는 말",
    subtitle: "‘um’ 대신 자연스럽게 다음 장면으로 넘어가는 영어식 호흡 만들기",
    date: "2026.06.21",
    readMinutes: "5분 읽기",
    summary: "필러를 많이 쓰는 것이 유창함은 아닙니다. 잠깐 생각하고, 방향을 바꾸고, 단어를 회복할 때 쓸 수 있는 표현을 상황별로 정리했습니다.",
    image: naturalConversation,
    imageAlt: "카페에서 친구에게 이야기를 이어 가며 손짓하는 사람",
    takeaway: "좋은 필러는 비어 있는 소리를 채우지 않습니다. 듣는 사람에게 ‘지금부터 어떤 이야기를 할지’를 알려 줍니다.",
    sections: [
      {
        heading: "필러와 군더더기는 다릅니다",
        paragraphs: [
          "말문이 막힐 때 ‘um’, ‘you know’를 반복하면 잠깐의 침묵은 가릴 수 있습니다. 하지만 질문마다 같은 소리가 길어지면 오히려 답의 중심이 흐려집니다. 필러는 습관적인 소음이 아니라, 생각을 정리하거나 관점을 바꾸는 신호로 써야 합니다.",
          "가장 자연스러운 필러는 문장 사이에 의미를 더합니다. 지금 떠올리는 중인지, 앞의 말을 정정하는지, 구체적인 예시로 들어갈 것인지를 알려 주는 표현을 고르면 말의 호흡이 살아납니다.",
        ],
      },
      {
        heading: "상황별로 하나씩만 골라 쓰세요",
        paragraphs: [
          "처음부터 열 개를 외우면 다음 문장을 찾느라 더 멈춥니다. 아래 다섯 역할에서 자기에게 잘 붙는 표현 하나씩만 고르고, 이번 주의 모든 녹음에 반복해 보세요.",
        ],
        bullets: [
          "생각할 때: “Let me think for a second.” — 짧게 말하고 바로 핵심으로 들어갑니다.",
          "관점을 바꿀 때: “Actually, when I think about it…” — 처음 답을 조금 더 정확하게 다듬을 때 좋습니다.",
          "이유를 덧붙일 때: “The thing is…” — 단순한 설명 뒤에 개인적인 이유를 붙입니다.",
          "기억을 회복할 때: “I can’t remember the exact name, but…” — 단어 하나가 막혀도 이야기를 끊지 않습니다.",
          "마무리로 돌아올 때: “Anyway, the point is…” — 곁가지 설명 뒤에 답의 핵심을 다시 잡습니다.",
        ],
      },
      {
        heading: "한 번의 자연스러운 수정이 더 강합니다",
        paragraphs: [
          "시험 답변은 원고 낭독이 아니라 즉석 대화에 가깝습니다. 그래서 말하다가 조금 더 정확한 표현을 찾았을 때, 짧게 방향을 고치는 모습은 오히려 자연스럽습니다. 다만 고친 뒤에는 같은 내용을 처음부터 반복하지 말고 다음 장면으로 넘어가야 합니다.",
        ],
        example: {
          title: "군더더기에서 연결로",
          description: "같은 내용을 더 자연스럽게 이어 보세요.",
          lines: [
            "반복: “Um, you know, it was, um, really nice and, you know, I liked it.”",
            "연결: “Actually, what I liked most was how quiet it was. I could finally slow down after a busy week.”",
            "단어 회복: “It was a small… I can’t remember the exact name, but it was a local bakery near the station.”",
          ],
        },
      },
      {
        heading: "필러를 넣어도 되지 않는 자리",
        paragraphs: [
          "첫 문장과 핵심 정보 앞에서는 짧고 직접적인 답이 더 좋습니다. 질문이 장소 소개라면 “Well, actually, you know…”로 길게 문을 열기보다 장소를 먼저 말하세요. 필러는 내용을 늦추는 장치가 아니라, 이미 시작한 이야기를 부드럽게 잇는 장치입니다.",
          "또한 한 답변에서 같은 표현을 두 번 이상 쓰지 않는 규칙을 정해 보세요. 반복이 보이면 다음 녹음에서는 그 자리를 침묵 1초 혹은 다른 연결어로 바꿉니다. 짧은 침묵은 생각보다 훨씬 자연스럽습니다.",
        ],
        note: {
          title: "5분 드릴",
          text: "아무 질문 하나를 고르고 45초간 답합니다. 두 번째 녹음에서는 필러를 딱 두 번만 쓰되, 각각 ‘관점 전환’과 ‘마무리 복귀’ 역할로만 사용하세요. 녹음을 비교하면 필러의 목적이 귀에 들리기 시작합니다.",
        },
      },
    ],
  },
  ...additionalStudyArticles,
];
