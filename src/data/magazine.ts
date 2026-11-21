const gradeSpeakingPractice = new URL("../assets/magazine/grade-speaking-practice.webp", import.meta.url).href;
const naturalConversation = new URL("../assets/magazine/natural-conversation.webp", import.meta.url).href;
const oomStudyWorkflow = new URL("../assets/magazine/oom-study-workflow.webp", import.meta.url).href;
const opic55DifficultyGuideCover = new URL("../assets/magazine/opic-55-difficulty-guide-cover.jpg", import.meta.url).href;
const opicAnswerChecklistCover = new URL("../assets/magazine/opic-answer-checklist-cover.jpg", import.meta.url).href;
const opic40MinutePacingPlanCover = new URL("../assets/magazine/opic-40-minute-pacing-plan-cover.jpg", import.meta.url).href;
const opicCampingWeatherProblemSolutionCover = new URL("../assets/magazine/opic-camping-weather-problem-solution-cover.jpg", import.meta.url).href;
const opicHomeTopicScriptGuideCover = new URL("../assets/magazine/opic-home-topic-script-guide-cover.jpg", import.meta.url).href;
const opicHolisticAssessmentChecklistCover = new URL("../assets/magazine/opic-holistic-assessment-checklist-cover.jpg", import.meta.url).href;
const opicImToIhPracticePlanCover = new URL("../assets/magazine/opic-im-to-ih-practice-plan-cover.jpg", import.meta.url).href;
const opicIndoorTopicGuideCover = new URL("../assets/magazine/opic-indoor-topic-guide-cover.jpg", import.meta.url).href;
const opicLastWeekStudyPlanCover = new URL("../assets/magazine/opic-last-week-study-plan-cover.jpg", import.meta.url).href;
const opicMovieMusicPerformanceStoryMapCover = new URL("../assets/magazine/opic-movie-music-performance-story-map-cover.jpg", import.meta.url).href;
const opicMuseumPhotoReadingGuideCover = new URL("../assets/magazine/opic-museum-photo-reading-guide-cover.jpg", import.meta.url).href;
const opicParkWalkingHikingAnswerMapCover = new URL("../assets/magazine/opic-park-walking-hiking-answer-map-cover.jpg", import.meta.url).href;
const opicPronunciationComprehensibilityGuideCover = new URL("../assets/magazine/opic-pronunciation-comprehensibility-guide-cover.jpg", import.meta.url).href;
const opicQuestionTypeDecoderCover = new URL("../assets/magazine/opic-question-type-decoder-cover.jpg", import.meta.url).href;
const opicRecordingReviewRoutineCover = new URL("../assets/magazine/opic-recording-review-routine-cover.jpg", import.meta.url).href;
const opicRoleplay6StepTemplateCover = new URL("../assets/magazine/opic-roleplay-6-step-template-cover.jpg", import.meta.url).href;
const opicSecondDifficultyChoiceCover = new URL("../assets/magazine/opic-second-difficulty-choice-cover.jpg", import.meta.url).href;
const opicSelfAssessmentSelectionGuideCover = new URL("../assets/magazine/opic-self-assessment-selection-guide-cover.jpg", import.meta.url).href;
const opicShoppingExchangeRoleplayCover = new URL("../assets/magazine/opic-shopping-exchange-roleplay-cover.jpg", import.meta.url).href;
const opicSurveyChoiceGuideCover = new URL("../assets/magazine/opic-survey-choice-guide-cover.jpg", import.meta.url).href;
const opicTextTypeUpgradeDrillCover = new URL("../assets/magazine/opic-text-type-upgrade-drill-cover.jpg", import.meta.url).href;
const opicTimeFrameStorylineGuideCover = new URL("../assets/magazine/opic-time-frame-storyline-guide-cover.jpg", import.meta.url).href;
const opicTravelTopicScriptGuideCover = new URL("../assets/magazine/opic-travel-topic-script-guide-cover.jpg", import.meta.url).href;
const opicTwoListensMemoryGridCover = new URL("../assets/magazine/opic-two-listens-memory-grid-cover.jpg", import.meta.url).href;
const opicWordRecoveryCircumlocutionCover = new URL("../assets/magazine/opic-word-recovery-circumlocution-cover.jpg", import.meta.url).href;
const selfIntroductionCover = new URL("../assets/magazine/self-introduction-cover.jpg", import.meta.url).href;
const selfIntroductionWarmup = new URL("../assets/magazine/self-introduction-warmup.jpg", import.meta.url).href;
const strategyStoryPractice = new URL("../assets/magazine/strategy-story-practice.webp", import.meta.url).href;
const opicActualExamScreenUiGuideCover = new URL("../assets/magazine/opic-actual-exam-screen-ui-guide-cover.jpg", import.meta.url).href;
const opic2026Survey12ItemsStrategyCover = new URL("../assets/magazine/opic-2026-survey-12-items-strategy-cover.jpg", import.meta.url).href;
const opicSmartGlassesExamSecurityRulesCover = new URL("../assets/magazine/opic-smart-glasses-exam-security-rules-cover.jpg", import.meta.url).href;
const actflOpicAiScoringSystemAnalysisCover = new URL("../assets/magazine/actfl-opic-ai-scoring-system-analysis-cover.jpg", import.meta.url).href;
const generativeAiChatgptGeminiOpicStudyGuideCover = new URL("../assets/magazine/generative-ai-chatgpt-gemini-opic-study-guide-cover.jpg", import.meta.url).href;

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
  publishedAt: string;
  modifiedAt: string;
  author: string;
  reviewer: string;
  creationNote: string;
  sources: { label: string; href: string }[];
  summary: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  takeaway: string;
  disclaimer?: string;
  sections: MagazineArticleSection[];
};

type MagazineArticleDraft = Omit<MagazineArticle, "publishedAt" | "modifiedAt" | "author" | "reviewer" | "creationNote" | "sources"> &
  Partial<Pick<MagazineArticle, "publishedAt" | "modifiedAt" | "creationNote" | "sources">>;

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
  modifiedAt?: string;
  creationNote?: string;
  sources?: MagazineArticle["sources"];
};

