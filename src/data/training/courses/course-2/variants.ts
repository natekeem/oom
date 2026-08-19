import type { ScriptBlueprintStep, ScriptVariantSet } from "../../../../types";

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

export const variantSets: Record<string, ScriptVariantSet> = {
  "culture-night": {
    title: "영화·공연·음악의 복합 저녁을 질문에 맞게 재구성하기",
    description:
      "도심 문화 복합공간에서 영화를 보고 라이브 공연을 함께 즐긴 저녁 장면을 유지하며, 질문이 영화인지 음악인지 최근 문화 경험인지에 따라 시작점과 초점을 변경합니다.",
    variants: [
      {
        id: "favorite-culture",
        label: "좋아하는 문화 활동",
        questionType: "취미 묘사",
        question: "Tell me about a cultural activity you enjoy, such as watching movies or going to performances.",
        pivot: "영화와 라이브 음악을 함께 즐기는 주말 문화 루틴으로 첫 문단을 엽니다.",
        keep: ["cultural complex", "live performance", "favorite song"],
      },
      {
        id: "recent-culture",
        label: "최근 문화 경험",
        questionType: "최근 경험",
        question: "Describe a memorable movie or performance you attended recently.",
        pivot: "메인 스토리를 그대로 사용하여 친구와 영화를 보고 라이브 쇼를 발견했던 날의 시간과 감정을 전면에 둡니다.",
        keep: ["downtown venue", "crowd singing", "felt energized"],
      },
      {
        id: "music-routine",
        label: "음악 감상 루틴",
        questionType: "일상 루틴",
        question: "What kind of music do you like, and when do you usually listen to it?",
        pivot: "라이브 공연에서 들었던 최애 곡과 귀가길 플레이리스트 청취 습관으로 초점을 맞춥니다.",
        keep: ["playlist", "listen on the way home", "calm and energetic"],
      },
      {
        id: "culture-change",
        label: "문화생활의 변화",
        questionType: "과거와 현재",
        question: "How has your preference in movies or performances changed over time?",
        pivot: "대형 콘서트장보다 작은 라이브 공연에서 가깝게 소통하는 것을 선호하게 된 변화로 연결합니다.",
        keep: ["small venue", "close friend", "meaningful experience"],
      },
    ],
    blueprint: blueprint([
      ["target", "영화·공연·음악 중 질문 초점 확인", "질문이 영화인지 공연인지 음악 감상 습관인지 확인하고 출발 단어를 고릅니다."],
      ["open", "첫 문장의 접근점 설정", "문화센터 방문, 좋아하는 장르, 최근 주말 경험 중 질문에 맞게 시작합니다."],
      ["reuse", "라이브 쇼와 노래 장면 재사용", "downtown complex, live performance, playlist 같은 핵심 명사를 이어 갑니다."],
      ["close", "에너지와 만족감으로 닫기", "일상의 스트레스가 풀리고 특별한 저녁이 되었다는 기분으로 마무리합니다."],
    ]),
  },
  "smart-shopping": {
    title: "이어폰 비교 구매 장면을 쇼핑 루틴과 소비 변화로 바꾸기",
    description:
      "고장 난 이어폰을 교체하기 위해 쇼핑몰에서 두 모델의 착용감과 반품 조건을 비교하고 실용적인 제품을 산 경험을 질문 유형별로 전환합니다.",
    variants: [
      {
        id: "shopping-routine",
        label: "쇼핑 습관과 장소",
        questionType: "장소·루틴",
        question: "Where do you usually go shopping, and what do you like about that place?",
        pivot: "대형 쇼핑몰의 전자기기 매장에 직접 가서 꼼꼼히 비교하는 평소 쇼핑 스타일로 시작합니다.",
        keep: ["shopping mall", "compare options", "practical purchase"],
      },
      {
        id: "recent-purchase",
        label: "최근 구매 경험",
        questionType: "최근 경험",
        question: "Tell me about something you bought recently. Why did you buy it?",
        pivot: "메인 스토리의 첫 문단 그대로 이어폰 고장과 매장 방문 계기를 명확히 전달합니다.",
        keep: ["earphones broke", "tried them on", "satisfied with choice"],
      },
      {
        id: "product-comparison",
        label: "두 제품 비교",
        questionType: "비교 / 특징",
        question: "Describe a time when you had to compare two different products before buying.",
        pivot: "가격 중심의 모델과 착용감·배터리 중심 모델 간의 구체적 비교에 집중합니다.",
        keep: ["two models", "comfort and battery", "return policy"],
      },
      {
        id: "spending-change",
        label: "소비 습관의 변화",
        questionType: "과거와 현재",
        question: "How have your shopping habits changed compared to the past?",
        pivot: "충동구매하던 과거와 달리 실제 착용감과 반품 조건을 확인하고 필요한 것만 사는 습관을 대비합니다.",
        keep: ["used to buy quickly", "compare details", "less stress"],
      },
    ],
    blueprint: blueprint([
      ["target", "구매 목적 vs 소비 습관 구분", "단순 최근 구매인지, 쇼핑 장소 소개인지, 과거와 현재 소비 비교인지 구분합니다."],
      ["open", "출발점 문단 설정", "필요할 때만 쇼핑몰에 가는 습관 또는 이어폰 교체 사건으로 엽니다."],
      ["reuse", "비교 과정과 매장 디테일 재사용", "착용감, 배터리 수명, 직원에게 반품 정책 문의한 사실을 재사용합니다."],
      ["close", "실용적 선택과 만족으로 마무리", "충동구매를 줄이고 매일 잘 쓰고 있다는 만족감으로 닫습니다."],
    ]),
  },
  "light-fitness": {
    title: "공원 산책과 가벼운 조깅을 저압력 건강 루틴으로 확장하기",
    description:
      "무리한 운동 대신 공원에서 음악을 들으며 30분 걷고 컨디션에 따라 5~10분 조깅하는 장면을 바탕으로, 공원 묘사·일상 루틴·과거 운동 실패와의 대비로 변형합니다.",
    variants: [
      {
        id: "park-description",
        label: "자주 가는 공원",
        questionType: "장소 묘사",
        question: "Tell me about a park you often go to. What does it look like?",
        pivot: "집 근처 공원의 산책로와 걷기 편한 환경을 묘사하는 방향으로 시작합니다.",
        keep: ["park near apartment", "comfortable walking path", "fresh air"],
      },
      {
        id: "walking-routine",
        label: "가벼운 운동 루틴",
        questionType: "일상 루틴",
        question: "What kind of light exercise or workout routine do you follow regularly?",
        pivot: "편한 신발을 신고 팟캐스트나 음악을 들으며 30분 걷는 부담 없는 루틴을 설명합니다.",
        keep: ["30-minute walk", "podcast or playlist", "consistent routine"],
      },
      {
        id: "recent-walk",
        label: "최근 산책 경험",
        questionType: "최근 경험",
        question: "Describe a recent time you went for a walk or jog in a park.",
        pivot: "최근 날씨가 좋았던 날 30분 걷고 기분 좋게 10분 조깅했던 특정 하루를 강조합니다.",
        keep: ["good weather", "short jog", "cleared my head"],
      },
      {
        id: "fitness-change",
        label: "운동 방식의 변화",
        questionType: "과거와 현재",
        question: "How has your attitude toward exercise changed over time?",
        pivot: "헬스장 5일 목표로 실패하던 과거와 부담 없이 산책하는 현재의 태도 변화를 대비합니다.",
        keep: ["ambitious gym plans", "less pressure", "do it consistently"],
      },
    ],
    blueprint: blueprint([
      ["target", "장소 묘사인지 루틴인지 변화인지 파악", "공원 환경 묘사, 주간 걷기 루틴, 운동관의 변화 중 하나를 잡습니다."],
      ["open", "저압력 운동 정체성으로 열기", "‘나는 격한 운동을 즐기진 않지만 걷기를 좋아한다’는 솔직한 문장으로 시작합니다."],
      ["reuse", "음악과 30분 산책 장면 재사용", "comfortable shoes, playlist, 30 minutes walk 디테일을 일관되게 활용합니다."],
      ["close", "머리가 맑아지고 기분 전환됨으로 닫기", "지속 가능하고 기분 전환에 큰 도움이 된다는 긍정적인 결론으로 닫습니다."],
    ]),
  },
  "solo-staycation": {
    title: "1인 가구 스테이케이션과 느린 도시 여행을 질문에 맞게 전환하기",
    description:
      "혼자 사는 아파트에서 쉬는 집 휴가와 기차로 인근 도시를 당일치기로 여유롭게 걷는 여행 방식을 집 묘사·국내 여행·휴가관 변화로 연결합니다.",
    variants: [
      {
        id: "home-staycation",
        label: "집에서 보내는 휴가",
        questionType: "일상 루틴",
        question: "What do you usually do when you take a vacation at home?",
        pivot: "청소 후 소파에서 영화를 보고 간단한 음식을 먹으며 재충전하는 집 휴가를 설명합니다.",
        keep: ["live alone", "apartment staycation", "sofa and movie"],
      },
      {
        id: "recent-daytrip",
        label: "최근 당일치기 여행",
        questionType: "최근 경험",
        question: "Describe a memorable domestic trip or day trip you took recently.",
        pivot: "기차를 타고 가까운 도시의 한 동네를 천천히 걸으며 로컬 식당에 갔던 경험으로 전환합니다.",
        keep: ["short train trip", "one neighborhood", "local restaurant"],
      },
      {
        id: "home-description",
        label: "혼자 사는 집 묘사",
        questionType: "장소 묘사",
        question: "Describe your home. What is your favorite area inside?",
        pivot: "혼자 사는 아파트 구조와 창가 책상 및 소파 공간이 주는 아늑함에 집중합니다.",
        keep: ["small apartment", "sofa and desk near window", "place to recharge"],
      },
      {
        id: "vacation-change",
        label: "휴가관의 변화",
        questionType: "과거와 현재",
        question: "How has your idea of a good vacation changed compared to the past?",
        pivot: "바쁘게 여러 명소를 쫓기보다 한곳에서 스트레스 없이 쉬는 방식으로 바뀐 점을 강조합니다.",
        keep: ["used to visit many places", "slow down", "less stress"],
      },
    ],
    blueprint: blueprint([
      ["target", "집 휴가 vs 도시 여행 초점 확인", "집에서 쉬는 루틴인지, 기차 당일 여행인지, 과거-현재 휴가관 비교인지 파악합니다."],
      ["open", "1인 가구 휴식 출발점 설정", "혼자 사는 아파트 소개 또는 기차 당일치기 여행 시작으로 엽니다."],
      ["reuse", "느린 휴식과 한 동네 산책 디테일 재사용", "clean room, train trip, one neighborhood, slow pace 디테일을 유지합니다."],
      ["close", "재충전과 스트레스 해소로 마무리", "집이든 여행이든 일상으로 돌아올 힘을 얻었다는 결론으로 맺습니다."],
    ]),
  },
};
