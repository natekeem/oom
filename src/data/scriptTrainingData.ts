import type { LegacyScriptVariantSet, ScriptBlueprintStep } from "../types";

const blueprint = (items: Array<[string, string, string]>) => items.map<ScriptBlueprintStep>(([id, label, koreanGuide], index) => ({
  id,
  label,
  koreanGuide,
  cue: ["질문의 중심 단어를 먼저 고릅니다.", "첫 장면만 질문에 맞게 교체합니다.", "구체 활동과 명사는 재사용합니다.", "감정 또는 변화로 마무리합니다."][index],
}));

export const scriptTrainingSets: Record<string, LegacyScriptVariantSet> = {
  "outdoor-travel": {
    title: "한 번의 바닷가 장면을 질문 방향에 맞게 돌리기",
    description: "공원·해변·여행·루틴 질문은 같은 가족 여행 장면을 씁니다. 질문이 요구하는 시작점만 바꾸고 날씨, 활동, 감정은 재사용합니다.",
    variants: [
      { id: "favorite-place", label: "좋아하는 장소", questionType: "장소 묘사", question: "Tell me about a park or beach you enjoy going to.", pivot: "여행의 시작을 ‘집 근처에서 자주 가는 해변’으로 바꿉니다.", keep: ["walking path", "ocean view", "relaxed feeling"] },
      { id: "recent-trip", label: "최근 여행", questionType: "기억나는 경험", question: "Describe a memorable trip you took recently.", pivot: "메인 장면을 가장 많이 유지하고, 최근성·이동·기억 포인트만 선명하게 꺼냅니다.", keep: ["family getaway", "seafood dinner", "sound of the waves"] },
      { id: "outdoor-routine", label: "야외 루틴", questionType: "루틴 / 활동", question: "What do you usually do when you visit an outdoor place?", pivot: "여행의 하루를 반복 가능한 주말 산책과 가벼운 조깅 루틴으로 전환합니다.", keep: ["morning walk", "light jog", "fresh air"] },
      { id: "travel-change", label: "여행 방식의 변화", questionType: "과거와 현재", question: "How has your travel style changed over time?", pivot: "장소와 가족 장면은 유지하고, 예전과 지금의 여행 방식만 대비합니다.", keep: ["family trip", "simple plan", "feeling refreshed"] },
    ],
    blueprint: blueprint([["target", "질문의 중심 명사 고르기", "park, beach, trip, routine 중 질문이 무엇을 먼저 묻는지 한 단어를 고릅니다."], ["open", "장면 열기만 교체", "장소·최근 경험·루틴에 따라 첫 문단의 출발점만 바꿉니다."], ["reuse", "활동과 감정 재사용", "걷기, 사진, 파도, 가족과의 시간은 질문과 맞는 것만 남깁니다."], ["close", "질문에 맞게 마무리", "좋아하는 장소면 스트레스 해소, 변화 질문이면 달라진 취향으로 끝냅니다."]]),
  },
  "indoor-rest": {
    title: "카페와 집의 휴식 루틴을 질문에 맞게 조절하기",
    description: "카페, 집, 음악, 스트레스 해소는 조용한 휴식이라는 같은 축을 공유합니다. 장소와 시간만 바꾸고 커피·플레이리스트·충전감은 이어 갑니다.",
    variants: [
      { id: "favorite-cafe", label: "자주 가는 카페", questionType: "좋아하는 장소", question: "Tell me about a cafe you often visit.", pivot: "첫 문단을 카페의 창가, 주문, 조용한 분위기로 좁힙니다.", keep: ["corner cafe", "iced latte", "window seat"] },
      { id: "home-routine", label: "집에서 쉬는 루틴", questionType: "일상 루틴", question: "What do you usually do when you stay at home?", pivot: "카페 이동 부분을 빼고 음악, 간단한 저녁, 소파 휴식 순서로 교체합니다.", keep: ["soft playlist", "make dinner", "quiet evening"] },
      { id: "music-memory", label: "음악을 들은 최근 경험", questionType: "최근 경험", question: "Describe a recent time you enjoyed listening to music.", pivot: "장소보다 최근의 피곤했던 날과 플레이리스트가 만든 변화에 초점을 둡니다.", keep: ["calm playlist", "window seat", "recharge"] },
      { id: "stress-relief", label: "바쁜 주 뒤 휴식", questionType: "습관 / 이유", question: "How do you relax after a busy week?", pivot: "주말이라는 시간과 스트레스 해소 이유를 첫 문단에 먼저 답합니다.", keep: ["quiet break", "music", "reset my mood"] },
    ],
    blueprint: blueprint([["target", "장소인지 습관인지 구분", "cafe면 장소, stay at home이면 루틴, music이면 한 번의 최근 경험이 핵심입니다."], ["open", "첫 문단의 장소·시간 교체", "카페·집·최근의 하루 중 하나를 먼저 정하고 시작합니다."], ["reuse", "감각 명사는 유지", "iced latte, window seat, soft playlist 같은 구체 명사는 그대로 활용합니다."], ["close", "충전의 결과로 끝내기", "조용해졌고 다음 날을 준비할 수 있었다는 변화로 닫습니다."]]),
  },
  "sports-hobby": {
    title: "테니스 장면을 취미·시작 계기·쇼핑 경험으로 바꾸기",
    description: "같은 코트, 같은 연습 파트너, 같은 장비를 쓰되 질문이 취미인지 과거 경험인지 구매 경험인지에 따라 첫 장면을 이동합니다.",
    variants: [
      { id: "favorite-sport", label: "좋아하는 운동", questionType: "취미 묘사", question: "Tell me about a sport you enjoy.", pivot: "시작 계기보다 현재 주말 코트 루틴과 재미를 첫 문단에 둡니다.", keep: ["tennis court", "weekend rally", "practice partner"] },
      { id: "how-it-started", label: "시작 계기", questionType: "과거 경험", question: "Describe how you started your favorite hobby.", pivot: "메인 스토리의 첫 문단이 이미 정답에 가깝습니다. 초대와 첫 랠리를 더 또렷하게 말합니다.", keep: ["friend invited me", "first rally", "small progress"] },
      { id: "hobby-shopping", label: "취미 장비 쇼핑", questionType: "구매 경험", question: "Tell me about something you bought for your hobby.", pivot: "처음부터 장비 문제와 구매 이유로 시작한 뒤, 코트에서의 변화로 연결합니다.", keep: ["overgrip", "tennis shoes", "better support"] },
      { id: "improvement", label: "실력 향상", questionType: "변화 / 비교", question: "How have you improved at this activity?", pivot: "과거의 실수와 지금의 백핸드를 대비하고, 연습 습관은 그대로 유지합니다.", keep: ["backhand", "practice", "confidence"] },
    ],
    blueprint: blueprint([["target", "질문이 가리키는 시간 찾기", "sport는 현재, started는 과거, bought는 특정 구매, improved는 전후 비교를 요구합니다."], ["open", "출발점만 이동", "코트·친구·장비 중 질문이 묻는 명사를 첫 문단으로 끌어옵니다."], ["reuse", "코트 장면 유지", "주말 랠리와 연습 파트너는 취미의 신뢰도 있는 공통 배경입니다."], ["close", "작은 진전으로 닫기", "더 안정적인 백핸드, 편안한 장비, 다시 가고 싶은 마음 중 하나로 끝냅니다."]]),
  },
  "home-residence": {
    title: "집 장면을 거주지·동네·집안일·문제 해결로 전환하기",
    description: "가족과 사는 아파트라는 기본 장면은 고정합니다. 질문이 공간, 동네, 일상일, 일정 문제 중 어디에 초점을 두는지만 바꿉니다.",
    variants: [
      { id: "home-description", label: "사는 곳 묘사", questionType: "집 묘사", question: "Describe the place where you live.", pivot: "메인 스토리의 집과 거실 부분을 그대로 앞에 두고 동네와 일정은 줄입니다.", keep: ["living room", "my room", "natural light"] },
      { id: "neighborhood", label: "동네 소개", questionType: "주변 환경", question: "Tell me about your neighborhood.", pivot: "집 내부 설명을 짧게 만들고 공원, 마트, 카페, 저녁 산책을 앞으로 옮깁니다.", keep: ["nearby park", "grocery store", "after dinner"] },
      { id: "household-chores", label: "집안일 루틴", questionType: "일상 루틴", question: "What household chores do you usually do?", pivot: "주말 가족 분담, 주방 정리, 청소 순서를 중심으로 상세 활동 블록을 교체합니다.", keep: ["vacuuming", "organizing the kitchen", "family routine"] },
      { id: "home-problem", label: "집 관련 문제 해결", questionType: "문제 해결", question: "Tell me about a change or problem related to your home.", pivot: "공간 묘사는 짧게 하고 청소 일정 변경과 대안 제시 경험으로 바로 들어갑니다.", keep: ["cleaning schedule", "family event", "another time"] },
    ],
    blueprint: blueprint([["target", "공간·동네·일정 중 하나 선택", "질문의 핵심이 living space인지 neighborhood인지 chores인지 problem인지 먼저 표시합니다."], ["open", "첫 블록의 초점 교체", "집이면 거실, 동네면 공원, 문제면 일정 변경부터 출발합니다."], ["reuse", "가족 배경은 재사용", "가족과 함께 사는 설정은 대부분의 질문에서 자연스럽게 유지됩니다."], ["close", "편안함 또는 해결 결과", "집의 편안함, 동네의 익숙함, 일정 해결의 안도감으로 결론을 만듭니다."]]),
  },
};
