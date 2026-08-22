import type { ScriptBlueprintStep, ScriptVariantSet } from "../../../../types";
import { defineVariantSets } from "../../defineVariantSets";

const blueprint = (items: Array<[string, string, string]>) =>
  items.map<ScriptBlueprintStep>(([id, label, koreanGuide], index) => ({
    id,
    label,
    koreanGuide,
    cue: [
      "질문의 중심 단어를 먼저 고릅니다.",
      "첫 장면만 질문에 맞게 교체합니다.",
      "구체 활동과 명사는 재사용합니다.",
      "감정 또는 변화로 마무리합니다.",
    ][index],
  }));

const authoredVariantSets: Record<string, ScriptVariantSet> = {
  "outdoor-travel": {
    title: "한 번의 바닷가 장면을 질문 방향에 맞게 돌리기",
    description:
      "공원·해변·여행·루틴 질문은 같은 가족 여행 장면을 씁니다. 질문이 요구하는 시작점만 바꾸고 날씨, 활동, 감정은 재사용합니다.",
    variants: [
      {
        id: "favorite-place",
        label: "좋아하는 장소",
        questionType: "장소 묘사",
        question: "Tell me about a beach destination you enjoyed visiting.",
        pivot: "같은 가족 여행의 바닷가와 리조트 주변 산책 장면을 장소 묘사에 맞게 앞에 둡니다.",
        keep: ["walking path", "ocean view", "relaxed feeling"],
      },
      {
        id: "recent-trip",
        label: "최근 여행",
        questionType: "기억나는 경험",
        question: "Describe a memorable trip you took recently.",
        pivot: "메인 장면을 가장 많이 유지하고, 최근성·이동·기억 포인트만 선명하게 꺼냅니다.",
        keep: ["family getaway", "seafood dinner", "sound of the waves"],
      },
      {
        id: "outdoor-routine",
        label: "여행지에서 한 활동",
        questionType: "활동 순서",
        question: "What did you do during your family trip near the beach?",
        pivot: "새 루틴을 만들지 않고 같은 여행에서 했던 산책·식사·파도 소리 순서만 고릅니다.",
        keep: ["family getaway", "walk near the beach", "seafood dinner"],
      },
      {
        id: "travel-change",
        label: "여행 방식의 변화",
        questionType: "과거와 현재",
        question: "How has your travel style changed over time?",
        pivot: "장소와 가족 장면은 유지하고, 예전과 지금의 여행 방식만 대비합니다.",
        keep: ["family trip", "simple plan", "feeling refreshed"],
      },
    ],
    blueprint: blueprint([
      ["target", "질문의 중심 명사 고르기", "park, beach, trip, routine 중 질문이 무엇을 먼저 묻는지 한 단어를 고릅니다."],
      ["open", "장면 열기만 교체", "장소·최근 경험·루틴에 따라 첫 문단의 출발점만 바꿉니다."],
      ["reuse", "활동과 감정 재사용", "걷기, 사진, 파도, 가족과의 시간은 질문과 맞는 것만 남깁니다."],
      ["close", "질문에 맞게 마무리", "좋아하는 장소면 스트레스 해소, 변화 질문이면 달라진 취향으로 끝냅니다."],
    ]),
  },
  "indoor-rest": {
    title: "카페와 집의 휴식 루틴을 질문에 맞게 조절하기",
    description:
      "카페, 집, 음악, 스트레스 해소는 조용한 휴식이라는 같은 축을 공유합니다. 장소와 시간만 바꾸고 커피·플레이리스트·충전감은 이어 갑니다.",
    variants: [
      {
        id: "favorite-cafe",
        label: "자주 가는 카페",
        questionType: "좋아하는 장소",
        question: "Tell me about a cafe you often visit.",
        pivot: "첫 문단을 카페의 창가, 주문, 조용한 분위기로 좁힙니다.",
        keep: ["corner cafe", "iced latte", "window seat"],
      },
      {
        id: "home-routine",
        label: "집에서 쉬는 루틴",
        questionType: "일상 루틴",
        question: "What do you usually do when you stay at home?",
        pivot: "카페 이동 부분을 빼고 음악, 간단한 저녁, 소파 휴식 순서로 교체합니다.",
        keep: ["soft playlist", "make dinner", "quiet evening"],
      },
      {
        id: "music-memory",
        label: "음악을 들은 최근 경험",
        questionType: "최근 경험",
        question: "Describe a recent time you enjoyed listening to music.",
        pivot: "장소보다 최근의 피곤했던 날과 플레이리스트가 만든 변화에 초점을 둡니다.",
        keep: ["calm playlist", "window seat", "recharge"],
      },
      {
        id: "stress-relief",
        label: "바쁜 주 뒤 휴식",
        questionType: "습관 / 이유",
        question: "How do you relax after a busy week?",
        pivot: "주말이라는 시간과 스트레스 해소 이유를 첫 문단에 먼저 답합니다.",
        keep: ["quiet break", "music", "reset my mood"],
      },
    ],
    blueprint: blueprint([
      ["target", "장소인지 습관인지 구분", "cafe면 장소, stay at home이면 루틴, music이면 한 번의 최근 경험이 핵심입니다."],
      ["open", "첫 문단의 장소·시간 교체", "카페·집·최근의 하루 중 하나를 먼저 정하고 시작합니다."],
      ["reuse", "감각 명사는 유지", "iced latte, window seat, soft playlist 같은 구체 명사는 그대로 활용합니다."],
      ["close", "충전의 결과로 끝내기", "조용해졌고 다음 날을 준비할 수 있었다는 변화로 닫습니다."],
    ]),
  },
  "sports-hobby": {
    title: "테니스 장면을 취미·시작 계기·쇼핑 경험으로 바꾸기",
    description:
      "같은 코트, 같은 연습 파트너, 같은 장비를 쓰되 질문이 취미인지 과거 경험인지 구매 경험인지에 따라 첫 장면을 이동합니다.",
    variants: [
      {
        id: "favorite-sport",
        label: "좋아하는 운동",
        questionType: "취미 묘사",
        question: "Tell me about a sport you enjoy.",
        pivot: "시작 계기보다 현재 주말 코트 루틴과 재미를 첫 문단에 둡니다.",
        keep: ["tennis court", "weekend rally", "practice partner"],
      },
      {
        id: "how-it-started",
        label: "시작 계기",
        questionType: "과거 경험",
        question: "Describe how you started your favorite hobby.",
        pivot: "메인 스토리의 첫 문단이 이미 정답에 가깝습니다. 초대와 첫 랠리를 더 또렷하게 말합니다.",
        keep: ["friend invited me", "first rally", "small progress"],
      },
      {
        id: "hobby-shopping",
        label: "취미 장비 쇼핑",
        questionType: "구매 경험",
        question: "Tell me about something you bought for your hobby.",
        pivot: "처음부터 장비 문제와 구매 이유로 시작한 뒤, 코트에서의 변화로 연결합니다.",
        keep: ["overgrip", "tennis shoes", "better support"],
      },
      {
        id: "improvement",
        label: "실력 향상",
        questionType: "변화 / 비교",
        question: "How have you improved at this activity?",
        pivot: "과거의 실수와 지금의 백핸드를 대비하고, 연습 습관은 그대로 유지합니다.",
        keep: ["backhand", "practice", "confidence"],
      },
    ],
    blueprint: blueprint([
      ["target", "시작·장비·루틴 중 초점 찾기", "처음 배운 경험인지, 최근 장비 구매인지, 현재 연습 루틴인지 질문 단어를 먼저 확인합니다."],
      ["open", "첫 문단의 이유만 교체", "친구가 초대했던 첫날 또는 최근 장비 구매 이야기로 첫 장면을 맞춥니다."],
      ["reuse", "랠리와 코트 장면 재사용", "overgrip, practice partner, weekend court 같은 핵심 디테일은 그대로 유지합니다."],
      ["close", "꾸준함과 자신감으로 마무리", "실력 향상과 계속 연습하고 싶다는 긍정적인 느낌으로 답변을 닫습니다."],
    ]),
  },
  "home-residence": {
    title: "집 공간을 동네·집안일·문제 해결로 확장하기",
    description:
      "방 구조와 거실이라는 고정된 무대를 바탕으로, 동네의 편의성·주말 청소 루틴·청소 일정 변경 에피소드로 유연하게 전환합니다.",
    variants: [
      {
        id: "home-description",
        label: "내가 사는 집",
        questionType: "장소 묘사",
        question: "Describe the home you live in. What does it look like?",
        pivot: "가족과 사는 아파트 구조와 내가 가장 좋아하는 창가 책상 공간을 상세히 묘사합니다.",
        keep: ["family apartment", "living room", "desk near window"],
      },
      {
        id: "neighborhood",
        label: "동네와 편의시설",
        questionType: "주변 환경",
        question: "Tell me about the neighborhood where you live.",
        pivot: "집 내부에서 집 밖으로 시선을 돌려 도보 거리의 공원, 마트, 카페 편의성을 말합니다.",
        keep: ["quiet neighborhood", "nearby park", "walking distance"],
      },
      {
        id: "household-chores",
        label: "집안일 분담",
        questionType: "일상 루틴",
        question: "What chores do you usually do at home?",
        pivot: "주말에 가족과 역할을 나누어 청소기 돌리기, 방 정리, 설거지를 하는 루틴으로 전환합니다.",
        keep: ["weekend chores", "vacuum the living room", "keep it tidy"],
      },
      {
        id: "home-problem",
        label: "집안일 일정 변경",
        questionType: "문제 해결",
        question: "Describe a problem you had at home and how you solved it.",
        pivot: "갑작스러운 가족 행사로 청소 일정을 변경해야 했던 상황과 정중한 대안 요청을 설명합니다.",
        keep: ["schedule change", "called politely", "new appointment"],
      },
    ],
    blueprint: blueprint([
      ["target", "집 내부인지 외부인지 구분", "집 구조인지 동네 환경인지, 아니면 집안일 루틴이나 문제 해결인지 파악합니다."],
      ["open", "출발점 문장 설정", "사는 곳 소개, 동네 특징, 주말 루틴 중 질문에 맞는 첫 문장을 엽니다."],
      ["reuse", "공간과 생활 패턴 재사용", "창가 책상, 거실 정리, 가족과의 분담 등 익숙한 생활 디테일을 재사용합니다."],
      ["close", "편안함과 만족감으로 닫기", "집이 주는 편안한 휴식과 안정감을 강조하며 자연스럽게 마무리합니다."],
    ]),
  },
};

export const variantSets = defineVariantSets(authoredVariantSets);