const studyArticleDetails: Record<string, { image: string; imageAlt: string; imagePosition?: string; sections: MagazineArticleSection[] }> = {
  "opic-survey-choice-guide": {
    image: opicSurveyChoiceGuideCover,
    imageAlt: "일상 장면 사진을 말할 수 있는 소재와 제외할 소재로 나누는 학습자",
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
    imageAlt: "마이크 앞에서 짧고 긴 답변 파형과 카페 장면 단서를 비교하는 학습자",
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
    imageAlt: "예약 변경 전화를 하며 핵심 카드 세 장과 선택 카드를 구분하는 학습자",
    sections: [
      {
        heading: "롤플레이는 친절한 문장 암기가 아니다",
        paragraphs: [
          "롤플레이를 준비할 때 가장 먼저 외우는 말은 보통 'Could you...'입니다. 물론 필요한 표현이지만, 그 문장만 많아지면 정작 무엇을 요청하는지 흐려집니다.",
          "롤플레이 답변은 작은 전화 한 통처럼 생각하는 편이 쉽습니다. 왜 연락했는지, 무엇을 원하는지, 다음에 무엇을 할지를 먼저 말하고 필요한 정보·대안·마무리를 상황에 따라 고릅니다.",
        ],
      },
      {
        heading: "CORE 3개와 OPTIONAL 3개의 유연한 메뉴",
        paragraphs: [
          "여섯 기능은 매번 전부 말하는 고정 순서가 아닙니다. 문제·목적, 질문·요청, 다음 행동은 CORE로 유지하고, 정보 확인, 대안 제시, 감사·마무리는 상황에 필요한 만큼만 선택합니다.",
          "중요한 것은 단계 이름을 외우는 일이 아니라 상대가 도울 수 있도록 핵심 기능을 빠뜨리지 않는 것입니다. 이미 확인한 정보를 다시 묻기보다 아직 결정되지 않은 기능을 고르세요.",
        ],
        bullets: ["CORE · 문제 또는 연락 목적", "CORE · 필요한 질문 또는 요청", "CORE · 내가 취할 다음 행동", "OPTIONAL · 추가 정보 확인", "OPTIONAL · 가능한 대안 제시", "OPTIONAL · 감사 또는 대화 마무리"],
      },
      {
        heading: "예약 변경 상황으로 연습하기",
        paragraphs: [
          "여행 예약이나 수업 예약은 CORE를 세운 뒤 OPTIONAL을 고르기 좋은 소재입니다. 날짜와 시간이 있어 정보 질문이 자연스럽고, 필요한 경우 대안 요청도 분명하게 만들 수 있습니다.",
          "아래 예시는 시험용 정답이 아니라 기능 선택을 보는 예시입니다. 실제 연습에서는 명사만 기계적으로 바꾸지 말고 상황에 맞는 문제와 다음 행동을 함께 바꾸세요.",
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
        heading: "말이 막히면 빠진 CORE부터 확인한다",
        paragraphs: [
          "롤플레이에서 멈추는 이유는 영어 표현을 몰라서만은 아닙니다. 문제, 요청, 다음 행동 중 무엇이 빠졌는지 정하지 않은 상태에서 정중한 문장을 더 찾기 때문에 멈추기도 합니다.",
          "연습할 때는 영어로 말하기 전 한국어로 '예약 변경 요청', '가능한 시간 확인', '오늘 다시 연락'처럼 기능을 먼저 적어 보세요. CORE가 보이면 OPTIONAL은 하나만 골라도 답변이 이어집니다.",
        ],
      },
      {
        heading: "공식 페이지와 연결하기",
        paragraphs: [
          "오픽온미의 롤플레이 공식 페이지에서는 여섯 기능 메뉴를 Course별 상황 카드로 다시 연습할 수 있습니다. CORE를 먼저 익히고 현재 Course의 시나리오에서 필요한 OPTIONAL만 골라 보세요.",
          "처음에는 친절한 표현을 늘리기보다 문제·목적, 질문·요청, 다음 행동 세 문장을 안정시키는 데 집중하세요.",
        ],
      },
    ],
  },
  "opic-recording-review-routine": {
    image: opicRecordingReviewRoutineCover,
    imageAlt: "헤드폰으로 녹음 파형을 듣고 끊긴 한 지점만 표시하는 학습자",
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
    imageAlt: "해 질 무렵 집 창가의 작은 책상에서 계획을 적는 학습자",
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
    imageAlt: "갑작스러운 비를 피해 해변 카페에서 여행 계획을 바꾼 학습자",
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
    imageAlt: "퇴근 뒤 조용한 카페 창가 자리에서 노트를 정리하는 학습자",
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
    imageAlt: "짧은 녹음 파형을 행동과 이유, 느낌이 있는 긴 답변으로 확장하는 학습자",
    imagePosition: "center 54%",
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
    imageAlt: "7칸 주간 계획표에 익숙한 장면과 질문 카드만 배치하는 학습자",
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
    imageAlt: "녹음 파형의 멈춘 지점과 네 가지 답변 확인 토큰을 점검하는 장면",
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

function makeStudyArticle(input: StudyArticleInput): MagazineArticleDraft {
  const detail = studyArticleDetails[input.id];

  return {
    id: input.id,
    category: "OPIc 훈련 가이드",
    title: input.title,
    subtitle: input.subtitle,
    date: "2026.07.12",
    readMinutes: "7분 읽기",
    summary: input.summary,
    image: detail.image,
    imageAlt: detail.imageAlt,
    imagePosition: detail.imagePosition,
    takeaway: input.takeaway,
    disclaimer: "이 글은 OPIc 말하기를 준비하는 학습자를 위한 연습용 참고 자료입니다. 공식 시험기관의 보증이나 특정 등급 취득을 의미하지 않습니다.",
    sections: detail.sections,
    modifiedAt: input.modifiedAt,
    creationNote: input.creationNote,
    sources: input.sources,
  };
}

const additionalStudyArticles: MagazineArticleDraft[] = [
  makeStudyArticle(
    {
      id: "opic-survey-choice-guide",
      title: "OPIc 서베이 선택, 답변 범위를 좁히는 기준",
      subtitle: "많이 고르는 선택지가 아니라 내가 바로 말할 수 있는 장면을 기준으로 서베이를 정리하는 방법입니다.",
      summary: "OPIc 서베이는 관심사 목록처럼 보이지만 연습에서는 답변 소재를 줄이는 장치로 써야 합니다. 오픽온미의 고정 서베이를 활용해 말할 범위를 좁히는 기준을 정리했습니다.",
      takeaway: "좋은 서베이 선택은 멋진 취미가 아니라 10초 안에 장소, 행동, 감정이 떠오르는 선택입니다.",
      modifiedAt: "2026-10-09",
      focus: "서베이 선택",
      scene: "자주 가는 장소나 반복하는 활동",
      routine: "내가 실제로 말할 수 있는 선택지 5-7개",
      checklist: ["10초 안에 경험 하나가 떠오른다", "장소와 행동을 함께 말할 수 있다", "최근 변화나 문제 상황으로 확장할 수 있다"],
      example: ["I usually choose topics that are close to my real routine.", "For example, walking and cafes are easy for me because I can describe a real place.", "That way, I do not need to invent a new story during the test."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-55-difficulty-guide",
      title: "오픽 난이도 5-5, 누구에게 맞고 어떻게 연습할까",
      subtitle: "난이도 5-5를 어려운 단어의 문제가 아니라 답변 길이와 구체성의 기준으로 이해하는 가이드입니다.",
      summary: "5-5 연습은 긴 답변을 무조건 만들기 위한 단계가 아닙니다. 한 장면을 60-90초로 설명하고 이유와 변화를 붙이는 기준으로 활용해야 합니다.",
      takeaway: "난이도 5-5는 말할 내용을 크게 만드는 설정이 아니라 답변 안의 장면을 더 구체적으로 만드는 연습 기준입니다.",
      modifiedAt: "2026-10-09",
      focus: "난이도 5-5",
      scene: "60-90초로 설명할 수 있는 생활 장면",
      routine: "장소, 행동, 이유, 변화가 들어간 답변 길이",
      checklist: ["답변 시작 전에 장면 하나를 정한다", "구체적 행동을 한 문장 이상 넣는다", "마지막에 느낌이나 변화로 닫는다"],
      example: ["I would choose level 5-5 as a practice target because it pushes me to explain more clearly.", "Instead of using difficult words, I try to add a specific action and a reason.", "That makes my answer easier to follow."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-roleplay-6-step-template",
      title: "롤플레이 CORE 3 + OPTIONAL 3 기능 메뉴",
      subtitle: "문제·목적, 질문·요청, 다음 행동을 중심에 두고 필요한 기능만 유연하게 고르는 OPIc 롤플레이 뼈대입니다.",
      summary: "롤플레이는 여섯 문장을 고정 순서로 외우는 훈련이 아닙니다. CORE 세 기능을 먼저 수행하고 정보 확인, 대안, 마무리 중 필요한 OPTIONAL만 선택하는 방법을 정리했습니다.",
      takeaway: "롤플레이 답변은 여섯 칸을 모두 채우는 공식이 아니라 상대가 문제와 요청, 다음 행동을 이해하도록 기능을 고르는 메뉴입니다.",
      focus: "롤플레이 CORE/OPTIONAL 기능",
      scene: "예약 변경이나 서비스 문제 상황",
      routine: "CORE 세 기능을 먼저 말하고 필요한 OPTIONAL만 선택",
      checklist: ["문제 또는 목적을 한 문장으로 말한다", "필요한 질문이나 요청을 분명히 한다", "내가 취할 다음 행동을 말한다"],
      example: ["I'm calling because I have a problem with my reservation.", "Could you check if I can change it to tomorrow afternoon?", "If that is not possible, please let me know another available time."],
      modifiedAt: "2026-10-09",
      creationNote: "ACTFL OPIc의 질문·요청 기능을 확인하고, 오픽온미의 CORE 3 + OPTIONAL 3 유연 메뉴 계약에 맞춰 수정했습니다.",
      sources: [
        {
          label: "ACTFL OPIc 공식 안내와 평가 요소",
          href: "https://www.actfl.org/assessments/postsecondary-assessments/oral-proficiency-interview-computer-opic",
        },
        {
          label: "ACTFL Proficiency Guidelines 2024",
          href: "https://www.actfl.org/uploads/files/general/Resources-Publications/ACTFL_Proficiency_Guidelines_2024.pdf",
        },
      ],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-recording-review-routine",
      title: "녹음으로 답변을 고치는 10분 루틴",
      subtitle: "녹음 후 모든 실수를 고치려 하지 않고 다음 답변으로 이어지는 수정 포인트만 찾는 연습법입니다.",
      summary: "녹음 복습은 평가가 아니라 다음 답변을 설계하는 과정입니다. 10분 안에 질문, 녹음, 표시, 재녹음을 끝내는 실전 루틴을 소개합니다.",
      takeaway: "녹음 복습의 목표는 완벽한 파일이 아니라 다음 질문에서 바로 써먹을 수정 포인트 하나를 찾는 것입니다.",
      modifiedAt: "2026-10-09",
      focus: "녹음 복습",
      scene: "실전 연습 화면에서 말한 60초 답변",
      routine: "질문 선택, 첫 녹음, 끊긴 지점 표시, 수정 녹음",
      checklist: ["첫 문장이 질문에 직접 답한다", "중간에 같은 단어가 반복되지 않는다", "마지막 문장이 자연스럽게 닫힌다"],
      example: ["First, I record my answer without stopping.", "Then I listen once and mark only one weak point.", "Finally, I record the same answer again with a clearer opening."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-home-topic-script-guide",
      title: "집/거주지 주제 답변을 하나의 장면으로 만드는 법",
      subtitle: "평범한 집 이야기를 위치, 루틴, 변화, 문제 해결로 확장하는 스크립트 가이드입니다.",
      summary: "집 주제는 특별한 사건보다 익숙한 공간을 구체적으로 말하는 힘이 중요합니다. 한 공간을 골라 여러 질문으로 바꾸는 방법을 설명합니다.",
      takeaway: "집 답변은 멋진 집 소개가 아니라 내가 자주 머무는 공간과 반복 행동을 보여 주는 장면입니다.",
      modifiedAt: "2026-10-09",
      focus: "집/거주지 주제",
      scene: "책상, 창문, 방 구조, 동네 길 같은 익숙한 공간",
      routine: "공간 하나와 반복 행동 하나",
      checklist: ["공간 이름을 정한다", "언제 그곳에 머무는지 말한다", "최근 변화나 불편한 문제를 붙인다"],
      example: ["My favorite part of my home is my desk near the window.", "I usually sit there after work and write down my plan for the next day.", "It is a small space, but it helps me feel calm."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-travel-topic-script-guide",
      title: "여행 주제를 묘사·비교·문제해결로 확장하는 법",
      subtitle: "하나의 여행 장면을 여러 질문 유형으로 바꾸는 OPIc 스크립트 훈련법입니다.",
      summary: "여행 글을 많이 외우는 대신 한 번의 여행 장면을 묘사, 비교, 문제 해결 질문으로 변형하는 연습이 필요합니다.",
      takeaway: "여행 주제는 장소명보다 계획, 예상과 다른 일, 해결 과정이 있어야 여러 질문에 버팁니다.",
      modifiedAt: "2026-10-09",
      focus: "여행 주제",
      scene: "짧은 여행이나 당일치기 경험",
      routine: "출발 이유, 장소 묘사, 예상과 다른 일, 마무리 감정",
      checklist: ["왜 갔는지 말한다", "예상과 달랐던 일을 넣는다", "문제를 어떻게 바꾸었는지 설명한다"],
      example: ["I still remember a short beach trip I took last spring.", "We planned to walk outside, but the weather changed suddenly.", "So we found a small cafe, and that actually made the trip more relaxing."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-indoor-topic-guide",
      title: "카페·집·실내활동 답변 소재 만드는 법",
      subtitle: "실내 주제를 감각 묘사와 루틴으로 바꿔 말하는 오픽온미식 답변 설계입니다.",
      summary: "실내활동은 평범해 보이지만 소리, 조명, 좌석, 시간대 같은 단서를 넣으면 충분히 구체적인 답변 소재가 됩니다.",
      takeaway: "실내 주제는 장소의 화려함보다 내가 그곳에서 반복하는 행동과 느끼는 안정감이 핵심입니다.",
      modifiedAt: "2026-10-09",
      focus: "실내활동 주제",
      scene: "카페, 방, 영화관, 음악 듣는 공간",
      routine: "장소 감각, 반복 행동, 쉬는 이유",
      checklist: ["시간대를 정한다", "감각 단서 하나를 넣는다", "내가 쉬는 이유를 말한다"],
      example: ["There is a quiet cafe near my office.", "I usually go there in the afternoon, order coffee, and check my notes.", "The soft music helps me slow down before going home."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-im-to-ih-practice-plan",
      title: "IM에서 IH로 올릴 때 바꿔야 할 답변 습관",
      subtitle: "짧은 직접 답변에서 장면 중심 답변으로 넘어가기 위한 연습 계획입니다.",
      summary: "IM에서 IH를 목표로 할 때는 어려운 단어보다 답변 안의 정보 밀도와 연결 방식이 중요합니다. 짧은 답변을 장면으로 확장하는 습관을 정리했습니다.",
      takeaway: "IH를 목표로 할수록 답변은 더 어려워지는 것이 아니라 더 선명해져야 합니다.",
      modifiedAt: "2026-10-09",
      focus: "IM에서 IH로 가는 연습",
      scene: "짧은 답변을 60초 장면으로 확장하는 과정",
      routine: "직접 답변, 구체적 행동, 이유, 감정 추가",
      checklist: ["한 문장 답변에서 멈추지 않는다", "행동을 하나 더 붙인다", "개인적인 이유로 마무리한다"],
      example: ["I like walking in my neighborhood.", "I usually walk after dinner because the streets are quiet.", "That small routine helps me clear my head after a long day."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-last-week-study-plan",
      title: "시험 일주일 전 OPIc 학습 플랜",
      subtitle: "새 자료를 늘리기보다 기존 장면을 정리하고 녹음 루틴을 유지하는 마지막 주 계획입니다.",
      summary: "시험 일주일 전에는 새 스크립트를 많이 추가하기보다 이미 고른 장면을 짧게 말하고 다시 녹음하는 루틴이 필요합니다.",
      takeaway: "마지막 주의 목표는 더 많이 아는 것이 아니라 이미 아는 장면을 시험장에서 바로 꺼내는 것입니다.",
      modifiedAt: "2026-10-09",
      focus: "시험 일주일 전 계획",
      scene: "이미 준비한 서베이와 스크립트 장면",
      routine: "하루 2개 질문 녹음과 한 가지 수정",
      checklist: ["새 주제 추가를 줄인다", "기존 장면을 45초와 90초로 말한다", "롤플레이 공식만 짧게 반복한다"],
      example: ["During the last week, I try not to add too many new topics.", "Instead, I record the same story in different lengths.", "That helps me stay calm when the question changes."],
    },
  ),
  makeStudyArticle(
    {
      id: "opic-answer-checklist",
      title: "답변 녹음 후 확인할 체크리스트",
      subtitle: "OPIc 답변을 들은 뒤 무엇부터 고쳐야 할지 정리하는 실전 점검표입니다.",
      summary: "녹음 후에는 모든 오류를 찾기보다 질문 대응, 장면 선명도, 연결, 마무리 순서로 확인해야 합니다. 실전 연습과 바로 연결되는 체크리스트를 제공합니다.",
      takeaway: "좋은 체크리스트는 실수를 많이 찾는 표가 아니라 다음 녹음에서 하나를 고치게 만드는 표입니다.",
      modifiedAt: "2026-10-09",
      focus: "답변 녹음 체크리스트",
      scene: "실전 연습에서 저장한 답변 녹음",
      routine: "질문 대응, 장면, 연결어, 마무리 점검",
      checklist: ["질문에 직접 답했다", "장소나 행동이 눈에 보인다", "중간에 멈춘 이유를 표시했다", "마지막 문장이 닫혔다"],
      example: ["After recording, I first check if I answered the question directly.", "Then I listen for one missing detail, not every grammar mistake.", "For the next try, I only fix that one point."],
    },
  ),
];

const magazineArticleDrafts: MagazineArticleDraft[] = [
  {
    id: "opic-self-introduction-strategy",
    category: "시험 전략",
    title: "OPIc 자기소개, 꼭 해야 할까? 대충 해도 될까?",
    subtitle: "점수용 답변처럼 길게 외우기보다, 첫 목소리를 안정시키는 짧은 워밍업으로 쓰는 편이 현실적입니다.",
    date: "2026.06.26",
    readMinutes: "6분 읽기",
    modifiedAt: "2026-10-09",
    summary: "ACTFL OPIc Familiarization Guide는 첫 자기소개를 본시험 전 warm-up이며 비채점이라고 설명합니다. OOM은 이 공식 사실과 별개로 첫 목소리와 호흡을 확인하는 20~30초 연습을 권장합니다.",
    image: selfIntroductionCover,
    imageAlt: "헤드셋을 끼고 노트에 자기소개 답변을 정리하는 학습자",
    takeaway: "공식적으로 비채점 warm-up이라는 사실과 OOM의 20~30초 연습 권장을 구분하세요. 길게 외우지 않고 첫 목소리와 호흡만 확인하면 됩니다.",
    disclaimer: "ACTFL 공식 가이드의 비채점 warm-up 설명과 OOM의 연습 권장은 서로 다른 정보입니다. 20~30초는 공식 제한이나 채점 기준이 아니며 특정 등급을 보장하지 않습니다.",
    creationNote: "ACTFL OPIc Familiarization Guide의 자기소개 warm-up·비채점 설명과 한국 OPIc 공식 진행 안내를 확인하고, OOM의 20~30초 연습 권장과 명확히 분리해 수정했습니다.",
    sources: [
      {
        label: "ACTFL OPIc Familiarization Guide 2024",
        href: "https://www.actfl.org/uploads/files/general/OPIc_Familiarization_Guide.pdf",
      },
      {
        label: "OPIc 공식 시험소개·진행프로세스",
        href: "https://www.opic.or.kr/opics/servlet/controller.opic.site.about.AboutServlet?p_process=move-introduce-opic",
      },
    ],
    sections: [
      {
        heading: "공식 사실과 OOM 연습 권장을 분리하기",
        paragraphs: [
          "ACTFL OPIc Familiarization Guide는 시험 시작의 자기소개를 언어 사용을 시작하고 아바타와 상호작용하는 warm-up으로 설명하며, 이 활동은 평가되지 않는다고 명시합니다. 따라서 자기소개를 점수를 얻는 별도 답안처럼 길게 준비할 근거는 없습니다.",
          "OOM이 제안하는 20~30초는 공식 시험 제한이나 채점 기준이 아닙니다. 짧고 쉬운 문장으로 첫 목소리, 속도, 호흡을 확인한 뒤 본 질문으로 넘어가기 위한 연습 권장입니다.",
          "두 정보를 섞지 않으면 준비 목표가 단순해집니다. 비채점 warm-up이라는 사실은 과도한 암기를 줄이는 근거로 쓰고, 짧은 OOM 연습은 긴장을 낮추고 말하기 리듬을 찾는 선택 도구로만 사용하세요.",
        ],
        note: {
          title: "OOM 관점",
          text: "20~30초는 OOM 연습 권장일 뿐 공식 시간이 아닙니다. 자기소개를 메인 답변 리허설로 만들지 말고 목소리, 속도, 호흡을 한 번 맞추는 시작 버튼으로 사용합니다.",
        },
      },
      {
        heading: "OOM 연습에서는 어디까지 준비할까",
        paragraphs: [
          "OOM의 연습 권장은 20~30초입니다. 이름, 직업, 학교, 가족관계처럼 개인정보를 자세히 나열하기보다 내가 어떤 일상을 가진 사람인지 가볍게 말하면 충분합니다. 예를 들어 일하거나 공부하는 상황, 요즘 관심 있는 활동, 조금 긴장된다는 자연스러운 한마디 정도면 됩니다.",
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
          "비채점 warm-up이라는 말은 아무 말이나 하거나 침묵해도 된다는 뜻으로 사용할 필요가 없습니다. 핵심은 힘을 빼되 내가 말하기 리듬을 찾을 만큼의 짧은 흐름을 갖추는 것입니다.",
          "쉬운 문장을 또렷하게 말하고 다음 질문으로 넘어갈 호흡을 남겨 두세요. 어려운 단어를 넣기보다 평소 내 말투에 가까운 표현을 고르는 것이 OOM 연습 목적에 맞습니다.",
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
          text: "비채점이라는 공식 사실을 기억하되, OOM 연습에서는 길게 외운 답안이 아닌 짧은 예열문으로 첫 목소리와 호흡만 준비합니다.",
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
    modifiedAt: "2026-10-09",
    summary: "목표·코스 설정부터 실전 녹음까지 OOM의 여섯 단계를 하나의 루틴으로 연결합니다. 앱을 ‘읽는 곳’에서 ‘내 목소리를 고치는 곳’으로 쓰는 방법입니다.",
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
        heading: "STEP 1~3: 목표·서베이·난이도를 고정합니다",
        paragraphs: [
          "STEP 1에서는 목표 구간과 Course를 선택하고, STEP 2에서는 해당 Course의 추천 서베이를 익혀 답변 재료를 좁힙니다. 남들이 많이 고르는 항목보다 내가 세부 묘사와 작은 사건을 만들 수 있는 항목을 우선하세요.",
          "STEP 3에서는 선택한 Level이 제시하는 답변 밀도와 목표 시간을 확인합니다. 단어를 더 외우기 전에 현재 답변에 배경·행동·감정이 들어가는지 보고, 같은 장면을 Level에 맞는 길이로 조절하세요.",
        ],
        note: {
          title: "좋은 고정의 기준",
          text: "질문을 들었을 때 10초 안에 장소·사람·사건 중 하나가 떠오른다면, 그 주제는 이미 좋은 출발점입니다.",
        },
      },
      {
        heading: "STEP 4: 스크립트는 암기본이 아니라 블록입니다",
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
        heading: "STEP 5: 롤플레이는 예의 표현보다 문제 해결 기능",
        paragraphs: [
          "롤플레이에서 막히는 이유는 친절한 문장을 몰라서가 아니라, 지금 필요한 기능을 고르지 못하기 때문인 경우가 많습니다. 문제·목적, 질문·요청, 다음 행동의 CORE를 먼저 말하고 상황에 필요한 OPTIONAL 기능만 더하세요.",
          "한 상황을 연습할 때는 부탁 문장 세 개를 외우는 대신, ‘내가 지금 원하는 것’과 ‘상대가 해 줄 수 있는 것’을 한국어로 먼저 한 줄씩 적어 보세요. 그 뒤에 영어 문장을 얹으면 문장 자체를 잊어도 요청의 목적을 잃지 않습니다.",
        ],
      },
      {
        heading: "STEP 6: 녹음은 평가가 아니라 다음 답의 설계도",
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

const batchPublishedArticleIds = new Set(additionalStudyArticles.map((article) => article.id));

const magazineSources = {
  opicOverview: {
    label: "OPIc 공식 시험소개·진행프로세스",
    href: "https://www.opic.or.kr/opics/servlet/controller.opic.site.about.AboutServlet?p_process=move-introduce-opic",
  },
  opicCandidateGuide: {
    label: "OPIc 공식 수험자 가이드",
    href: "https://www.opic.or.kr/opics/servlet/controller.opic.site.guide.GuideServlet?p_process=move-exam-guide",
  },
  opicCandidateNotice: {
    label: "OPIc 공식 응시자 유의사항",
    href: "https://www.opic.or.kr/opics/servlet/controller.opic.site.exam.LoginExamServlet",
  },
  actflOpic: {
    label: "ACTFL OPIc 공식 안내와 평가 요소",
    href: "https://www.actfl.org/assessments/postsecondary-assessments/oral-proficiency-interview-computer-opic",
  },
  actflFamiliarization: {
    label: "ACTFL OPIc Familiarization Guide 2024",
    href: "https://www.actfl.org/uploads/files/general/OPIc_Familiarization_Guide.pdf",
  },
  actflGuidelines: {
    label: "ACTFL Proficiency Guidelines 2024",
    href: "https://www.actfl.org/uploads/files/general/Resources-Publications/ACTFL_Proficiency_Guidelines_2024.pdf",
  },
  actflTestTakerTips: {
    label: "ACTFL OPI·OPIc 수험자 공식 준비 조언",
    href: "https://www.actfl.org/assessments/postsecondary-assessments/opi/tips-for-opi-and-opic-test-takers",
  },
} as const;

const officialArticleSources = [magazineSources.opicCandidateGuide, magazineSources.actflGuidelines];

const assessmentMagazineArticles: MagazineArticleDraft[] = [
  {
    id: "opic-self-assessment-selection-guide",
    category: "시험 구조",
    title: "OPIc Self Assessment, 높은 단계를 고르는 시험이 아닌 이유",
    subtitle: "목표 등급이 아니라 지금 혼자서 일관되게 할 수 있는 발화 기능을 근거로 선택하는 판단표입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "7분 읽기",
    summary: "Self Assessment는 원하는 결과를 입력하는 칸이 아니라 개인에게 맞는 시험 구성을 정하는 단계입니다. 실제 녹음 세 개에서 반복해서 확인되는 능력을 기준으로 선택하는 방법을 정리했습니다.",
    image: opicSelfAssessmentSelectionGuideCover,
    imageAlt: "스마트폰의 세 녹음 파형을 비교하며 Self Assessment 근거를 점검하는 학습자",
    takeaway: "가장 높은 설명이 아니라, 도움 없이 여러 주제에서 반복해서 보여 줄 수 있는 설명을 고르는 것이 Self Assessment의 출발점입니다.",
    disclaimer: "한국 OPIc의 실제 선택 문구와 화면은 응시 시점의 공식 안내를 따르세요. 이 글의 판단표는 선택을 대신하거나 특정 등급을 보장하지 않는 OOM 연습 도구입니다.",
    creationNote: "한국 OPIc 진행프로세스와 ACTFL OPIc Familiarization Guide의 Self Assessment 설명을 대조하고, 선택 근거표와 예시는 OOM 학습용으로 구성했습니다.",
    sources: [magazineSources.opicOverview, magazineSources.actflFamiliarization],
    sections: [
      {
        heading: "Self Assessment가 실제로 정하는 것",
        paragraphs: [
          "공식 안내에서 Self Assessment는 응시자가 자신의 현재 말하기 능력과 가장 가까운 설명을 고르는 단계입니다. 이 선택은 개인에게 제시될 시험의 수준과 구성에 영향을 주지만, 원하는 성적을 미리 신청하거나 점수를 예약하는 기능은 아닙니다.",
          "따라서 목표가 AL이라고 해서 가장 높은 설명을 자동으로 고르는 방식은 근거가 약합니다. 익숙한 한 주제에서 외운 답을 길게 말한 경험보다, 낯선 질문에서도 혼자 설명하고 묻고 사건을 이어 갈 수 있는지가 더 중요한 선택 자료입니다.",
        ],
      },
      {
        heading: "세 개의 녹음으로 현재 능력 찾기",
        paragraphs: [
          "설명형, 과거 경험형, 문제 해결형 질문을 하나씩 골라 준비 시간 없이 녹음하세요. 각 녹음에서 질문에 직접 답했는지, 문장을 연결했는지, 시간 흐름을 유지했는지, 필요한 질문이나 요청을 만들었는지를 같은 표로 확인합니다.",
          "한 녹음에서만 성공한 기능은 아직 안정적인 능력으로 보기 어렵습니다. 세 녹음 중 두 개 이상에서 도움 없이 반복된 기능에 표시하면, 기분이나 목표가 아니라 실제 발화 증거로 선택 범위를 좁힐 수 있습니다.",
        ],
        bullets: [
          "설명형: 장소나 대상을 소개한 뒤 구체적 행동을 두 문장 이상 연결했다",
          "과거 경험형: 사건의 시작·변화·결과가 시간 순서로 들렸다",
          "문제 해결형: 문제와 원하는 조치를 밝히고 상대에게 필요한 질문을 했다",
          "공통: 막힌 뒤에도 다른 표현으로 뜻을 이어 갔다",
        ],
      },
      {
        heading: "높게 고르기와 정확하게 고르기의 차이",
        paragraphs: [
          "자신감 있게 높은 선택을 하는 것과 실제 능력을 과장하는 것은 다릅니다. 평소 다양한 주제에서 연결된 문단과 여러 시간대를 안정적으로 다룬다면 그 증거를 반영해야 하지만, 준비한 답 한 편만으로 전체 능력을 넓게 추정해서는 안 됩니다.",
          "반대로 긴장 때문에 자신을 지나치게 낮추는 것도 좋은 방법은 아닙니다. 문법 실수가 있더라도 질문의 기능을 수행하고 상대가 이해할 수 있는 메시지를 계속 만들었다면, 그 수행을 선택 근거에서 지우지 마세요.",
        ],
        example: {
          title: "증거를 말로 정리하는 예시",
          description: "선택 번호를 외우기 전에 아래처럼 현재 수행을 한 문단으로 설명해 보세요.",
          lines: [
            "I can describe familiar places and routines in connected sentences without reading a script.",
            "I can also tell a past story, but I sometimes lose the timeline when an unexpected problem appears.",
            "So I will choose the description that matches those repeated recordings, not the result I hope to receive.",
          ],
        },
      },
      {
        heading: "선택 직전 12분 판단 도구",
        paragraphs: [
          "4분씩 세 번 녹음하는 대신 답변은 60초 안팎으로 하고, 남은 시간에 기능 표시와 한 줄 근거를 적습니다. 스크립트, 번역기, 실시간 교정 없이 말해야 Self Assessment와 가까운 독립 수행을 볼 수 있습니다.",
          "마지막에는 가장 잘한 녹음과 가장 약한 녹음을 함께 봅니다. 선택은 최고 기록 하나가 아니라 여러 상황에서 유지되는 범위를 반영해야 하므로, 두 녹음 사이에서 공통으로 남은 기능을 최종 근거로 삼으세요.",
        ],
        note: {
          title: "12분 카드",
          text: "설명 1분·경험 1분·문제 해결 1분을 녹음하고 각 녹음에 직접 답변, 연결, 시간 흐름, 회복 네 칸을 표시합니다. 선택 번호보다 네 칸에 남은 반복 증거를 먼저 기록하세요.",
        },
      },
    ],
  },
  {
    id: "opic-holistic-assessment-checklist",
    category: "평가 이해",
    title: "Function·Accuracy·Content/Context·Text Type로 녹음 보는 법",
    subtitle: "오류 개수를 점수처럼 세지 않고 공식 평가 요소를 네 가지 관찰 질문으로 바꾸는 자기복습표입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "OPIc은 한 문법 항목만 떼어 채점하는 시험이 아니라 전체 답변에서 기능, 이해 가능성, 내용과 맥락, 발화 구조를 종합적으로 봅니다. 이 원칙을 등급 계산기가 아닌 다음 녹음용 체크리스트로 바꿉니다.",
    image: opicHolisticAssessmentChecklistCover,
    imageAlt: "헤드폰으로 녹음을 듣고 네 가지 색 카드 옆 노트를 점검하는 학습자",
    takeaway: "네 요소를 점수로 더하지 말고, 다음 답변에서 가장 먼저 고칠 한 요소를 찾는 관찰 렌즈로 사용하세요.",
    disclaimer: "이 체크리스트는 공식 채점표나 등급 환산표가 아닙니다. 실제 OPIc 결과는 공인 평가자가 전체 발화 표본을 종합적으로 평가해 결정합니다.",
    creationNote: "한국 OPIc 시험소개와 ACTFL OPIc 평가 요소 원문을 확인한 뒤, 네 요소를 점수화하지 않는 녹음 복습 질문으로 재구성했습니다.",
    sources: [magazineSources.opicOverview, magazineSources.actflOpic],
    sections: [
      {
        heading: "네 요소는 네 개의 독립 점수가 아닙니다",
        paragraphs: [
          "공식 자료는 Function, Accuracy, Content/Context, Text Type을 전체 수행 안에서 종합적으로 고려한다고 설명합니다. 문법 오류 세 개를 고쳤다고 별도 점수가 더해지거나, 문장이 길다는 이유만으로 다른 요소의 약점이 자동으로 사라지는 구조로 이해해서는 안 됩니다.",
          "자기복습에서는 이 원칙을 지키기 위해 숫자 총점을 만들지 않는 편이 좋습니다. 대신 한 번의 녹음에서 메시지를 가장 크게 흐린 요소가 무엇인지 찾고, 다음 재녹음에서 관찰 가능한 행동 하나만 바꿉니다.",
        ],
      },
      {
        heading: "네 요소를 관찰 질문으로 바꾸기",
        paragraphs: [
          "Function은 질문이 요구한 일을 실제로 했는지 봅니다. Accuracy는 실수 개수보다 어휘·문법·발음·유창성 등이 전체 이해를 방해했는지, Content/Context는 주제와 상황에 맞았는지, Text Type은 발화량과 조직 방식이 과제에 충분했는지를 확인합니다.",
          "예를 들어 예약 변경 롤플레이에서 문법이 매끄러워도 변경 요청과 가능한 시간 질문이 없다면 Function이 비어 있습니다. 반대로 작은 시제 실수가 있어도 문제와 대안을 명확히 전달했다면 메시지 전체를 실패로 처리할 필요는 없습니다.",
        ],
        bullets: [
          "Function: 질문이 시킨 묘사·서술·질문·요청을 실제로 수행했는가",
          "Accuracy: 실수 때문에 핵심 메시지를 다시 들어야 하는 구간이 있는가",
          "Content/Context: 질문 주제와 역할 상황에 맞는 정보인가",
          "Text Type: 낱문장 나열을 넘어 필요한 만큼 연결하고 조직했는가",
        ],
      },
      {
        heading: "같은 답변을 네 번 다르게 듣기",
        paragraphs: [
          "첫 재생에서는 질문 원문을 옆에 두고 Function만 확인합니다. 두 번째에는 화면을 보지 않고 뜻이 따라오는지, 세 번째에는 주제에서 벗어난 문장을, 네 번째에는 문장 사이 연결과 장면 순서를 표시하면 한 번에 모든 오류를 잡으려는 부담이 줄어듭니다.",
          "네 번 모두 긴 메모를 남길 필요는 없습니다. 각 요소 옆에 유지할 것 한 개와 고칠 것 한 개만 적고, 의미 전달에 가장 큰 영향을 준 수정 하나를 RETRY 목표로 고릅니다.",
        ],
        example: {
          title: "짧은 답변을 네 요소로 읽는 예시",
          lines: [
            "Answer: I called the hotel because my arrival time changed. I explained the delay, asked whether late check-in was possible, and confirmed what I should do next.",
            "KEEP: The request and follow-up question complete the function and fit the hotel context.",
            "FIX: Add the original arrival time and the new time so the listener can follow the change more easily.",
          ],
        },
      },
      {
        heading: "한 장짜리 무점수 복습표",
        paragraphs: [
          "종이에 네 칸을 만들고 각 칸에 ‘보였다’, ‘흔들렸다’, ‘다음 행동’만 씁니다. 상·중·하나 100점 환산을 붙이면 공식 등급표처럼 오해하기 쉬우므로, 녹음에서 직접 확인할 수 있는 문장이나 시간 위치를 증거로 남기세요.",
          "두 번째 녹음에서는 선택한 한 요소만 고칩니다. 개선 뒤 다른 요소가 여전히 부족해도 실패가 아니라 다음 반복의 순서가 생긴 것이며, 이 방식이 전체 수행을 조금씩 안정시키는 복습 루프가 됩니다.",
        ],
        note: {
          title: "복습 규칙",
          text: "등급을 예상하지 말고 ‘00:18에서 요청이 처음 나옴’, ‘과거 사건 중 현재형으로 두 번 바뀜’처럼 다시 확인 가능한 증거만 적으세요.",
        },
      },
    ],
  },
  {
    id: "opic-text-type-upgrade-drill",
    category: "답변 설계",
    title: "낱문장에서 짧은 단락으로, Text Type 훈련",
    subtitle: "문장을 무작정 길게 늘리지 않고 하나의 중심 장면을 연결된 문장 묶음으로 만드는 연습입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "Text Type은 어려운 접속사를 몇 개 썼는지가 아니라 필요한 생각을 어느 정도 길이와 조직으로 표현하는지를 보는 관점입니다. 정보 나열을 원인과 결과가 있는 짧은 단락으로 바꾸는 드릴을 제공합니다.",
    image: opicTextTypeUpgradeDrillCover,
    imageAlt: "그림 카드를 한 줄로 연결하며 장면 중심 답변 순서를 구성하는 학습자",
    takeaway: "좋은 단락은 긴 문장 하나가 아니라, 같은 중심 장면을 향해 역할이 다른 문장들이 이어지는 구조입니다.",
    disclaimer: "예시 단계는 학습을 위한 비교이며 공식 등급 판정표가 아닙니다. 발화 길이 하나만으로 OPIc 등급을 예측할 수 없습니다.",
    creationNote: "ACTFL OPIc의 Text Type 설명과 2024 Speaking Guidelines를 확인하고, 동일 소재를 문장 기능별로 연결하는 OOM 드릴을 구성했습니다.",
    sources: [magazineSources.actflOpic, magazineSources.actflGuidelines],
    sections: [
      {
        heading: "길이보다 조직을 먼저 봐야 하는 이유",
        paragraphs: [
          "낱문장을 많이 이어 붙이면 초 수는 늘어나지만 듣는 사람은 무엇이 중심인지 찾기 어렵습니다. 장소가 좋다, 커피가 맛있다, 친구와 갔다처럼 정보가 같은 무게로 나열되면 각 문장은 맞아도 하나의 답변으로 묶이지 않습니다.",
          "짧은 단락에는 중심 문장과 이를 구체화하는 행동, 이유나 변화, 마무리 역할이 필요합니다. 문법적으로 복잡한 한 문장을 만드는 대신 각 문장의 임무를 분리하면 말하다가 막혀도 다음 역할로 이동할 수 있습니다.",
        ],
      },
      {
        heading: "네 칸 단락 카드 만들기",
        paragraphs: [
          "카드 첫 칸에는 질문에 직접 답하는 중심 문장을 적고, 두 번째에는 눈에 보이는 행동, 세 번째에는 그 행동이 중요한 이유나 예상 밖 변화, 네 번째에는 지금의 의미를 적습니다. 각 칸은 문장 전체가 아니라 두세 단어의 키워드만 남깁니다.",
          "카드를 읽는 순서는 고정 대본이 아닙니다. 비교 질문이면 변화 칸을 먼저 열고, 묘사 질문이면 중심과 행동을 먼저 말하는 식으로 질문 기능에 따라 입구를 바꿉니다.",
        ],
        bullets: [
          "CENTER: 질문에 대한 직접 답 한 문장",
          "SCENE: 사람이 실제로 한 행동이나 감각 정보",
          "LINK: 이유·변화·문제 중 질문에 맞는 연결",
          "CLOSE: 장면이 나에게 남긴 의미나 다음 행동",
        ],
      },
      {
        heading: "같은 정보도 단락으로 들리게 하기",
        paragraphs: [
          "아래 예시는 새 사실을 많이 추가하지 않고 문장의 역할과 순서를 바꿉니다. 첫 문장이 장소를 정하고, 두 번째와 세 번째가 반복 행동과 이유를 보여 주며, 마지막 문장이 장면의 의미를 닫습니다.",
          "연습할 때는 연결어 개수를 세지 마세요. 각 문장을 가린 뒤에도 중심 장면이 유지되는지, 순서를 바꾸면 논리가 흐려지는지를 확인하면 조직의 역할이 더 분명해집니다.",
        ],
        example: {
          title: "나열에서 짧은 단락으로",
          lines: [
            "List: I like a cafe. It is quiet. I go there on Fridays. The coffee is good.",
            "Paragraph: There is a quiet cafe near my office that I visit on Friday evenings. I sit by the window and review my week while I drink coffee. That routine matters to me because it helps me leave work behind before the weekend starts.",
            "Check: Every sentence points back to the Friday-evening reset scene.",
          ],
        },
      },
      {
        heading: "삭제 테스트로 단락 다듬기",
        paragraphs: [
          "녹음을 받아쓴 뒤 문장마다 CENTER, SCENE, LINK, CLOSE 중 하나를 표시합니다. 아무 역할도 맡지 못한 문장이나 앞 문장과 같은 정보만 반복하는 문장은 삭제하고, 비어 있는 역할에는 짧은 문장 하나를 보충합니다.",
          "다시 녹음할 때는 받아쓴 문장을 보지 않고 네 개의 키워드만 봅니다. 표현이 달라져도 역할과 장면이 유지된다면 암기문이 아니라 이동 가능한 단락 구조를 만든 것입니다.",
        ],
        note: {
          title: "삭제 테스트",
          text: "문장 하나를 지웠을 때 새 정보가 사라지지 않는다면 반복일 가능성이 큽니다. 반대로 지운 뒤 시간·행동·이유 중 하나가 끊기면 그 문장은 단락의 실제 연결부입니다.",
        },
      },
    ],
  },
  {
    id: "opic-time-frame-storyline-guide",
    category: "답변 설계",
    title: "현재·과거·변화를 한 장면에 넣는 시간축 답변법",
    subtitle: "시제를 문제집처럼 고르기 전에 이야기의 기준 시점과 이동 방향을 눈에 보이게 만드는 워크시트입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "여러 시간대를 다루는 답변은 동사 형태만 바꾸는 연습으로 안정되지 않습니다. NOW, THEN, TURN 세 칸에 사실을 배치해 듣는 사람이 변화의 방향을 따라오게 만드는 방법을 설명합니다.",
    image: opicTimeFrameStorylineGuideCover,
    imageAlt: "같은 카페 장면의 시간대별 사진 세 장으로 답변 시간축을 연습하는 학습자",
    takeaway: "시제를 정확히 말하려 애쓰기 전에 언제의 이야기인지 먼저 고정하면, 동사와 연결 표현을 선택할 기준이 생깁니다.",
    disclaimer: "시간대 활용은 ACTFL 숙련도 설명의 한 요소이지만, 특정 시제를 사용했다고 특정 OPIc 등급이 보장되는 것은 아닙니다.",
    creationNote: "ACTFL 2024 Speaking Guidelines의 시간대·서술 기능 설명과 공식 OPIc 평가 요소를 검토하고, NOW–THEN–TURN 시간축을 설계했습니다.",
    sources: [magazineSources.actflGuidelines, magazineSources.actflOpic],
    sections: [
      {
        heading: "시제 실수보다 먼저 생기는 시간축 실수",
        paragraphs: [
          "과거 경험을 말하다가 현재 루틴으로 넘어갔는데 전환 신호가 없으면, 동사 형태가 맞아도 듣는 사람은 장면이 언제인지 다시 계산해야 합니다. 반대로 작은 형태 오류가 있어도 기준 시점과 사건 순서가 선명하면 메시지의 큰 흐름은 따라가기 쉽습니다.",
          "그래서 첫 단계는 문법 이름을 고르는 일이 아니라 질문이 요구한 기준 시점을 표시하는 일입니다. 현재 루틴, 한 번의 과거 사건, 과거와 지금의 변화 중 무엇이 중심인지 정한 뒤 다른 시간대는 보조로 붙입니다.",
        ],
      },
      {
        heading: "NOW–THEN–TURN 세 칸 워크시트",
        paragraphs: [
          "NOW에는 요즘 반복하는 행동, THEN에는 구체적인 한 번의 과거 장면, TURN에는 두 시점을 연결한 변화나 배운 점을 적습니다. 질문이 과거 경험이면 THEN을 길게, 비교 질문이면 NOW와 THEN을 비슷한 비중으로 사용합니다.",
          "각 칸에는 장소·행동·결과를 한 단어씩만 적으세요. 완성 문장을 쓰면 시점 이동보다 문장 암기에 집중하게 되지만, 키워드만 두면 말하는 순간 필요한 동사 형태를 직접 선택하게 됩니다.",
        ],
        bullets: [
          "NOW: these days / usually — 현재의 반복 행동",
          "THEN: last spring / when I first — 한 번의 과거 장면",
          "TURN: since then / now I — 사건 뒤 생긴 변화",
          "검토: 한 문장 안에서 시점이 이유 없이 두 번 바뀌지 않았는가",
        ],
      },
      {
        heading: "한 산책 장면을 세 시간대로 말하기",
        paragraphs: [
          "같은 동네 산책도 현재 루틴만 말하면 습관 답변이 되고, 처음 시작한 날을 중심에 두면 과거 경험 답변이 됩니다. 여기에 예전에는 차로 이동했지만 지금은 걷는다는 변화를 붙이면 비교 질문으로 확장할 수 있습니다.",
          "세 답변을 모두 새로 외우지 말고 장소와 핵심 행동은 유지하세요. 질문에 따라 기준 시점과 첫 문장만 바꾸면 하나의 실제 경험이 서로 다른 기능을 수행합니다.",
        ],
        example: {
          title: "시간축이 들리는 세 문장",
          lines: [
            "NOW: These days, I walk around my neighborhood after dinner because the streets are quiet.",
            "THEN: I started that routine last spring, when my bus was delayed and I decided to walk home instead.",
            "TURN: Since then, I have chosen walking whenever I need to clear my head after work.",
          ],
        },
      },
      {
        heading: "색깔 없이도 가능한 시점 검수",
        paragraphs: [
          "받아쓴 답변의 각 문장 앞에 N, T, R을 붙이고 같은 표시가 몇 문장 이어지는지 봅니다. T로 시작한 사건이 설명 없이 N으로 바뀌었다면 전환 표현을 넣거나, 현재 정보가 불필요하다면 과감히 지웁니다.",
          "마지막 재녹음에서는 시제 오류를 모두 고치려 하지 말고 전환 한 곳만 분명히 말합니다. 시간축이 먼저 안정되면 반복해서 듣는 과정에서 자주 흔들리는 동사도 더 구체적으로 찾을 수 있습니다.",
        ],
        note: {
          title: "N–T–R 검수",
          text: "문장마다 NOW, THEN, TURN 표시를 붙인 뒤 표시가 바뀌는 경계만 들으세요. 경계가 귀에 안 들리면 시간 표현이나 원인·결과 문장을 한 개 보강합니다.",
        },
      },
    ],
  },
  {
    id: "opic-pronunciation-comprehensibility-guide",
    category: "발화 점검",
    title: "원어민 억양보다 이해 가능성, 발음 복습의 기준",
    subtitle: "transcript 정확도를 발음 점수로 오해하지 않고 실제 녹음에서 메시지를 방해하는 구간을 찾는 방법입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "ACTFL은 Accuracy를 문법만이 아니라 어휘, 발음, 유창성 등이 전체 이해 가능성에 미치는 영향으로 설명합니다. 억양 흉내나 STT 인식률 대신 사람이 다시 들어야 했던 구간을 중심으로 복습합니다.",
    image: opicPronunciationComprehensibilityGuideCover,
    imageAlt: "마이크 앞에서 말하고 헤드폰으로 녹음을 확인하는 학습자",
    takeaway: "발음 복습의 목표는 특정 억양을 복제하는 것이 아니라, 듣는 사람이 핵심 장소·행동·요청을 한 번에 이해하도록 만드는 것입니다.",
    disclaimer: "transcript와 STT 결과만으로 발음, 억양, 리듬 또는 음향적 유창성을 평가할 수 없습니다. 이 글은 공식 발음 채점이나 등급 예측을 제공하지 않습니다.",
    creationNote: "ACTFL OPIc의 Accuracy·comprehensibility 설명과 2024 Speaking Guidelines를 확인하고, 오디오를 직접 듣는 이해 가능성 점검표를 구성했습니다.",
    sources: [magazineSources.actflOpic, magazineSources.actflGuidelines],
    sections: [
      {
        heading: "Accuracy는 원어민처럼 들리는가가 아닙니다",
        paragraphs: [
          "공식 ACTFL OPIc 안내는 Accuracy를 어휘, 문법, 발음, 유창성, 화용 능력 등이 메시지의 이해 가능성에 어떤 영향을 주는지로 설명합니다. 한 가지 억양이나 완벽한 소리를 복제하는 목표로 좁히면 이 넓은 관점을 놓치게 됩니다.",
          "실제 복습에서는 듣는 사람이 장소, 시간, 행동, 요청을 오해할 만한 구간을 먼저 찾습니다. 개별 소리가 조금 달라도 메시지가 즉시 이해된다면 우선순위가 낮고, 핵심 단어가 삼켜져 뜻이 바뀐다면 먼저 고칠 가치가 큽니다.",
        ],
      },
      {
        heading: "transcript가 말해 주지 못하는 것",
        paragraphs: [
          "STT가 문장을 정확히 받아썼다고 해서 강세와 리듬, 말의 속도, 자음·모음이 모두 명료하다는 뜻은 아닙니다. 반대로 고유명사나 소음 때문에 STT가 틀렸다고 해서 사람도 같은 방식으로 이해하지 못했다고 단정할 수 없습니다.",
          "transcript는 빠진 내용과 반복 표현을 찾는 보조 자료로 사용하고, 발음 복습은 반드시 원래 오디오를 들으며 진행하세요. OOM의 텍스트 기반 AI 피드백도 발음이나 음향적 유창성을 판정하는 근거로 사용해서는 안 됩니다.",
        ],
        bullets: [
          "오디오에서 핵심 명사와 숫자가 한 번에 들리는가",
          "문장 끝이 작아져 결과나 요청이 사라지지 않는가",
          "긴 문장에서 의미 단위 사이에 짧은 경계가 있는가",
          "속도를 올렸을 때 같은 음절이 반복해서 뭉개지지 않는가",
        ],
      },
      {
        heading: "사람 기준의 두 번 듣기 테스트",
        paragraphs: [
          "첫 번째 재생에서는 화면을 보지 말고 답변의 핵심을 한 줄로 적습니다. 두 번째에는 transcript를 보며 처음에 놓친 단어를 표시하고, 그 단어가 정보의 중심인지 장식적인 표현인지 구분합니다.",
          "중심 정보가 두 번 이상 놓쳤다면 그 문장만 잘라 천천히 말한 뒤 원래 속도로 돌아옵니다. 전체 답변을 반복 녹음하기보다 이해를 막은 한 구간을 교정하면 연습 목표가 명확해집니다.",
        ],
        example: {
          title: "강세를 정보 구조로 바꾸는 예시",
          lines: [
            "Before: I called because my reservation changed and I need another room on Saturday.",
            "Focus: RESERVATION CHANGED / another room / SATURDAY.",
            "Retry: I’m calling because my RESERVATION CHANGED. I need another room for SATURDAY, if one is available.",
          ],
        },
      },
      {
        heading: "한 번에 한 종류만 고치기",
        paragraphs: [
          "한 녹음에서 자음, 모음, 강세, 속도, 필러를 모두 표시하면 다음 발화에서 무엇을 바꿀지 모르게 됩니다. 이번 재시도에서는 문장 끝 크기, 다음에는 핵심어 강세처럼 한 종류만 정하세요.",
          "수정 뒤에는 같은 문장을 또렷하게 읽는 데서 끝내지 말고 비슷한 새 질문에 적용합니다. 새로운 문장에서도 핵심 정보가 들린다면 소리 연습이 실제 말하기 습관으로 이동한 것입니다.",
        ],
        note: {
          title: "오디오 증거 규칙",
          text: "발음 관련 메모에는 transcript 문장 대신 ‘00:24의 Saturday가 처음 재생에서 안 들림’처럼 시간 위치와 청취 결과를 남기세요.",
        },
      },
    ],
  },
];

const examPracticeMagazineArticles: MagazineArticleDraft[] = [
  {
    id: "opic-question-type-decoder",
    category: "질문 해석",
    title: "묘사·루틴·과거 경험·비교·문제 해결 질문 읽는 법",
    subtitle: "주제 명사만 듣지 않고 질문이 요구한 말하기 기능과 기준 시점을 빠르게 구분하는 훈련입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "같은 공원이나 카페 주제도 질문 기능에 따라 답변의 출발점이 달라집니다. 핵심 동사, 시간 표현, 역할 상황을 단서로 다섯 질문 유형을 분류하고 첫 문장을 결정하는 방법을 제공합니다.",
    image: opicQuestionTypeDecoderCover,
    imageAlt: "묘사와 루틴, 경험, 비교, 문제 해결을 나타내는 그림 카드를 분류하는 학습자",
    takeaway: "주제를 맞히는 것보다 질문이 시킨 일을 먼저 말하면, 준비한 장면을 유지하면서도 엉뚱한 답변을 피할 수 있습니다.",
    disclaimer: "실제 문항과 출제 조합은 공개되지 않으며 이 글의 분류는 공식 기출 목록이 아닙니다. OOM 연습 질문을 기능별로 해석하기 위한 도구입니다.",
    creationNote: "ACTFL OPIc의 Function·Content/Context 설명과 Familiarization Guide의 시험 구조를 확인하고, 다섯 기능 분류와 예시를 구성했습니다.",
    sources: [magazineSources.actflOpic, magazineSources.actflFamiliarization],
    sections: [
      {
        heading: "주제는 같아도 해야 할 일은 다릅니다",
        paragraphs: [
          "‘공원’이라는 단어를 들었다고 늘 좋아하는 공원을 소개하면, 과거 경험이나 변화 질문에는 핵심을 비켜갈 수 있습니다. 질문에서 장소 명사는 답변 재료를 알려 주지만, describe, usually, last time, compared with, problem 같은 단서는 수행해야 할 기능을 알려 줍니다.",
          "공식 평가 요소 중 Function과 Content/Context는 질문이 요구한 일을 상황에 맞게 수행했는지를 봅니다. 따라서 익숙한 스크립트를 꺼내기 전에 기능과 기준 시점을 한 단어로 붙이는 습관이 필요합니다.",
        ],
      },
      {
        heading: "다섯 유형의 첫 단서",
        paragraphs: [
          "묘사는 특징과 배치, 루틴은 반복 행동과 순서, 과거 경험은 특정 시점의 사건, 비교는 두 시점이나 대상의 차이, 문제 해결은 장애와 필요한 조치를 중심에 둡니다. 질문 전체를 번역하지 못해도 이 중심을 찾으면 첫 문장을 결정할 수 있습니다.",
          "한 질문에 단서가 두 개 있을 때는 마지막 요청과 더 구체적인 동사를 우선 확인하세요. 장소를 묘사한 뒤 최근 변화를 말하라는 질문이라면 짧은 배경 묘사 후 변화에 더 많은 시간을 써야 합니다.",
        ],
        bullets: [
          "DESCRIPTION: what is it like / describe — 특징·배치부터",
          "ROUTINE: usually / how often — 반복 행동·순서부터",
          "PAST EVENT: last time / memorable — 특정 시점·사건부터",
          "COMPARISON: before and now / different — 비교 기준부터",
          "PROBLEM: something went wrong / what did you do — 문제·조치부터",
        ],
      },
      {
        heading: "카페 장면 하나로 첫 문장 바꾸기",
        paragraphs: [
          "장소와 핵심 행동은 그대로 두고 질문 유형에 따라 카메라가 보는 위치만 바꿉니다. 묘사는 공간, 루틴은 반복 순서, 과거 경험은 한 번의 사건, 비교는 변화, 문제 해결은 원하는 조치를 먼저 보여 줍니다.",
          "첫 문장 뒤에는 기존 장면의 사실을 재사용하되 질문과 무관한 블록은 덜어냅니다. 이렇게 하면 답안을 다섯 편 외우지 않고도 질문에 직접 반응할 수 있습니다.",
        ],
        example: {
          title: "같은 카페, 서로 다른 입구",
          lines: [
            "Description: The cafe I visit most is a small place with one long window facing the street.",
            "Routine: On Friday evenings, I order the same drink and review my weekly notes by that window.",
            "Past event: Last month, the cafe lost power while I was working, so everyone moved outside together.",
            "Comparison: I used to choose crowded chain cafes, but now I prefer this quieter local place.",
            "Problem: My order was missing, so I showed the receipt and asked when it could be remade.",
          ],
        },
      },
      {
        heading: "15문항 기능 분류 드릴",
        paragraphs: [
          "OOM의 연습 질문 15개를 골라 답하지 말고 유형과 기준 시점만 5초 안에 말합니다. 같은 유형이 몰렸다면 다른 Course나 질문 풀을 섞어 단서가 바뀔 때마다 분류를 다시 시작하세요.",
          "두 번째 회차에는 유형을 말한 뒤 첫 문장만 녹음합니다. 첫 문장이 기능에 직접 답하지 않으면 전체 답변을 길게 만드는 대신 그 한 문장부터 바꾸는 것이 효율적입니다.",
        ],
        note: {
          title: "5초 카드",
          text: "질문을 듣고 ‘PAST–trip’, ‘COMPARE–home’처럼 기능과 주제를 두 단어로 말한 뒤 첫 문장으로 들어가세요. 번역문을 머릿속에서 완성하는 시간을 줄여 줍니다.",
        },
      },
    ],
  },
  {
    id: "opic-word-recovery-circumlocution",
    category: "표현 클리닉",
    title: "단어가 생각나지 않을 때, 우회 설명으로 답변 이어가기",
    subtitle: "필러를 반복하는 대신 모양·용도·장소·비슷한 말로 뜻을 전달하는 회복 드릴입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "즉흥 말하기에서는 정확한 명사가 바로 떠오르지 않을 수 있습니다. 멈추거나 한국어를 삽입하기보다 상대가 대상을 추론할 수 있는 두 가지 단서를 주고 장면으로 돌아오는 방법을 연습합니다.",
    image: opicWordRecoveryCircumlocutionCover,
    imageAlt: "카페에서 손짓으로 사물의 모양과 용도를 우회 설명하는 두 사람",
    takeaway: "회복의 목표는 잊은 단어를 끝내 찾아내는 것이 아니라, 핵심 메시지를 전달한 뒤 원래 이야기로 돌아오는 것입니다.",
    disclaimer: "우회 설명은 특정 등급을 보장하는 공식 공식이 아닙니다. 의미가 통하는 자연스러운 대체 표현을 만드는 OOM 발화 연습입니다.",
    creationNote: "ACTFL 2024 Speaking Guidelines의 전략적 지식·이해 가능성 설명과 공식 수험자 조언을 검토하고, 열 개의 우회 설명 훈련 방식을 구성했습니다.",
    sources: [magazineSources.actflGuidelines, magazineSources.actflTestTakerTips],
    sections: [
      {
        heading: "필러와 우회 설명은 하는 일이 다릅니다",
        paragraphs: [
          "‘Let me think’은 잠깐 생각할 시간을 알리지만 잊은 단어의 의미를 전달하지는 않습니다. 같은 필러를 반복하면 답변 시간은 늘어도 장면은 앞으로 가지 않으므로, 한 번 숨을 고른 뒤 실제 단서를 말해야 합니다.",
          "우회 설명은 정확한 단어 대신 상대가 대상을 알아볼 수 있는 정보를 제공합니다. 이름을 잊었어도 무엇에 쓰는지, 어디에서 봤는지, 무엇과 비슷한지 중 두 가지를 말하면 대화 기능을 계속 수행할 수 있습니다.",
        ],
      },
      {
        heading: "두 단서와 복귀 문장",
        paragraphs: [
          "먼저 ‘I can’t remember the exact word, but’처럼 짧게 문제를 알리고, CATEGORY와 USE 또는 PLACE와 SHAPE처럼 서로 다른 단서 두 개를 줍니다. 마지막에는 ‘Anyway’ 뒤에 원래 사건의 다음 행동을 붙여 설명 자체가 새 주제가 되지 않게 합니다.",
          "단서를 너무 많이 주면 수수께끼가 길어집니다. 상대가 알아들을 가능성이 생긴 순간 정확한 단어 찾기를 멈추고 이야기의 행동이나 결과로 돌아가세요.",
        ],
        bullets: [
          "CATEGORY: It is a kind of tool / place / outdoor equipment",
          "USE: You use it to keep food cold / reserve a seat / carry water",
          "PLACE: You usually see it near the entrance / at a campsite",
          "SHAPE: It is a small round part with a handle",
          "RETURN: Anyway, I used it to solve the problem and continued my trip",
        ],
      },
      {
        heading: "잊은 단어를 이야기의 일부로 처리하기",
        paragraphs: [
          "캠핑장에서 ‘flashlight’가 생각나지 않았다고 가정해 보겠습니다. 침묵하다가 단어를 찾는 대신 어둠 속에서 쓰는 작은 휴대용 빛이라고 설명하면, 청자는 필요한 물건을 이해하고 사건도 계속 따라갈 수 있습니다.",
          "정확한 명사가 나중에 떠올라도 답변을 처음부터 고치지 마세요. 짧게 이름을 확인한 뒤 문제 해결 결과로 넘어가면 회복 과정이 자연스러운 즉흥 발화로 남습니다.",
        ],
        example: {
          title: "flashlight를 잊었을 때",
          lines: [
            "I couldn’t find the exact word, but it was a small light you carry when it gets dark outside.",
            "We needed it because the path from our tent to the parking area had no lights.",
            "Oh, a flashlight—that’s it. Anyway, my friend found one in the car, so we got back safely.",
          ],
        },
      },
      {
        heading: "열 장의 금지 단어 카드",
        paragraphs: [
          "휴대폰, 영수증, 충전기, 우산, 텐트처럼 익숙한 명사 열 개를 카드에 적고 한 장씩 뒤집습니다. 그 단어를 직접 말하지 않은 채 15초 안에 두 단서와 원래 장면의 행동을 설명하세요.",
          "다음 회차에는 카드의 단어를 주제 안에서 갑자기 잊었다고 가정합니다. 우회 설명 뒤 원래 이야기로 돌아오는 데 걸린 시간을 재면 단어 지식이 아니라 회복 동작이 빨라지는지 확인할 수 있습니다.",
        ],
        note: {
          title: "15초 회복 규칙",
          text: "필러 1회, 서로 다른 단서 2개, 복귀 문장 1개만 허용합니다. 정확한 단어를 끝내 말하지 못해도 메시지가 전달되고 이야기가 이어지면 성공입니다.",
        },
      },
    ],
  },
  {
    id: "opic-two-listens-memory-grid",
    category: "시험 전략",
    title: "질문을 두 번 듣고 메모 없이 핵심 기억하는 법",
    subtitle: "첫 청취에서 기능을, 두 번째 청취에서 시점과 대상을 확인하는 WHO–TIME–TASK 기억 그리드입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "7분 읽기",
    summary: "한국 OPIc 공식 진행 안내에는 질문 청취 기회와 시험장 물품 제한이 명시되어 있습니다. 종이에 적는 전략이 아니라 머릿속 세 칸으로 질문 핵심을 유지하고 바로 첫 문장으로 전환하는 연습을 제공합니다.",
    image: opicTwoListensMemoryGridCover,
    imageAlt: "두 개의 질문 파형을 들으며 빈 노트로 핵심을 기억하는 학습자",
    takeaway: "첫 번째 청취에서 모든 단어를 잡으려 하지 말고 TASK를 찾은 뒤, 두 번째 청취로 WHO와 TIME을 확인하세요.",
    disclaimer: "실제 청취 횟수와 시험장 반입·사용 제한은 응시일의 한국 OPIc 공식 안내를 최종 확인하세요. 이 글은 기억 훈련을 위한 비공식 학습 자료입니다.",
    creationNote: "한국 OPIc 공식 진행프로세스의 질문 청취 안내와 응시자 유의사항의 물품 제한을 확인하고, 메모 없이 적용하는 WHO–TIME–TASK 드릴을 구성했습니다.",
    sources: [magazineSources.opicOverview, magazineSources.opicCandidateNotice],
    sections: [
      {
        heading: "첫 청취에 문장 전체를 저장하지 마세요",
        paragraphs: [
          "질문을 한 단어씩 한국어로 옮기면 뒤쪽 요청을 듣는 동안 앞부분이 사라지기 쉽습니다. 특히 주제 설명이 길고 마지막에 과거 경험이나 비교를 요구하는 질문은 초반 명사보다 마지막 기능이 답변 방향을 결정합니다.",
          "첫 청취의 목표를 TASK 하나로 제한하세요. 묘사인지, 반복 행동인지, 한 번의 사건인지, 비교인지, 문제 해결인지 분류하면 두 번째 청취에서 무엇을 확인해야 할지가 선명해집니다.",
        ],
      },
      {
        heading: "WHO–TIME–TASK 세 칸",
        paragraphs: [
          "WHO는 사람만이 아니라 답변 대상인 장소나 활동까지 포함합니다. TIME은 usually, when you were younger, last time처럼 기준 시점을, TASK는 질문이 요구하는 묘사·서술·비교·요청을 뜻합니다.",
          "첫 청취 뒤 손으로 적는 대신 세 칸을 짧게 소리 내거나 머릿속으로 반복합니다. 두 번째 청취에서는 비어 있거나 확신 없는 칸만 확인하고, 들은 문장 전체를 다시 저장하려 하지 않습니다.",
        ],
        bullets: [
          "WHO: park / friend / store clerk처럼 답변의 중심 대상",
          "TIME: usually / last visit / before and now처럼 기준 시점",
          "TASK: describe / tell a story / compare / ask처럼 수행 기능",
          "첫 문장: 세 칸 중 TASK와 TIME에 먼저 직접 답하기",
        ],
      },
      {
        heading: "두 번째 청취를 확인에만 쓰는 예시",
        paragraphs: [
          "첫 번째 청취에서 ‘공원–과거–문제’를 잡았다면 이미 답변 틀이 생깁니다. 두 번째에는 누구와 있었는지, 문제가 날씨였는지 시설이었는지처럼 장면을 바꾸는 정보만 확인합니다.",
          "세부 단어 하나를 놓쳐도 기능과 시점이 분명하면 첫 문장을 시작할 수 있습니다. 반대로 장소명은 기억했지만 TASK를 놓쳤다면 재생 뒤 곧바로 답하지 말고 질문의 마지막 동작을 다시 떠올리세요.",
        ],
        example: {
          title: "두 번 청취의 역할 분리",
          lines: [
            "First listen: PARK / LAST VISIT / PROBLEM.",
            "Second listen: WITH A FRIEND / SUDDEN RAIN / EXPLAIN WHAT YOU DID.",
            "Opening: The last time I visited the park with a friend, sudden rain changed our whole plan.",
          ],
        },
      },
      {
        heading: "화면 없이 하는 20문항 드릴",
        paragraphs: [
          "Quick Practice에서 질문을 한 번 듣고 화면을 가린 채 WHO–TIME–TASK를 말합니다. 두 번째 재생 후 바뀐 칸만 다시 말하고, 실제 답변은 첫 문장까지만 녹음해 질문 대응이 맞는지 확인합니다.",
          "20문항 중 정답 개수를 점수화하기보다 자주 비는 칸을 찾으세요. TIME이 반복해서 사라진다면 시간 표현에만 귀를 기울이는 다섯 문항을 추가하는 식으로 청취 목표를 좁힙니다.",
        ],
        note: {
          title: "청취 로그",
          text: "각 문항에는 ‘TASK 놓침’, ‘TIME 수정’, ‘첫 문장 일치’ 중 하나만 기록하세요. 실제 시험 중 메모를 전제로 하지 않는 연습이어야 합니다.",
        },
      },
    ],
  },
  {
    id: "opic-40-minute-pacing-plan",
    category: "시험 전략",
    title: "40분·12~15문항, OPIc 답변 시간을 어떻게 배분할까",
    subtitle: "문항별 공식 제한이 없는 구조에서 한 답변에 머무르지 않고 전체 발화 표본을 완주하는 연습용 페이스 플랜입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "한국 OPIc 공식 안내의 전체 시험시간, 문항 수, 문항별 답변시간 구조를 바탕으로 준비·발화·이동 시간을 직접 측정합니다. 공식 권장 시간이 아닌 세 가지 연습 프로필로 나에게 맞는 완주 기준을 찾습니다.",
    image: opic40MinutePacingPlanCover,
    imageAlt: "타이머와 여러 질문 카드를 세 구간으로 배치하는 학습자",
    takeaway: "한 답변을 완벽하게 만드는 것보다 전체 세션에서 말할 기회를 고르게 확보하는 페이스가 중요합니다.",
    disclaimer: "아래 시간은 OOM이 제안하는 모의 연습용 범위이며 OPIc 공식 권장 답변시간이나 채점 기준이 아닙니다. 실제 시험 운영 정보는 응시 전 공식 안내를 확인하세요.",
    creationNote: "한국 OPIc 공식 시험시간·문항 수·문항별 진행 정보를 확인하고, 답변 녹음 로그를 기반으로 세 가지 연습용 페이스 프로필을 설계했습니다.",
    sources: [magazineSources.opicOverview, magazineSources.opicCandidateGuide],
    sections: [
      {
        heading: "전체 시간과 한 문항의 시간을 구분하기",
        paragraphs: [
          "한국 OPIc 공식 소개는 본시험 시간과 문항 수 범위를 안내하고, 문항별 답변시간 제한이 없다고 설명합니다. 이는 한 문항을 무한히 길게 말하라는 뜻이 아니라 전체 시간 안에서 응시자가 이동 시점을 관리해야 한다는 뜻에 가깝습니다.",
          "연습할 때는 발화 시간만 재지 말고 질문 청취가 끝난 뒤 첫 문장까지의 준비 정적, 실제 발화, 다음 문항으로 이동하기 전 정리 시간을 분리하세요. 어디에서 시간이 사라지는지 알아야 현실적인 페이스를 만들 수 있습니다.",
        ],
      },
      {
        heading: "세 가지 연습용 페이스 프로필",
        paragraphs: [
          "안정형은 모든 질문에 짧게라도 끝까지 답하는 데 초점을 두고, 확장형은 이야기 질문에서만 시간을 더 씁니다. 회복형은 준비 정적이 긴 학습자가 첫 문장을 빠르게 시작하고 필요하면 짧게 닫는 연습에 맞습니다.",
          "프로필은 등급별 공식 시간표가 아닙니다. 한 세션을 녹음한 뒤 미응답 문항, 10초 이상 정적, 같은 내용 반복이 가장 적은 방식을 선택하는 개인 연습 도구입니다.",
        ],
        bullets: [
          "안정형: 짧은 직접 답변을 우선하고 모든 문항 완주 여부를 본다",
          "확장형: 묘사는 간결하게, 경험·문제 해결에서 장면을 확장한다",
          "회복형: 첫 문장 시작 시간을 줄이고 막히면 요약 문장으로 닫는다",
          "공통: 남은 시간을 보며 마지막 문항들에도 발화 기회를 남긴다",
        ],
      },
      {
        heading: "한 문항에 오래 머무르는 신호",
        paragraphs: [
          "새로운 정보 없이 같은 형용사와 이유를 반복하거나, 끝난 장면에 또 다른 사건을 억지로 붙이면 이동할 시점을 놓친 것입니다. 질문 기능을 이미 수행했고 장면의 결과까지 말했으면 짧은 의미 문장으로 닫을 수 있습니다.",
          "반대로 20초 만에 끝났다는 이유만으로 무조건 늘리지 마세요. 빠진 것이 질문의 핵심인지 확인하고 장소·행동·결과 중 실제로 필요한 한 덩어리만 추가합니다.",
        ],
        example: {
          title: "닫고 이동하는 문장",
          lines: [
            "So that small change solved the problem, and we were able to continue the trip without losing the whole afternoon.",
            "That is why I still prefer the quieter park near my home, even though it is not a famous place.",
            "Anyway, I confirmed the new time, thanked the staff member, and ended the call.",
          ],
        },
      },
      {
        heading: "40분 모의고사 뒤 남길 세 숫자",
        paragraphs: [
          "모의 연습이 끝나면 평균 답변시간보다 미응답 문항 수, 10초 이상 시작 정적 수, 핵심 없이 반복한 답변 수를 적습니다. 세 숫자는 등급 예측이 아니라 다음 세션의 운영 문제를 보여 줍니다.",
          "다음 시도에서는 가장 큰 숫자 하나만 줄이는 목표를 세웁니다. Full Mock의 중간 난이도 조정은 해당 모의 세션 안의 연습 흐름일 뿐, 저장된 Course나 Level 선택을 바꾸는 기능이 아니라는 점도 구분하세요.",
        ],
        note: {
          title: "완주 로그",
          text: "미응답 / 긴 시작 정적 / 무정보 반복을 각각 숫자로 남기고 다음 모의고사에서는 하나만 줄이세요. 이 숫자를 공식 점수나 등급으로 환산하지 않습니다.",
        },
      },
    ],
  },
  {
    id: "opic-second-difficulty-choice",
    category: "시험 구조",
    title: "1st Session 뒤 난이도 재조정, 무엇을 기준으로 고를까",
    subtitle: "쉬운·비슷한·어려운 질문 중 목표 등급이 아니라 첫 세션의 실제 수행 증거로 판단하는 방법입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "한국 OPIc은 첫 세션 뒤 난이도를 다시 선택하는 과정을 안내합니다. 한 문제의 기분이나 원하는 결과가 아니라 이해, 기능 수행, 회복, 지속성 네 증거로 첫 세션을 돌아보는 판단표입니다.",
    image: opicSecondDifficultyChoiceCover,
    imageAlt: "첫 세션 녹음 파형과 두 난이도 카드를 비교하는 학습자",
    takeaway: "재조정은 목표를 선언하는 버튼이 아니라, 방금 수행한 질문 범위가 현재 발화를 충분히 보여 주었는지 판단하는 순간입니다.",
    disclaimer: "난이도 선택과 실제 출제·평가의 세부 알고리즘은 공개되어 있지 않습니다. 이 글은 선택 결과나 OPIc 등급을 예측·보장하지 않습니다.",
    creationNote: "한국 OPIc 공식 진행프로세스와 수험자 가이드에서 1st Session·난이도 재조정·2nd Session 흐름을 확인하고, 수행 증거 중심 판단표를 구성했습니다.",
    sources: [magazineSources.opicOverview, magazineSources.opicCandidateGuide],
    sections: [
      {
        heading: "재조정 화면 전에 판단을 끝내지 마세요",
        paragraphs: [
          "첫 질문이 어렵거나 마지막 답변이 짧았다는 이유만으로 전체 세션을 실패로 판단하기 쉽습니다. 그러나 재조정은 여러 문항에서 나타난 수행을 돌아볼 기회이므로 가장 강한 감정이 남은 한 문항보다 반복된 패턴을 보는 편이 낫습니다.",
          "원하는 등급을 떠올려 무조건 어려운 쪽을 고르거나 불안해서 자동으로 쉬운 쪽을 고르는 것도 증거 기반 판단이 아닙니다. 방금 질문을 이해하고 요구 기능을 수행하며 답변을 이어 간 범위를 차분히 확인하세요.",
        ],
      },
      {
        heading: "이해·기능·회복·지속성 네 증거",
        paragraphs: [
          "이해는 질문의 주제와 기준 시점을 잡았는지, 기능은 묘사·과거 서술·비교·문제 해결 등 요청을 수행했는지 봅니다. 회복은 단어가 막힌 뒤 뜻을 바꾸어 이어 갔는지, 지속성은 여러 문항에서 비슷한 수준의 발화를 유지했는지를 뜻합니다.",
          "네 항목에 점수를 붙이지 말고 ‘대부분 유지’, ‘질문에 따라 흔들림’, ‘반복적으로 중단’처럼 패턴을 기록합니다. 연습에서는 실제 화면에 들어가기 전 첫 세션 녹음을 빠르게 회상하는 훈련을 할 수 있습니다.",
        ],
        bullets: [
          "이해: 주제와 시간 단서를 반복해서 정확히 잡았다",
          "기능: 질문이 요구한 일을 첫 두 문장 안에 시작했다",
          "회복: 단어·문법이 막혀도 의미를 다른 방식으로 전달했다",
          "지속성: 준비한 주제와 낯선 주제 사이의 차이가 지나치게 크지 않았다",
        ],
      },
      {
        heading: "세 선택지를 연습 언어로 해석하기",
        paragraphs: [
          "연습에서는 ‘쉬운’ 선택을 도망, ‘어려운’ 선택을 용기로 이름 붙이지 마세요. 현재 질문 범위에서 기능 수행이 반복적으로 무너졌는지, 적절했는지, 충분히 안정되어 더 넓은 과제에서도 발화 표본을 만들 여지가 있는지를 중립적으로 묻습니다.",
          "실제 선택이 어떤 문항과 결과로 이어질지는 단정할 수 없습니다. 따라서 특정 선택을 하면 특정 등급이 나온다는 표 대신, 각 선택 전에 확인할 현재 수행의 근거 문장을 준비하세요.",
        ],
        example: {
          title: "결과 예측 대신 수행 근거 말하기",
          lines: [
            "I understood most prompts and completed the requested task, but my past stories repeatedly lost their timeline.",
            "I handled both familiar and unexpected topics with connected answers and recovered when a word was missing.",
            "My choice should reflect that pattern across the session, not the one answer I liked most.",
          ],
        },
      },
      {
        heading: "Full Mock에서 재조정 연습하기",
        paragraphs: [
          "OOM Full Mock에서는 첫 세션 뒤 이해·기능·회복·지속성을 머릿속으로 확인하고 재조정 단계를 진행하세요. 시험 중에는 transcript, AI 피드백, 힌트를 열지 않고 세션이 모두 끝난 뒤 녹음으로 판단과 실제 수행을 비교합니다.",
          "Mock의 재조정은 두 번째 세션의 연습 질문 수준에만 적용되며 기존 TrainingSelection이나 브라우저 저장값을 바꾸지 않습니다. 이 경계를 지켜야 한 번의 모의 결과가 평소 학습 설정을 조용히 덮어쓰지 않습니다.",
        ],
        note: {
          title: "30초 회상표",
          text: "화면을 넘기기 전 네 단어만 떠올리세요: 이해, 기능, 회복, 지속성. 세션 종료 후 녹음으로 회상을 검증하되, 이를 공식 등급 예측으로 바꾸지 않습니다.",
        },
      },
    ],
  },
];

const topicPracticeMagazineArticles: MagazineArticleDraft[] = [
  {
    id: "opic-movie-music-performance-story-map",
    category: "주제 훈련",
    title: "영화·음악·공연을 하나의 문화 장면으로 묶는 법",
    subtitle: "서로 다른 취미 답안을 세 편 외우지 않고 한 번의 문화생활 경험을 묘사·추천·비교 질문으로 이동시키는 워크시트입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "영화, 음악, 공연은 각각의 목록을 말하기보다 누구와 어디서 무엇을 보고 들었는지 한 장면으로 연결할 때 재사용하기 쉽습니다. OOM Culture & City 코스와 이어지는 장면 지도를 제공합니다.",
    image: opicMovieMusicPerformanceStoryMapCover,
    imageAlt: "영화관과 공연, 음악 사진을 하나의 문화 경험으로 고르는 장면",
    takeaway: "작품 정보를 많이 외우기보다 장소·동행·감각·개인적 의미가 있는 한 장면을 준비하면 여러 문화 질문에 자연스럽게 이동할 수 있습니다.",
    disclaimer: "이 글의 질문과 예시는 OOM이 직접 만든 연습 자료이며 실제 OPIc 문항이나 공식 출제 범위를 재현하지 않습니다.",
    creationNote: "ACTFL의 기능·내용·발화구조 기준과 즉흥 발화 준비 조언을 확인하고, OOM Culture & City 코스의 문화 장면을 활용해 예시와 워크시트를 구성했습니다.",
    sources: [magazineSources.actflOpic, magazineSources.actflTestTakerTips],
    sections: [
      {
        heading: "취미 세 개보다 기억나는 밤 하나",
        paragraphs: [
          "영화 제목, 좋아하는 가수, 공연장 특징을 각각 외우면 질문이 바뀔 때 어떤 답을 꺼낼지 선택하는 시간이 길어집니다. 반면 영화 뒤 친구와 음악 이야기를 나누고 근처 작은 공연을 본 한 저녁은 여러 문화 활동이 같은 시간과 장소 안에 있습니다.",
          "장면의 중심은 유명한 작품 정보가 아니라 내가 실제로 한 행동과 느낀 변화입니다. 누구와 갔는지, 무엇이 예상과 달랐는지, 집에 돌아온 뒤 무엇을 다시 찾아봤는지까지 기억하면 소개와 추천, 비교에 쓸 재료가 생깁니다.",
        ],
      },
      {
        heading: "PLACE–PEOPLE–SENSE–MEANING 지도",
        paragraphs: [
          "PLACE에는 영화관이나 공연장의 위치와 분위기, PEOPLE에는 동행과 짧은 상호작용, SENSE에는 실제로 들리거나 보인 한 가지, MEANING에는 그 경험 뒤 취향이 어떻게 달라졌는지를 적습니다. 작품 줄거리는 한두 문장으로만 제한합니다.",
          "네 칸을 모두 말할 필요는 없습니다. 묘사 질문에는 PLACE와 SENSE, 추천 질문에는 SENSE와 MEANING, 과거 경험에는 PEOPLE과 예상 밖 사건을 중심으로 조합합니다.",
        ],
        bullets: [
          "PLACE: 오래된 소극장, 뒷줄 좌석, 역에서 걸은 거리",
          "PEOPLE: 표를 고른 친구, 옆자리 관객, 공연 뒤 나눈 대화",
          "SENSE: 조명이 꺼진 순간, 라이브 악기 소리, 조용해진 객석",
          "MEANING: 이후 영화 음악을 듣는 방식이나 주말 계획이 달라진 점",
        ],
      },
      {
        heading: "한 장면의 강조점만 바꾸기",
        paragraphs: [
          "같은 소극장 경험을 묘사할 때는 공간과 소리를 먼저 보여 주고, 추천할 때는 누구에게 왜 맞는지 말합니다. 과거와 지금을 비교할 때는 예전의 대형 공연 선호와 지금의 작은 공연장 선호 사이에 실제 변화 이유를 둡니다.",
          "질문이 바뀌어도 장소와 사건의 사실관계를 유지하세요. 새 질문마다 더 극적인 일을 추가하면 이야기들이 서로 충돌하고 기억 부담이 다시 커집니다.",
        ],
        example: {
          title: "작은 공연장 장면의 세 입구",
          lines: [
            "Describe: The venue was a small basement theater, so I could hear every instrument clearly even from the back row.",
            "Recommend: I would recommend it to someone who prefers a calm evening because the show felt personal rather than crowded.",
            "Compare: I used to choose large concerts, but that night made me appreciate smaller performances where I could focus on the sound.",
          ],
        },
      },
      {
        heading: "세 질문, 사실 네 개 제한 드릴",
        paragraphs: [
          "PLACE, PEOPLE, SENSE, MEANING 네 사실만 적고 묘사·추천·비교 질문에 차례로 답합니다. 세 번째 답변에서도 새로운 사실을 추가하지 않고 첫 문장과 강조 순서만 바꾸는 것이 규칙입니다.",
          "녹음 뒤에는 세 답변이 같은 저녁으로 들리는지 확인하세요. 고유명사와 화려한 감상이 많아졌지만 행동이 보이지 않는다면 작품 정보 하나를 지우고 실제 움직임 한 문장을 복원합니다.",
        ],
        note: {
          title: "문화 장면 카드",
          text: "네 사실을 유지한 채 DESCRIBE, RECOMMEND, COMPARE 세 번 녹음합니다. 답변마다 새 줄거리나 새 공연을 추가하지 않는 것이 핵심입니다.",
        },
      },
    ],
  },
  {
    id: "opic-shopping-exchange-roleplay",
    category: "롤플레이 훈련",
    title: "쇼핑 교환 롤플레이, 질문 3개와 대안 2개 준비하기",
    subtitle: "여섯 문장을 고정 순서로 외우지 않고 CORE 기능을 먼저 수행한 뒤 필요한 OPTIONAL 기능만 고르는 실전 흐름입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "교환·환불 상황에서 문제 설명, 질문 또는 요청, 다음 행동의 CORE 세 기능을 먼저 세우고 정보 확인, 대안, 마무리의 OPTIONAL 기능을 상황에 맞게 더합니다. OOM의 flexible menu 계약을 실제 쇼핑 장면에 적용합니다.",
    image: opicShoppingExchangeRoleplayCover,
    imageAlt: "매장에서 영수증과 상자를 들고 교환 대안을 묻는 고객",
    takeaway: "롤플레이의 완성도는 여섯 칸을 모두 채우는 데 있지 않고 상대가 문제와 원하는 조치, 다음 행동을 이해하도록 만드는 데 있습니다.",
    disclaimer: "이 예시는 OOM 연습용 상황이며 실제 OPIc 문항을 복원하지 않습니다. 정해진 문장 수나 표현이 특정 등급을 보장하지 않습니다.",
    creationNote: "ACTFL OPIc의 질문·요청 기능과 2024 Speaking Guidelines의 상호작용 과제를 검토하고, OOM CORE 3 + OPTIONAL 3 모델에 맞춰 쇼핑 예시를 구성했습니다.",
    sources: [magazineSources.actflOpic, magazineSources.actflGuidelines],
    sections: [
      {
        heading: "교환 상황의 목적부터 한 줄로 만들기",
        paragraphs: [
          "롤플레이가 길어지는 가장 흔한 이유는 정중한 인사와 배경 설명을 먼저 늘리기 때문입니다. 매장 직원이 바로 도울 수 있도록 무엇을 샀고 어떤 문제가 있으며 무엇을 원하는지를 한 줄로 정하면 답변의 중심이 생깁니다.",
          "문제 원인을 완벽히 설명하지 못해도 제품, 구매 시점, 결함이나 사이즈 문제를 알려 주면 대화를 시작할 수 있습니다. 그 다음 기능은 외운 순서가 아니라 상대에게 아직 필요한 정보에 따라 고릅니다.",
        ],
      },
      {
        heading: "CORE 3개를 먼저, OPTIONAL은 필요한 만큼",
        paragraphs: [
          "CORE는 문제 또는 목적, 질문 또는 요청, 다음 행동입니다. 이 세 기능이 있으면 왜 연락했고 무엇을 원하는지, 이후 무엇을 할지가 들리므로 짧은 답변도 역할 상황을 수행합니다.",
          "OPTIONAL인 정보 확인, 대안 제시, 감사·마무리는 상황이 요구할 때 고릅니다. 이미 가능한 교환 날짜를 들었다면 같은 정보를 다시 묻기보다 대안을 확인하거나 방문 시간을 약속하는 편이 자연스럽습니다.",
        ],
        bullets: [
          "CORE · 문제/목적: The jacket I bought yesterday has a broken zipper.",
          "CORE · 질문/요청: Could I exchange it for the same item in a medium size?",
          "CORE · 다음 행동: If it is available, I can bring the receipt this evening.",
          "OPTIONAL · 정보 질문: Do I need the original packaging?",
          "OPTIONAL · 대안: If that size is sold out, could I receive store credit?",
          "OPTIONAL · 마무리: Thank you. I’ll visit before seven with the item and receipt.",
        ],
      },
      {
        heading: "질문 세 개는 서로 다른 결정을 도와야 합니다",
        paragraphs: [
          "질문 수만 맞추려고 같은 내용을 표현만 바꿔 묻지 마세요. 재고 여부, 준비물, 가능한 처리 방식처럼 서로 다른 다음 결정을 도와주는 질문을 고르면 답변이 실제 대화처럼 진행됩니다.",
          "대안도 두 개면 충분합니다. 같은 제품 교환이 안 될 때 다른 사이즈나 색상, 매장 크레딧처럼 현실적으로 이어질 수 있는 선택을 말하고 상대가 가능한 것을 알려 달라고 요청합니다.",
        ],
        example: {
          title: "교환 통화의 유연한 흐름",
          lines: [
            "I’m calling because the jacket I bought yesterday has a broken zipper.",
            "Could you check whether the same jacket is available in a medium? Also, do I need to bring the original packaging?",
            "If that size is unavailable, store credit would work for me. I can bring the item and receipt after work today.",
          ],
        },
      },
      {
        heading: "기능 카드 섞기 연습",
        paragraphs: [
          "여섯 기능을 각각 카드에 적고 CORE 세 장은 항상 남겨 둡니다. OPTIONAL 세 장 중 한 장만 무작위로 골라 같은 교환 상황에 넣으면, 여섯 문장을 고정 순서로 외우지 않고 필요한 기능을 선택하는 연습이 됩니다.",
          "다음에는 제품과 문제만 바꿉니다. 사이즈, 손상, 잘못 배송된 물건처럼 조건이 달라져도 CORE가 유지되고 OPTIONAL 선택이 달라진다면 공식이 아니라 기능 메뉴를 사용한 것입니다.",
        ],
        note: {
          title: "CORE 보존 규칙",
          text: "OPTIONAL을 모두 빼도 문제/목적, 질문/요청, 다음 행동이 들려야 합니다. 세 기능 중 하나가 빠지면 정중한 표현을 더하기 전에 CORE부터 복원하세요.",
        },
      },
    ],
  },
  {
    id: "opic-park-walking-hiking-answer-map",
    category: "주제 훈련",
    title: "공원·걷기·하이킹, 루틴과 기억에 남는 경험 분리하기",
    subtitle: "같은 장소를 반복 행동과 한 번의 사건으로 나누어 질문 기능에 맞는 두 개의 답변 축을 만드는 방법입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "공원과 걷기 주제에서 매번 같은 산책 설명만 반복하지 않도록 ROUTINE과 EVENT를 두 열로 나눕니다. OOM Culture & City와 Nature & Weekend 코스에서 같은 장소를 충돌 없이 재사용할 수 있습니다.",
    image: opicParkWalkingHikingAnswerMapCover,
    imageAlt: "도시 공원 산책로와 숲길 사이에서 다음 길을 고르는 학습자",
    takeaway: "장소는 하나여도 반복 행동과 한 번의 사건을 분리하면 루틴 질문과 과거 경험 질문에 각각 직접 답할 수 있습니다.",
    disclaimer: "이 글의 소재와 질문 변형은 OOM이 만든 연습 예시이며 실제 OPIc 문항 목록이나 출제 빈도를 의미하지 않습니다.",
    creationNote: "ACTFL Speaking Guidelines의 익숙한 주제·서술 기능과 공식 수험자 즉흥 발화 조언을 확인하고, OOM 두 코스의 야외 장면을 활용해 ROUTINE/EVENT 지도를 구성했습니다.",
    sources: [magazineSources.actflGuidelines, magazineSources.actflTestTakerTips],
    sections: [
      {
        heading: "같은 공원 답변이 모든 질문에 맞지는 않습니다",
        paragraphs: [
          "평소 산책하는 순서를 잘 준비해도 ‘가장 기억에 남는 하이킹’을 물으면 반복 행동만으로는 사건이 생기지 않습니다. 반대로 비가 왔던 한 번의 경험만 외우면 보통 무엇을 하는지 묻는 질문에서 특별한 날만 말하게 됩니다.",
          "장소와 기본 인물은 유지하되 ROUTINE과 EVENT를 다른 정보 묶음으로 보관하세요. 두 축이 분리되면 질문을 들은 뒤 어떤 장면을 열지 빠르게 결정할 수 있습니다.",
        ],
      },
      {
        heading: "ROUTINE과 EVENT 두 열 지도",
        paragraphs: [
          "ROUTINE 열에는 언제 출발하고 어느 길을 걸으며 무엇으로 마무리하는지 적습니다. EVENT 열에는 구체적인 날짜나 계기, 예상 밖 변화, 대응, 결과를 적어 시간 순서가 있는 한 번의 이야기로 만듭니다.",
          "두 열은 공통 사실 두 개만 공유합니다. 예를 들어 같은 강변 공원과 같은 친구는 유지하되, 루틴에는 반복 순서를, 사건에는 갑작스러운 길 폐쇄와 우회 경험을 넣습니다.",
        ],
        bullets: [
          "공통 앵커: 강변 공원 / 대학 친구",
          "ROUTINE: 토요일 아침 / 짧은 순환로 / 벤치에서 물 마시기",
          "EVENT: 지난가을 / 길 폐쇄 / 안내판을 따라 숲길로 우회",
          "금지: 루틴 답변에 사건 세 개를 이어 붙이거나 사건 답변을 ‘usually’로 시작하기",
        ],
      },
      {
        heading: "첫 문장으로 축을 고정하기",
        paragraphs: [
          "첫 문장에 빈도를 넣으면 ROUTINE, 특정 시점을 넣으면 EVENT가 됩니다. 이후 같은 장소 묘사를 사용해도 청자는 반복되는 습관인지 한 번의 사건인지 기준을 잃지 않습니다.",
          "비교 질문이라면 두 열을 섞는 대신 예전 루틴과 지금 루틴을 나란히 둡니다. 한 번의 사건이 루틴을 바꿨다면 EVENT를 변화 이유로 한 문장만 사용하세요.",
        ],
        example: {
          title: "같은 공원의 두 답변",
          lines: [
            "Routine: Most Saturday mornings, my friend and I follow the short riverside loop and take a break near the old wooden bench.",
            "Event: Last fall, that loop was suddenly closed, so we followed a temporary sign and discovered a quieter forest path.",
            "Change: Since that day, we sometimes choose the forest path when the main trail is crowded.",
          ],
        },
      },
      {
        heading: "두 열 교차 검수",
        paragraphs: [
          "루틴 질문과 과거 경험 질문을 연달아 녹음하고, 첫 15초만 서로 바꿔 재생해 보세요. 어느 질문에 대한 답인지 구분되지 않는다면 빈도나 특정 시점, 사건의 변화가 충분히 드러나지 않은 것입니다.",
          "마지막에는 공원 대신 동네 걷기나 짧은 하이킹으로 장소만 교체합니다. 구조는 유지하되 실제 경험의 사실을 새로 적어야 과도한 범용 스크립트가 되지 않습니다.",
        ],
        note: {
          title: "15초 식별 테스트",
          text: "답변 첫 15초만 듣고 ROUTINE인지 EVENT인지 바로 구분할 수 있어야 합니다. 구분이 안 되면 빈도 또는 특정 시점을 첫 문장에 복원하세요.",
        },
      },
    ],
  },
  {
    id: "opic-camping-weather-problem-solution",
    category: "주제 훈련",
    title: "캠핑 중 날씨가 바뀌었을 때 문제 해결 스토리",
    subtitle: "큰 사고를 꾸며내지 않고 날씨 변화, 선택지, 행동, 결과를 한 줄씩 연결하는 야외 경험 decision tree입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "캠핑과 해변, 드라이브 장면은 날씨 변화 하나만으로도 문제 해결 질문에 확장할 수 있습니다. 실제 경험 범위 안에서 두 대안을 비교하고 선택 결과까지 말하는 OOM Nature & Weekend 연습입니다.",
    image: opicCampingWeatherProblemSolutionCover,
    imageAlt: "비 오는 캠핑장에서 타프를 고정하고 장비를 옮기는 두 사람",
    takeaway: "좋은 문제 해결 이야기는 문제가 크기 때문이 아니라 선택 이유와 다음 행동이 분명해서 따라가기 쉽습니다.",
    disclaimer: "예시는 OOM이 직접 만든 연습 장면이며 실제 OPIc 기출을 재현하지 않습니다. 과장된 사건을 추가하거나 답안을 암기할 필요가 없습니다.",
    creationNote: "ACTFL 2024 Speaking Guidelines의 과거 서술·문제 처리 기능과 OPIc Function 기준을 검토하고, OOM Nature & Weekend 코스에 맞는 decision tree를 구성했습니다.",
    sources: [magazineSources.actflGuidelines, magazineSources.actflOpic],
    sections: [
      {
        heading: "문제보다 선택이 보여야 합니다",
        paragraphs: [
          "갑자기 비가 왔다고 말한 뒤 ‘그래서 힘들었다’로 끝내면 사건은 있지만 해결 기능은 약합니다. 비가 텐트 설치, 저녁 식사, 이동 계획 중 무엇을 바꾸었고 어떤 선택지가 있었는지를 보여 줘야 다음 행동이 자연스럽습니다.",
          "태풍이나 위험한 사고를 새로 만들 필요는 없습니다. 젖은 장작, 닫힌 산책로, 강해진 바람처럼 실제로 대응 가능한 작은 문제가 선택과 결과를 설명하기 더 쉽습니다.",
        ],
      },
      {
        heading: "WEATHER–IMPACT–OPTIONS–ACTION 트리",
        paragraphs: [
          "WEATHER에는 관찰한 변화, IMPACT에는 원래 계획에서 막힌 한 가지, OPTIONS에는 가능한 대안 두 개, ACTION에는 고른 이유와 결과를 적습니다. 감정은 결과 뒤에 한 문장으로 붙입니다.",
          "대안은 실제로 비교 가능한 것이어야 합니다. 비가 오는 상황에서 캠핑을 계속할지 실내 숙소로 이동할지, 야외 요리를 포기하고 근처 식당에 갈지처럼 시간과 안전, 비용 중 한 기준을 사용합니다.",
        ],
        bullets: [
          "WEATHER: 바람이 강해지고 비가 예상보다 일찍 시작됨",
          "IMPACT: 불을 피울 수 없어 저녁 준비가 멈춤",
          "OPTIONS: 차에서 기다리기 / 근처 작은 식당으로 이동하기",
          "ACTION: 안전하고 시간을 아끼는 식당을 선택한 뒤 텐트를 다시 점검함",
        ],
      },
      {
        heading: "원인과 행동 사이를 건너뛰지 않기",
        paragraphs: [
          "문제에서 곧바로 행복한 결과로 이동하면 해결 과정이 들리지 않습니다. 함께 있던 사람과 무엇을 확인했고, 대안 중 하나를 왜 포기했으며, 선택 후 원래 계획을 어떻게 조정했는지 한두 문장으로 연결합니다.",
          "모든 세부사항을 말하려 하지 마세요. 해결과 무관한 캠핑 장비 목록은 줄이고, 결정 기준과 실제 행동에 시간을 사용하면 질문 기능이 더 선명합니다.",
        ],
        example: {
          title: "비 오는 캠핑의 결정 흐름",
          lines: [
            "The rain started much earlier than expected, and the wind made it unsafe to cook outside.",
            "We could wait in the car or find a nearby restaurant, so we checked the forecast and chose the restaurant because the rain was expected to continue.",
            "After dinner, we returned, secured the tent again, and moved our morning hike to the next day.",
          ],
        },
      },
      {
        heading: "대안 한 칸 바꾸기 드릴",
        paragraphs: [
          "같은 날씨와 영향을 유지한 채 OPTIONS 중 하나만 바꾸어 다시 말합니다. 식당 대신 포장 음식을 고르거나 산책 대신 박물관을 선택하면, 외운 사건을 반복하지 않고 결정 언어를 연습할 수 있습니다.",
          "재녹음 뒤에는 두 답변의 사실이 충돌하지 않는지 봅니다. 하나의 canonical scene을 유지하고 새 질문에 필요한 최소 사실만 바꾸는 것이 OOM 변형 훈련의 핵심입니다.",
        ],
        note: {
          title: "두 대안 규칙",
          text: "선택지는 두 개까지만 만들고, 비용·시간·안전 중 한 기준으로 고릅니다. 결과보다 선택 이유가 먼저 들리게 녹음하세요.",
        },
      },
    ],
  },
  {
    id: "opic-museum-photo-reading-guide",
    category: "주제 훈련",
    title: "박물관·사진·독서 주제에서 취향과 근거 말하기",
    subtitle: "‘interesting’만 반복하지 않고 관찰한 한 가지와 개인적 의미를 연결해 의견을 설명하는 방법입니다.",
    date: "2026.10.09",
    publishedAt: "2026-10-09",
    modifiedAt: "2026-10-09",
    readMinutes: "8분 읽기",
    summary: "문화 취향 질문은 작품 정보를 많이 아는지보다 내가 무엇을 보고 어떻게 반응했는지를 구체적으로 말할 때 선명해집니다. CLAIM–EVIDENCE–MEANING 세 칸으로 박물관, 사진, 독서 장면을 설계합니다.",
    image: opicMuseumPhotoReadingGuideCover,
    imageAlt: "박물관에서 사진집과 벽면 작품을 비교해 보는 관람객",
    takeaway: "취향은 형용사 목록이 아니라 관찰한 근거와 그 경험이 내 행동을 어떻게 바꾸었는지 말할 때 설득력을 얻습니다.",
    disclaimer: "작품명과 문화 정보는 답변 재료일 뿐이며 이 글의 예시는 공식 OPIc 문항이나 평가 답안을 의미하지 않습니다.",
    creationNote: "ACTFL OPIc의 의견·설명 기능과 공식 즉흥 발화 준비 조언을 검토하고, OOM Nature & Weekend 문화 장면을 활용한 CLAIM–EVIDENCE–MEANING 도구를 구성했습니다.",
    sources: [magazineSources.actflOpic, magazineSources.actflTestTakerTips],
    sections: [
      {
        heading: "취향 형용사 뒤에 관찰을 붙이기",
        paragraphs: [
          "박물관이 interesting했고 책이 amazing했다고만 말하면 감정은 전달되지만 왜 그런지 청자가 볼 수 없습니다. 전시실의 조명, 사진 속 반복된 색, 책의 한 장면처럼 내가 실제로 관찰한 한 가지가 필요합니다.",
          "전문 지식을 설명할 필요는 없습니다. 작품의 시대나 작가 정보를 정확히 모른다면 억지로 말하지 말고, 무엇이 눈에 들어왔고 그 때문에 어디에 더 오래 머물렀는지를 자신의 경험으로 설명하세요.",
        ],
      },
      {
        heading: "CLAIM–EVIDENCE–MEANING 세 칸",
        paragraphs: [
          "CLAIM은 무엇을 좋아하거나 추천하는지, EVIDENCE는 현장에서 관찰한 구체적 사실, MEANING은 그 관찰이 내 생각이나 다음 행동을 어떻게 바꾸었는지를 담습니다. 세 칸이면 단순 감상을 짧은 의견 단락으로 확장할 수 있습니다.",
          "박물관, 사진, 독서는 서로 다른 주제지만 같은 도구를 사용할 수 있습니다. 다만 관찰 근거는 각 장면에 맞게 새로 적어야 하며 ‘분위기가 좋았다’ 같은 범용 문장을 세 글에 반복하지 않습니다.",
        ],
        bullets: [
          "CLAIM: 작은 사진전을 대형 박물관보다 더 좋아한다",
          "EVIDENCE: 같은 거리의 아침과 밤을 찍은 두 사진을 나란히 오래 봤다",
          "MEANING: 이후 동네를 걸을 때 빛과 시간의 변화를 더 주의 깊게 보게 됐다",
          "검토: 작품 지식이 아니라 내 관찰과 행동이 답변의 중심인가",
        ],
      },
      {
        heading: "추천 답변에 대상과 이유 넣기",
        paragraphs: [
          "모든 사람에게 좋다고 말하기보다 조용히 관찰하는 시간을 좋아하는 사람처럼 추천 대상을 정합니다. 그 사람이 좋아할 구체적 요소와 방문하거나 읽기 좋은 상황을 붙이면 의견이 실제 조언으로 바뀝니다.",
          "반대 취향도 짧게 인정할 수 있습니다. 빠른 활동을 원하는 사람에게는 맞지 않을 수 있지만 사진이나 공간의 세부를 천천히 보는 사람에게는 좋다는 식으로 맥락을 좁히세요.",
        ],
        example: {
          title: "사진전 추천의 근거",
          lines: [
            "I would recommend the exhibition to someone who enjoys noticing small changes in familiar places.",
            "Two photos showed the same street in the morning and at night, and I spent several minutes comparing the light and the people.",
            "After that visit, I started taking slower walks and paying more attention to my own neighborhood.",
          ],
        },
      },
      {
        heading: "형용사 교체가 아닌 근거 추가 드릴",
        paragraphs: [
          "interesting, beautiful, relaxing에 밑줄을 긋고 더 어려운 형용사로 바꾸지 마세요. 각 형용사 뒤에 ‘무엇을 보고 그렇게 느꼈는가’라는 근거 문장을 한 개 추가합니다.",
          "두 번째 녹음에서는 형용사를 아예 빼고 관찰과 행동만 말해 봅니다. 듣는 사람이 같은 감정을 추론할 수 있다면 구체성이 형용사 역할을 대신한 것입니다.",
        ],
        note: {
          title: "형용사 없는 45초",
          text: "좋다·흥미롭다·편안하다는 평가어를 쓰지 않고 관찰, 머문 행동, 이후 변화만 45초 동안 말하세요. 마지막 재녹음에서 필요한 형용사 하나만 되돌립니다.",
        },
      },
    ],
  },
  {
    id: "opic-actual-exam-screen-ui-guide",
    category: "시험 구조",
    title: "오픽 실제 시험 화면 완벽 해부: EVA 인터페이스와 다시듣기·Next 버튼 조작법",
    subtitle: "시험장 모니터 앞에서 당황하지 않도록 가상 인터뷰어 화면 구성, 2회 청취 타이밍, 마이크 녹음 게이지와 Next 이동 기준을 순서대로 정리했습니다.",
    date: "2026.11.08",
    publishedAt: "2026-11-08",
    modifiedAt: "2026-11-08",
    readMinutes: "8분 읽기",
    summary: "오픽(OPIc) 실제 시험 화면에는 영어 질문 자막이 표시되지 않으며, 1차 청취 종료 후 제한된 시간 안에만 다시듣기 버튼을 누를 수 있습니다. 시험 당일 화면 구조와 4가지 핵심 조작 포인트를 실전 흐름대로 안내합니다.",
    image: opicActualExamScreenUiGuideCover,
    imageAlt: "OPIc 실제 시험 화면의 가상 인터뷰어 EVA 영역, 2회 청취 재생 바, 레코딩 게이지, Next 버튼 배치를 보여주는 인터페이스 도식",
    takeaway: "시험 화면 조작의 핵심은 ‘자막 없이 귀로 첫 동사와 시제를 잡고, 2차 청취 여부를 3초 안에 결정하며, 문항별 시계에 쫓기지 않고 내 호흡대로 Next를 누르는 것’입니다.",
    disclaimer: "본 가이드는 공개된 OPIc 수험자 가이드와 응시자 유의사항을 바탕으로 재구성한 학습용 도식이며, 응시 시점이나 센터 환경에 따라 세부 버튼 디자인은 달라질 수 있습니다.",
    creationNote: "한국 OPIc 공식 수험자 가이드의 본시험 화면 구성 안내와 ACTFL OPIc Familiarization Guide의 문항 진행·청취 규칙을 교차 검증하여 수험자용 조작 체크리스트로 구성했습니다.",
    sources: [magazineSources.opicCandidateGuide, magazineSources.actflFamiliarization, magazineSources.opicCandidateNotice],
    sections: [
      {
        heading: "1. 오픽 실제 시험 화면에 ‘있는 것’과 ‘없는 것’",
        paragraphs: [
          "처음 오픽 시험장에 들어간 수험자가 가장 크게 당황하는 지점은 화면 어디에도 영어 질문 텍스트(자막)가 나오지 않는다는 사실입니다. 화면 중앙에는 가상 인터뷰어(EVA) 영상이 배치되고, 상단에는 문항 번호(1~15번), 하단에는 재생 버튼과 녹음 상태 표시줄, 우측 하단에 Next 버튼만 놓여 있습니다.",
          "또한 토익스피킹처럼 문항마다 ‘45초 남음’ 같은 강제 카운트다운 타이머가 크게 줄어들지 않습니다. 전체 시험 시간 약 40분 안에서 수험자가 각 문항의 답변 길이를 자율적으로 조절하고 스스로 Next 버튼을 눌러 다음 문항으로 넘어가는 구조입니다.",
        ],
        bullets: [
          "상단 진행 표시줄: 현재 문항 번호(보통 1~15번)와 진행 위치 표시",
          "중앙 EVA 인터뷰어 영역: 영상과 음성으로만 질문 제시 (영어 자막 없음)",
          "하단 청취 컨트롤: Play/Replay 버튼 및 청취 횟수(최대 2회) 표시",
          "우측 하단 Next 버튼: 최소 녹음 시간이 지난 뒤 활성화되며 클릭 시 다음 문항 이동",
        ],
      },
      {
        heading: "2. 다시듣기(Replay) 버튼의 골든타임 5초",
        paragraphs: [
          "모든 질문은 최대 두 번까지 들을 수 있습니다. 첫 번째 질문 재생이 끝나면 짧은 대기 구간 동안 Play 버튼이 깜빡이며 다시듣기 기회가 열리는데, 이때 망설이다가 시간이 지나면 자동으로 녹음(Recording) 상태가 시작됩니다.",
          "일단 Recording 표시등이 켜진 뒤에는 질문을 다시 들을 수 없습니다. 따라서 1차 청취를 할 때 질문 전체를 완벽히 해석하려 하기보다 ‘무엇을(명사)’, ‘어느 시제로(현재 루틴 vs 과거 경험 vs 롤플레이 요청)’ 묻는지만 먼저 잡아야 합니다. 만약 두 번째 문장이나 질문 의도를 놓쳤다면 1차 음성이 끝나자마자 지체 없이 Replay를 눌러 두 번째 청취 시간을 확보하세요.",
        ],
        example: {
          title: "1차 청취 직후 3초 판단 기준",
          description: "질문 음성이 끝나는 순간 아래 세 가지만 확인하고 바로 결정합니다.",
          lines: [
            "즉시 답변 시작: 주제(예: 자주 가는 공원)와 시제(현재 루틴)가 둘 다 선명하게 들렸을 때",
            "즉시 Replay 클릭: 주제는 들렸지만 ‘처음 계기’인지 ‘최근 사건’인지 끝부분 의문사가 헷갈릴 때",
            "2차 청취 중 할 일: 첫 문장 도입부(“I usually go to...”)를 머릿속에 고정해 녹음 시작과 동시에 첫마디가 나가게 준비",
          ],
        },
      },
      {
        heading: "3. Recording 레벨 게이지와 Next 버튼 활성화 규칙",
        paragraphs: [
          "녹음이 시작되면 화면 하단에 Recording 표시와 함께 내 목소리 크기에 반응하는 마이크 레벨 게이지가 움직입니다. 간혹 긴장해서 마이크가 입에서 너무 멀어지거나 손으로 마이크를 건드리면 게이지가 거의 움직이지 않거나 붉은색으로 튈 수 있으므로, 첫 문장을 말할 때 게이지가 정상적으로 반응하는지 눈으로 한 번 확인하는 습관이 안전합니다.",
          "답변을 시작하고 첫 몇 초 동안은 우측 하단 Next 버튼이 비활성화되어 있다가 일정 시간이 지나면 누를 수 있는 상태로 바뀝니다. 할 말이 일찍 끝났더라도 마지막 마무리 문장(“That’s why I really enjoy spending time there.”)을 또렷하게 말한 뒤 1초 정도 호흡을 두고 Next를 누르면 답변 끝부분이 잘리는 현상을 예방할 수 있습니다.",
        ],
      },
      {
        heading: "4. 7번 문항 이후 난이도 재조정(Self-Assessment Adjust) 화면",
        paragraphs: [
          "초반 세션(보통 7번 문항)이 끝나면 중간에 난이도를 유지할지, 한 단계 낮추거나 높일지 묻는 선택 화면이 한 번 더 나타납니다. 이 화면은 앞선 답변이 채점되어 감점되었다는 뜻이 아니라, 수험자가 체감한 질문 수준을 스스로 점검하라는 표준 절차입니다.",
          "앞선 1~7번 질문의 의도를 대체로 알아들었고 준비한 장면으로 답변을 이어 갔다면 그대로 ‘비슷한 수준 유지’를 고르는 편이 흐름을 지키는 데 유리합니다. 오픽온미의 STEP 6 실전 모의고사 화면에서 이 전체 UI 흐름을 시험 전 최소 두 번 이상 그대로 연습해 두면 시험장 모니터가 훨씬 익숙하게 느껴집니다.",
        ],
        note: {
          title: "시험장 화면 적응 3분 루틴",
          text: "오픽온미의 ‘시험 화면 · 조작법(/exam-guide/screen/)’ 도식을 먼저 읽고, 곧바로 ‘STEP 6 실전 연습(/practice/)’에서 질문 2회 청취 → 녹음 게이지 확인 → Next 클릭 순서를 손에 익히세요.",
        },
      },
    ],
  },
  {
    id: "opic-2026-survey-12-items-strategy",
    category: "시험 전략",
    title: "2026 오픽 서베이 항목 추천: 돌발 질문을 줄이는 12개 선택 조합과 기출 연결법",
    subtitle: "선택지를 무조건 줄이려다 낯선 주제를 고르는 대신, 4개의 핵심 스토리 블록으로 12개 이상의 서베이 항목을 안전하게 묶는 방법입니다.",
    date: "2026.11.08",
    publishedAt: "2026-11-08",
    modifiedAt: "2026-11-08",
    readMinutes: "8분 읽기",
    summary: "오픽(OPIc) Background Survey는 최소 선택 개수를 채워야 다음 단계로 넘어갑니다. 12개 항목을 낱개로 외우지 않고 일상 산책, 실내 여가, 주거 공간, 카페·근교 외출의 4개 장면으로 통합하는 2026 서베이 전략을 정리했습니다.",
    image: opic2026Survey12ItemsStrategyCover,
    imageAlt: "오픽 서베이 12개 선택 항목을 일상 산책, 실내 미디어, 주거 공간, 카페 외출의 4개 공통 장면 블록으로 묶은 전략 매트릭스",
    takeaway: "서베이 전략의 목적은 선택지 개수를 줄이는 것이 아니라, 어떤 항목이 출제되더라도 내가 미리 다듬어 둔 4개의 핵심 장면(Canonical Scene) 안에서 답이 나가도록 연결망을 만드는 것입니다.",
    disclaimer: "설문 선택 항목의 최소 기준과 세부 명칭은 응시 시점의 공식 OPIc 화면을 따릅니다. 본 조합은 학습 부담을 줄이기 위한 OOM 권장 예시이며 특정 문제 출제를 보장하지 않습니다.",
    creationNote: "한국 OPIc 공식 수험자 가이드의 Background Survey 진행 원칙과 오픽온미 STEP 2 추천 서베이 코스의 장면 재사용 설계를 결합해 12개 선택지 통합 가이드를 작성했습니다.",
    sources: [magazineSources.opicCandidateGuide, magazineSources.opicOverview, magazineSources.actflTestTakerTips],
    sections: [
      {
        heading: "1. 왜 ‘남들이 추천하는 12개’를 그대로 베끼면 막힐까",
        paragraphs: [
          "검색창에서 ‘2026 오픽 서베이 추천’을 찾아 체크리스트만 그대로 외워 가면, 시험장에서 막상 내가 거의 해 본 적 없는 항목이 나왔을 때 첫 문장부터 말문이 막힙니다. 예를 들어 콘서트에 가 본 기억이 가물가물한데 추천 목록에 있다는 이유로 고르면, 최근 경험이나 돌발 문제 해결 질문에서 디테일을 이어 가기 어렵습니다.",
          "좋은 서베이 조합은 항목 이름이 무난한지가 아니라 ‘서로 다른 항목이 나와도 같은 공간과 인물, 감정 표현을 돌려쓸 수 있는가’로 결정됩니다. 선택지는 12개 이상을 체크하더라도 내 머릿속의 배경 세트는 4개만 유지하는 것이 오픽온미 서베이 설계의 출발점입니다.",
        ],
      },
      {
        heading: "2. 12개 선택지를 4개 핵심 장면으로 압축하는 매트릭스",
        paragraphs: [
          "직업·학생 여부와 거주 형태를 고른 뒤 여가·취미·운동·휴가 항목을 고를 때는 아래 네 가지 장면 블록을 기준으로 묶어 보세요. 각 블록 안에 속한 3~4개의 선택지는 질문 간판만 다를 뿐 실제로 묘사할 장소와 행동이 거의 겹칩니다.",
          "이렇게 묶어 두면 ‘공원 가기’가 나오든 ‘걷기’가 나오든 똑같이 집 근처 나무 벤치와 주말 아침 공기를 묘사할 수 있고, ‘집에서 보내는 휴가’가 나오든 ‘TV 시청’이 나오든 거실 소파와 금요일 저녁 휴식 루틴으로 자연스럽게 연결할 수 있습니다.",
        ],
        bullets: [
          "블록 1 (동네 산책·야외): 공원 가기 + 산책/걷기 + 조깅 + 운동 안 함 → ‘집 근처 공원 트랙과 주말 아침 환기’ 장면 하나로 통합",
          "블록 2 (실내 미디어·문화): 영화 보기 + 음악 감상하기 + TV/영상 시청 → ‘금요일 밤 거실/극장에서 스트레스 푸는 루틴’으로 통합",
          "블록 3 (집·주거 일상): 개인주택/아파트 거주 + 집에서 보내는 휴가 + 요리/집안일 → ‘가장 좋아하는 방과 작은 인테리어 변화’로 통합",
          "블록 4 (카페·근교 이동): 카페/커피전문점 + 국내 여행 + 쇼핑하기 → ‘단골 동네 카페와 주말 반나절 나들이’로 통합",
        ],
      },
      {
        heading: "3. 기출 빈출 4대 질문 패턴에 한 장면 돌려쓰기",
        paragraphs: [
          "오픽에서 서베이 주제가 선택되면 보통 세 문제짜리 콤보(Combo) 세트로 이어집니다. 첫 문제는 장소나 평소 습관 묘사, 두 번째는 처음 시작하게 된 계기나 과거의 인상 깊은 경험, 세 번째는 최근에 겪은 작은 문제나 변화 질문이 자주 결합됩니다.",
          "따라서 서베이 항목을 고를 때는 각 블록마다 ‘평소 루틴 1개 + 작은 사건 1개’만 짝지어 두면 충분합니다. 예를 들어 야외 블록에서는 ‘갑자기 비가 내려 근처 카페로 피신했던 일’, 실내 미디어 블록에서는 ‘모바일 예매 날짜를 착각해 시간을 바꿨던 일’처럼 소소하고 현실적인 사건 하나가 여러 항목의 과거 경험 질문을 동시에 방어해 줍니다.",
        ],
        example: {
          title: "하나의 카페·산책 장면으로 3개 서베이 항목 방어하기",
          description: "질문 주제가 바뀌어도 첫 문장의 키워드만 교체하고 중심 묘사는 그대로 유지합니다.",
          lines: [
            "공원 질문: Whenever I have free time on weekends, I walk to a small riverside park near my apartment.",
            "걷기/운동 질문: Walking is my favorite way to stay healthy because I can clear my head along the riverside trail.",
            "음악 감상 질문: I always put on my wireless earbuds and listen to acoustic playlists while walking along that park trail.",
          ],
        },
      },
      {
        heading: "4. 서베이 선택과 돌발 질문의 관계를 오해하지 않기",
        paragraphs: [
          "많은 수험자가 서베이를 특정 조합으로 맞추면 돌발 질문(비서베이 주제)이 아예 사라진다고 기대하지만, 실제 오픽에서는 수험자의 적응력을 보기 위해 설문과 무관한 일상 주제(날씨, 교통, 건강, 재활용, 약속 변경 등)가 일부 섞여 나올 수 있습니다.",
          "오히려 서베이 12개 항목을 4개 핵심 블록으로 단단히 고정해 두면, 돌발 질문이 나왔을 때도 당황하지 않고 이미 입에 익은 동네 공원, 거실, 단골 카페 장면으로 끌어당겨 답할 여유가 생깁니다. 지금 오픽온미 STEP 2 추천 서베이 화면에서 나만의 12개 조합을 직접 체크해 보고, 각 항목 옆에 연결할 핵심 장면 이름을 한 단어로 적어 보세요.",
        ],
        note: {
          title: "서베이 확정 전 1분 점검",
          text: "고른 12개 항목을 보며 ‘이 항목이 나오면 4개 핵심 장면 중 어디로 연결할지’ 3초 안에 대답할 수 있는지 확인하세요. 연결할 장면이 없는 외톨이 항목은 과감히 같은 블록의 다른 항목으로 교체합니다.",
        },
      },
    ],
  },
];

const aiInnovationMagazineArticles: MagazineArticleDraft[] = [
  {
    id: "opic-smart-glasses-exam-security-rules",
    category: "시험 전략",
    title: "스마트 글래스(AI 안경) 착용과 2026 오픽 시험장 보안 규정: 안경 검사 절차와 수험생 주의사항",
    subtitle: "카메라·마이크 탑재 AI 안경 대중화로 엄격해진 시험장 전자기기 점검, 시력 교정용 일반 안경과의 구분 기준과 시험 당일 리스크를 없애는 체크리스트입니다.",
    date: "2026.11.21",
    publishedAt: "2026-11-21",
    modifiedAt: "2026-11-21",
    readMinutes: "8분 읽기",
    summary: "최근 카메라와 AI 마이크가 장착된 스마트 글래스가 보급되면서 OPIc 및 각종 공인어학시험장의 안경 및 웨어러블 검사가 크게 강화되었습니다. 일반 시력 교정 안경 착용 시 확인 절차, 스마트 안경 반입 금지 기준, 시험 중 불필요한 오해를 피하는 실전 주의사항을 정리했습니다.",
    image: opicSmartGlassesExamSecurityRulesCover,
    imageAlt: "오픽 시험장 입실 전 감독관이 시력 교정용 일반 안경의 힌지와 테를 확인하고 웨어러블 전자기기 반입 금지 규정을 안내하는 체크인 데스크 장면",
    takeaway: "안경을 착용하는 수험자는 시험장에 테가 지나치게 두껍지 않은 여분의 일반 안경을 지참하고, 모든 전자기기를 가방에 보관하여 시험 전 불필요한 실랑이와 멘탈 흔들림을 원천 차단해야 합니다.",
    disclaimer: "본 가이드는 공인 어학시험 주관사(ACTFL 및 한국 OPIc)의 전자기기 부정행위 방지 지침 및 시험장 유의사항을 종합한 안내이며, 구체적인 현장 점검 방식은 고사장 감독관의 재량과 지침에 따릅니다.",
    creationNote: "최근 웨어러블 디바이스 및 스마트 글래스 관련 수험자 문의와 공인 어학시험장의 강화된 부정행위 방지 절차를 확인하여, 안경 착용 수험생이 안심하고 시험에 집중할 수 있는 4단계 가이드로 구성했습니다.",
    sources: [magazineSources.opicCandidateNotice, magazineSources.opicCandidateGuide, magazineSources.actflFamiliarization],
    sections: [
      {
        heading: "1. 스마트 글래스 대중화와 시험장 보안 강화 배경",
        paragraphs: [
          "최근 카메라, 초소형 마이크, 골전도 스피커 및 생성형 AI 통신 기능이 내장된 스마트 글래스(Smart Glasses)가 일상적으로 보급되면서, 전 세계 공인 어학시험 주관사들의 부정행위 방지 가이드라인도 빠르게 개정되고 있습니다.",
          "OPIc 시험은 컴퓨터 모니터를 보며 구두로 답변을 녹음하는 방식이기 때문에, 시각 정보 캡처나 실시간 음성 프롬프트를 수신할 수 있는 모든 웨어러블 기기의 시험실 반입이 엄격히 금지됩니다. 이에 따라 고사장 입실 전 본인 확인 단계에서 안경 테와 힌지 부분을 직접 확인하는 절차가 표준화되었습니다.",
        ],
        bullets: [
          "반입 금지 대상: 카메라, 마이크, 블루투스 모듈, 배터리가 탑재된 모든 형태의 스마트 안경 및 오디오 프레임",
          "허용 대상: 전자 회로가 전혀 없는 순수 시력 교정용 일반 도수 안경 및 무도수 보호 안경",
          "검사 범위: 안경 림(Rim) 상단의 렌즈 구멍 여부, 템플(안경다리)의 비정상적인 두께, 힌지 내부 충전 접점 유무",
        ],
      },
      {
        heading: "2. 고사장 입실 시 안경 점검 절차와 수험생 대응법",
        paragraphs: [
          "고사장에 도착하여 신분증 확인을 진행할 때, 감독관이 안경을 벗어서 앞뒷면을 보여 달라고 요청할 수 있습니다. 이는 특정 수험생을 의심하는 것이 아니라 모든 안경 착용 수험생을 대상으로 진행되는 표준 보안 프로토콜입니다.",
          "만약 착용 중인 안경의 다리(템플) 부분이 디자인상 다소 두껍거나 뿔테가 묵직한 경우, 추가적인 육안 검사나 금속 탐지기 스캔이 진행될 수 있습니다. 이때 당황하거나 불쾌해하지 않고 감독관의 안내에 침착하게 응하는 것이 시험 전 집중력을 유지하는 비결입니다.",
        ],
        example: {
          title: "시험 당일 안경 선택 및 점검 체크리스트",
          description: "시험장 가기 전 가방 속 소지품과 안경 상태를 미리 점검합니다.",
          lines: [
            "추천 안경: 테 내부가 훤히 보이는 얇은 메탈 프레임이나 투명 아세테이트 안경 착용",
            "주의 안경: 템플 안쪽에 블루투스 스피커나 터치 센서가 들어갈 법한 볼륨감 있는 두꺼운 뿔테 지양",
            "예비 대비: 혹시 모를 현장 오해나 분실에 대비해 도수가 맞는 단순한 보조 안경을 가방에 지참",
          ],
        },
      },
      {
        heading: "3. 시험 중 불필요한 오해를 피하는 행동 요령",
        paragraphs: [
          "시험 중 헤드폰을 착용한 상태에서 안경테를 만지작거리거나, 관자놀이 부근을 지속적으로 톡톡 치는 행동, 안경다리를 귀 뒤로 반복해서 고쳐 쓰는 동작은 시험실 감독관이나 사후 모니터링 과정에서 불필요한 주의 대상이 될 수 있습니다.",
          "오픽 시험은 각 좌석마다 파티션이 쳐져 있지만 고사장 전체를 조망하는 CCTV와 순회 감독관이 상시 감시하고 있습니다. 답변 중 긴장되어 손을 얼굴로 가져가는 습관이 있다면, 양손을 키보드 앞 책상 위에 편안하게 내려놓고 발화에만 집중하는 습관을 들이는 것이 안전합니다.",
        ],
        bullets: [
          "귀 주변 및 관자놀이 만지기 금지: 골전도 리시버나 터치패드 조작으로 오인될 수 있는 손동작 자제",
          "안경 벗었다 쓰기 반복 금지: 렌즈를 카메라 앵글처럼 모니터 쪽으로 기울이는 부자연스러운 행동 방지",
          "헤드폰 밀착 착용: 귀 전체를 덮는 제공 헤드셋을 정위치에 착용하여 이어폰 미착용 상태 증명",
        ],
      },
      {
        heading: "4. 시험 전 전자기기 보관 1분 루틴",
        paragraphs: [
          "스마트 글래스뿐만 아니라 스마트워치, 피트니스 밴드, 무선 이어폰(에어팟·버즈), 스마트 링 등 몸에 착용하는 모든 전자기기는 고사장 입실 전 전원을 완전히 끄고 가방 안에 넣어야 합니다. 시험 도중 주머니에서 알람이 울리거나 전자기기가 발견되면 고의성 여부와 상관없이 즉시 퇴실 및 당회 시험 무효 처리가 됩니다.",
          "오픽온미의 수험 가이드를 숙지하고, 시험 당일에는 오직 신분증과 본인의 말하기 호흡만 챙겨 시험실에 들어가세요. 기기에 대한 사소한 걱정을 지워낼 때 비로소 40분 동안 온전히 내 스토리라인에 몰입할 수 있습니다.",
        ],
        note: {
          title: "시험 시작 10분 전 최종 확인",
          text: "스마트폰 전원 종료 확인 → 스마트워치 해제 후 가방 보관 → 안경에 불필요한 액세서리(안경줄, 카메라 클립) 제거 → 화장실 다녀온 후 차분히 첫 문제 도입부 암송.",
        },
      },
    ],
  },
  {
    id: "actfl-opic-ai-scoring-system-analysis",
    category: "평가 기준",
    title: "ACTFL 오픽의 AI 자동 채점 도입과 평가 메커니즘: 인간 평가관(Rater)과 AI의 교차 검증 원리",
    subtitle: "오픽은 정말 AI가 혼자 채점할까? 공인 Rater와 자동 음성 평가 엔진(AI)의 역할 분담, 발화 유창성 측정 지표와 '키워드 나열'이 통하지 않는 이유입니다.",
    date: "2026.11.21",
    publishedAt: "2026-11-21",
    modifiedAt: "2026-11-21",
    readMinutes: "8분 읽기",
    summary: "ACTFL OPIc의 채점은 100% 인공지능 단독 평가나 100% 인간 평가가 아닌, 훈련된 공인 평가관(ACTFL Certified Rater)과 음향·언어 자동 분석 시스템의 정교한 교차 검증으로 이루어집니다. AI 채점 도입의 실체와 수험자가 지켜야 할 발화 리듬을 분석합니다.",
    image: actflOpicAiScoringSystemAnalysisCover,
    imageAlt: "헤드폰을 쓴 공인 언어 평가관이 노트북 화면에서 발화 음성 파형과 음향 지속 시간, 텍스트 일관성 지표를 교차 검증하는 전문 평가 환경",
    takeaway: "AI 채점 시대에도 평가의 핵심은 ‘화려한 단어 수’가 아니라 ‘주어진 시간 동안 멈추지 않고 문장과 문장을 인과관계로 엮어내는 실제 사람과의 대화 호흡(Discourse Flow)’입니다.",
    disclaimer: "본 분석은 ACTFL 공개 평가 가이드라인, OPIc 백서 및 공인 Rater 채점 기준에 기반하여 작성되었으며, ACTFL의 세부 특허 알고리즘이나 독점 평가 엔진의 내부 수치는 비공개 사항입니다.",
    creationNote: "ACTFL Proficiency Guidelines 2024 및 OPIc Familiarization Guide에 공개된 말하기 능력 평가 준거(음향, 문법, 담화)를 바탕으로, 시중에 잘못 퍼진 '키워드 위주 AI 채점설'을 바로잡고 진정한 즉흥 발화 훈련법을 도출했습니다.",
    sources: [magazineSources.actflOpic, magazineSources.actflGuidelines, magazineSources.actflTestTakerTips],
    sections: [
      {
        heading: "1. ‘AI가 혼자 채점한다’는 소문의 실체",
        paragraphs: [
          "수험생 커뮤니티에서는 '오픽도 이제 AI가 채점하니 특정 고급 키워드(sophisticated vocabulary)만 많이 말하면 AL이 나온다'거나 '음성 인식률만 높이면 된다'는 식의 루머가 흔히 돕니다. 하지만 ACTFL 공인 OPIc의 실제 채점 체계는 그렇게 단순하지 않습니다.",
          "ACTFL OPIc은 엄격한 자격 훈련을 거친 복수의 인간 공인 평가관(ACTFL Certified Raters)이 주 평가를 담당하며, 첨단 자동 음성 평가(Automated Speech Scoring) 엔진은 발화 유효성 검증, 발화 속도와 멈춤(Pause) 분석, 암기형 스크립트 이상치 탐지 및 1차·2차 평가관 간의 점수 불일치를 보정하는 하이브리드 교차 검증 시스템으로 운영됩니다.",
        ],
        bullets: [
          "공인 Rater의 역할: 문맥 이해, 즉흥적 질문 대처 능력, 감정 전달, 롤플레이 문제 해결의 적절성 평가",
          "자동화 엔진의 역할: 음향 유창성(Acoustic Fluency), 발화 지속 시간 대비 무음 구간 비율 측정, 비정상적 암기 패턴 감지",
          "불일치 해결 절차: 평가관과 자동 시스템의 판정 차이가 크거나 Rater 간 등급이 갈릴 경우 상급 마스터 평가관의 재검토 진행",
        ],
      },
      {
        heading: "2. 시스템이 공통으로 측정하는 3대 음향·담화 지표",
        paragraphs: [
          "평가관의 귀와 자동 음성 분석 엔진이 공통적으로 가장 예민하게 포착하는 것은 '수험자가 말을 할 때 어떻게 쉬어 가는가(Pausing Behavior)'입니다. 원어민이나 AL 수준의 능숙한 화자는 의미 단위(Chunk) 사이에서 자연스럽게 숨을 고르지만, 스크립트를 달달 외운 화자는 쉼표가 없는 곳에서 뚝 끊기거나 엉뚱한 전치사 뒤에서 길게 멈춥니다.",
          "또한 발화 속도(Words Per Minute) 자체보다 유의미한 발화 시간(Speech Time)과 침묵 시간(Silence Time)의 비율이 중요합니다. 침묵이 5초 이상 이어지면 유창성 감점 요인이 되므로, 적절한 담화 표지(Filler Words)로 시간을 벌면서 문장을 이어 가는 훈련이 필수적입니다.",
        ],
        example: {
          title: "부자연스러운 암기식 끊어읽기 vs 자연스러운 의미 단위 청킹",
          description: "같은 문장이라도 끊어 읽는 위치에 따라 기계적 암기와 자연스러운 회화가 구분됩니다.",
          lines: [
            "감점 패턴 (단어 기억 안 나서 엉뚱한 곳 정적): I went to... (3초 정적) ...the park because the... (4초 정적) ...weather was nice.",
            "고득점 패턴 (생각하며 의미 단위로 이어가기): Well, actually, I headed out to the neighborhood park (반 호흡) simply because the weather was exceptionally clear that morning.",
            "핵심: 문장 중간에 단어가 막히면 침묵하지 말고 'You know', 'How should I put it' 같은 필러로 생각할 시간을 벌며 다음 구절로 연결합니다.",
          ],
        },
      },
      {
        heading: "3. ‘단어 나열식’ 답변이 AL이 아닌 IM에 그치는 이유",
        paragraphs: [
          "토익 라이팅처럼 단어 수를 채우는 시험과 달리, OPIc은 '문단 단위의 발화(Paragraph-length discourse)'를 요구합니다. 아무리 picturesque, mesmerizing, breathtaking 같은 고급 형용사를 연발하더라도, 그것들이 앞뒤 인과관계(Because, Therefore, That's why) 없이 단문 형태로 뚝뚝 끊어져 나열되면 등급은 Intermediate 수준에 묶입니다.",
          "ACTFL 가이드라인에 명시된 AL(Advanced Low)의 절대 기준은 '과거 시제를 안정적으로 통제하면서, 발생한 사건을 시간 순서대로 엮고, 예기치 못한 문제 상황을 논리적으로 풀어나가는 능력'입니다. 즉, 단어의 난이도보다 '사건의 전개력'이 채점표의 상단을 결정합니다.",
        ],
        bullets: [
          "IM 수준: '공원에 갔다. 날씨가 좋았다. 꽃이 예뻤다. 행복했다.' (단문 단순 나열)",
          "IH 수준: '공원에 갔는데 날씨가 정말 화창해서 기분이 상쾌했다. 하지만 갑자기 소나기가 내려서 당황했다.' (접속사 활용 복문)",
          "AL 수준: '평소처럼 산책로를 걷고 있었는데 예기치 않게 먹구름이 몰려왔다. 우산이 없었기 때문에 근처 정자로 급히 뛰어갔고, 거기서 비가 그칠 때까지 기다리며 친구와 통화했던 기억이 난다.' (사건-원인-대응-결과가 하나로 엮인 완전한 문단)",
        ],
      },
      {
        heading: "4. 기계가 아닌 사람에게 말하듯 호흡하는 실전 발화법",
        paragraphs: [
          "결국 오픽 시험에서 높은 등급을 받는 가장 확실한 비결은 모니터 뒤의 평가관을 진짜 대화 상대로 대하는 것입니다. 완벽한 문법을 구사하려는 강박을 내려놓고, 실제로 내 친구나 직장 동료에게 지난 주말에 있었던 소소한 일을 실감 나게 들려준다는 태도로 말해 보세요.",
          "오픽온미의 Quick Practice에서 녹음 버튼을 누르고 내 목소리를 직접 들어보세요. 문장과 문장 사이의 침묵이 얼마나 긴지, filler가 자연스럽게 들어가는지 스스로 귀로 확인하고 다듬는 훈련이야말로 AI 시대에도 변하지 않는 가장 강력한 고득점 전략입니다.",
        ],
        note: {
          title: "실전 모의고사 100% 활용 팁",
          text: "오픽온미 STEP 6 실전 연습에서는 화면의 문항 카운트다운을 의식하지 말고, 질문 청취 후 3초 내에 첫 문장을 뱉은 뒤 '상황 설명 → 사건 발생 → 느낀 점'의 3단계 흐름으로 끊김 없이 60초를 채우는 훈련을 반복하세요.",
        },
      },
    ],
  },
  {
    id: "generative-ai-chatgpt-gemini-opic-study-guide",
    category: "학습 방법",
    title: "생성형 AI(ChatGPT·Gemini)로 오픽 준비할 때 절대 하지 말아야 할 실수와 200% 활용법",
    subtitle: "AI가 써준 유려한 스크립트를 통째로 외우면 왜 IH/IM에서 멈출까? '모범답안 자판기'가 아닌 '즉흥 발화 시뮬레이터'로 AI를 활용하는 3단계 훈련법입니다.",
    date: "2026.11.21",
    publishedAt: "2026-11-21",
    modifiedAt: "2026-11-21",
    readMinutes: "8분 읽기",
    summary: "ChatGPT나 Gemini 같은 생성형 AI는 오픽 공부의 훌륭한 파트너가 될 수도, 치명적인 독이 될 수도 있습니다. AI가 만들어준 원어민급 스크립트를 무작정 암기하다 시험장에서 얼어붙는 이유와, AI를 내 말하기 교정 코치로 똑똑하게 쓰는 실전 루틴을 소개합니다.",
    image: generativeAiChatgptGeminiOpicStudyGuideCover,
    imageAlt: "어두운 밤 스탠드 조명 아래에서 학습자가 마이크를 통해 영어로 소리 내어 말하고 노트북 화면의 음성 파형과 실시간 AI 피드백 카드를 확인하는 훈련 장면",
    takeaway: "AI에게 완벽한 답을 써달라고 요구하지 마세요. 내가 직접 불완전하게 소리 내어 말한 뒤, AI에게 내 문장의 어색한 부분(FIX)과 살려둘 부분(KEEP)만 피드백받고 그 자리에서 다시 말해보는 훈련이 점수를 만듭니다.",
    disclaimer: "특정 LLM 서비스의 성능이나 오픽 등급 취득을 보장하지 않습니다. 수험자 개인의 현재 영어 실력과 실제 입 밖으로 소리 내는 발화 연습량에 따라 결과는 달라질 수 있습니다.",
    creationNote: "오픽온미의 6단계 실전 훈련 설계 및 Gemini 3.5 기반 관리형 AI 피드백 아키텍처를 바탕으로, 수험생들이 흔히 범하는 'AI 스크립트 단순 암기'의 부작용을 극복하는 구체적 발화 훈련 가이드를 완성했습니다.",
    sources: [magazineSources.actflTestTakerTips, magazineSources.actflOpic, magazineSources.opicCandidateGuide],
    sections: [
      {
        heading: "1. 완벽한 AI 모범 답안이 시험장에서 독이 되는 이유",
        paragraphs: [
          "ChatGPT나 Gemini에게 '오픽 재활용 문제 AL 수준 답변 써줘'라고 프롬프트를 넣으면, 3초 만에 원어민 에세이 수준의 유려한 영어 스크립트가 출력됩니다. 많은 수험생이 이 문장들을 노트에 정리하고 달달 외우기 시작합니다.",
          "하지만 이렇게 만들어진 스크립트는 본인의 평소 구사 어휘나 문장 호흡과 완전히 겉돌기 마련입니다. 시험장 헤드폰 너머로 질문을 듣는 순간, 외웠던 5번째 줄의 한 단어가 기억나지 않으면 머릿속이 새하얘지며 10초 이상의 치명적인 정적이 발생합니다. 외운 티가 역력한 부자연스러운 억양과 돌발 변수에서의 무너짐은 공인 Rater에게 가장 쉽게 간파되는 감점 패턴입니다.",
        ],
        bullets: [
          "암기형 발화의 맹점 1: 평소 내가 쓰지 않는 생소한 숙어는 시험장 긴장 상태에서 입 밖으로 튀어나오지 않음",
          "암기형 발화의 맹점 2: 질문의 세부 뉘앙스가 조금만 바뀌어도 준비한 답안을 유연하게 수정하지 못하고 동문서답함",
          "암기형 발화의 맹점 3: 스크립트가 끊기는 순간 침묵이 길어져 ACTFL 기준 유창성 최하위 판정을 받음",
        ],
      },
      {
        heading: "2. ‘답안 자판기’에서 ‘1:1 피드백 코치’로의 전환",
        paragraphs: [
          "생성형 AI를 오픽 준비에 활용할 때 가장 효과적인 방법은 AI에게 빈 도화지에 처음부터 글을 쓰게 하는 것이 아니라, '내가 직접 말해 본 불완전한 문장'을 던져주고 교정받는 것입니다.",
          "문법이 틀리고 단어가 엉성해도 좋습니다. 내가 직접 뱉은 문장 구조를 바탕으로 어색한 시제를 바로잡고, 단문 두 개를 자연스러운 접속사로 이어 주는 피드백을 받을 때 그 표현은 온전히 내 것이 됩니다. AI는 작가가 아니라, 내 옆에 앉은 꼼꼼한 원어민 튜터여야 합니다.",
        ],
        example: {
          title: "효과적인 AI 오픽 피드백 프롬프트 vs 잘못된 프롬프트",
          description: "프롬프트 하나만 바꿔도 공부의 질이 완전히 달라집니다.",
          lines: [
            "❌ 잘못된 프롬프트: '오픽 호텔 예약 변경 롤플레이 AL 답안 10문장 써줘.' (외우다 포기하게 됨)",
            "⭕ 올바른 프롬프트: '내가 방금 호텔 예약 변경 롤플레이를 소리 내어 해봤어: \"Hi, I booked room yesterday, but my schedule change so I need change date. Can I change?\" 내 원래 말투를 유지하면서 자연스러운 구어체로 2문장으로 다듬어주고, 시제 오류 하나만 짚어줘.'",
            "결과 차이: 완전히 새로운 텍스트가 아니라 내가 말했던 문장이 세련되게 다듬어지므로 즉시 입에 붙습니다.",
          ],
        },
      },
      {
        heading: "3. 오픽온미가 제안하는 4단계 AI 발화 루틴",
        paragraphs: [
          "오픽온미(OOM)의 실전 훈련 루프는 바로 이 철학 위에 설계되었습니다. 눈으로 텍스트를 읽는 공부를 멈추고, 반드시 귀로 듣고 입으로 뱉는 물리적 훈련이 중심이 되어야 합니다.",
          "Quick Practice에서 질문을 듣고 60초간 녹음한 뒤, 내 음성이 전사된 텍스트(STT)를 직접 확인하세요. 그리고 AI 코치 피드백을 요청하여 내 답변 중 잘한 점(KEEP)과 어색한 표현(FIX)을 확인한 다음, 반드시 그 자리에서 '같은 문제 다시 말하기'를 눌러 수정된 문장을 입 밖으로 소리 내어 다시 녹음해 보는 것입니다.",
        ],
        bullets: [
          "Step 1 (소리 내어 발화): 자막 없이 질문을 듣고 내 힘으로 45~60초간 답변 녹음",
          "Step 2 (전사 확인): Gemini STT로 전사된 내 실제 말하기 텍스트를 눈으로 확인하며 말버릇 점검",
          "Step 3 (AI 코칭 수용): KEEP(살릴 문장), FIX(고칠 문법), RETRY(재도전 포인트) 핵심 3가지만 확인",
          "Step 4 (즉시 재발화): 교정된 표현을 머리에 담고 1분 안에 같은 문제 다시 녹음하여 뇌에 각인",
        ],
      },
      {
        heading: "4. 롤플레이 돌발 상황에서 AI 핑퐁 대화 훈련하기",
        paragraphs: [
          "STEP 5 롤플레이는 혼자 독백하듯 말하면 어색해지기 쉬운 파트입니다. 이때 AI에게 특정 점원이나 친구 역할을 부여하고, 3문장 이내로 짧게 주고받는 핑퐁 연습을 진행하면 돌발 상황 대처 능력이 비약적으로 향상됩니다.",
          "예를 들어 '너는 렌터카 직원이고, 나는 예약한 차에 문제가 생겨 전화한 고객이야. 내가 말하면 한 문장으로 답변해줘'라고 설정한 뒤 즉흥적으로 문제를 해결해 보세요. 정해진 대본 없이 상황에 반응하는 순발력이 바로 AL을 가르는 핵심 역량입니다.",
        ],
        note: {
          title: "오늘부터 실천하는 AI 오픽 원칙",
          text: "AI가 생성한 스크립트를 10분 이상 들여다보지 마세요. 1분을 읽었다면 반드시 3분 동안 입 밖으로 소리 내어 말해야 진짜 내 영어 실력이 됩니다.",
        },
      },
    ],
  },
];

const newMagazineArticleDrafts: MagazineArticleDraft[] = [
  ...assessmentMagazineArticles,
  ...examPracticeMagazineArticles,
  ...topicPracticeMagazineArticles,
  ...aiInnovationMagazineArticles,
];

function estimateReadMinutes(article: Omit<MagazineArticle, "publishedAt" | "modifiedAt" | "author" | "reviewer" | "creationNote" | "sources">) {
  const sectionText = article.sections.flatMap((section) => [
    section.heading,
    ...section.paragraphs,
    ...(section.bullets ?? []),
    ...(section.example?.lines ?? []),
    section.note?.text ?? "",
  ]).join(" ");
  const characterCount = [article.title, article.subtitle, article.summary, article.takeaway, sectionText].join(" ").length;
  return `${Math.max(4, Math.ceil(characterCount / 550))}분 읽기`;
}

const allMagazineArticleDrafts: MagazineArticleDraft[] = [...magazineArticleDrafts, ...newMagazineArticleDrafts];

export const magazineArticles: MagazineArticle[] = allMagazineArticleDrafts.map((article) => {
  const publishedAt = article.publishedAt ?? (batchPublishedArticleIds.has(article.id) ? "2026-07-12" : article.date.replaceAll(".", "-"));
  return {
    ...article,
    date: publishedAt.replaceAll("-", "."),
    readMinutes: estimateReadMinutes(article),
    publishedAt,
    modifiedAt: article.modifiedAt ?? "2026-07-27",
    author: "나태킴",
    reviewer: "나태킴",
    creationNote: article.creationNote ?? "오픽온미의 실제 훈련 흐름에 맞춰 내용을 구성하고, 공개된 OPIc·ACTFL 공식 안내와 사이트 예시를 교차 확인했습니다.",
    sources: article.sources ?? officialArticleSources,
  };
}).sort((left, right) => (
  right.publishedAt.localeCompare(left.publishedAt)
  || left.title.localeCompare(right.title, "ko")
));

export function getRelatedMagazineArticles(articleId: string, limit = 3) {
  const articleIndex = magazineArticles.findIndex((article) => article.id === articleId);
  if (articleIndex < 0 || limit <= 0) return [];

  const currentArticle = magazineArticles[articleIndex];
  const followingArticles = [
    ...magazineArticles.slice(articleIndex + 1),
    ...magazineArticles.slice(0, articleIndex),
  ];
  const sameCategory = followingArticles.filter((article) => article.category === currentArticle.category);
  const otherCategories = followingArticles.filter((article) => article.category !== currentArticle.category);
  return [...sameCategory, ...otherCategories].slice(0, limit);
}
