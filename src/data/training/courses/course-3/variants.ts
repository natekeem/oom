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
  "trail-photo": {
    title: "공원 트레일과 사진 촬영을 묘사·루틴·변화로 확장하기",
    description:
      "룸메이트와 토요일 아침 공원 트레일을 걸어 전망대에서 사진을 찍은 장면을 공원 묘사, 주말 하이킹 루틴, 사진 촬영 경험, 취미 태도 변화로 재구성합니다.",
    variants: [
      {
        id: "favorite-park",
        label: "자주 가는 공원",
        questionType: "장소 묘사",
        question: "Tell me about a park or hiking trail you frequently visit. What makes it special?",
        pivot: "집 근처 큰 공원의 완만한 트레일과 작은 전망대를 묘사하는 문장으로 엽니다.",
        keep: ["large local park", "easy trail", "small overlook"],
      },
      {
        id: "weekend-hiking",
        label: "주말 걷기·하이킹 루틴",
        questionType: "일상 루틴",
        question: "What is your typical routine when you go walking or hiking on weekends?",
        pivot: "토요일 아침 룸메이트와 편한 신발을 신고 완만한 길을 걷는 루틴에 맞춥니다.",
        keep: ["Saturday morning", "roommate", "comfortable shoes"],
      },
      {
        id: "photo-memory",
        label: "사진을 찍은 최근 경험",
        questionType: "최근 경험",
        question: "Describe a recent experience when you took interesting photos outdoors.",
        pivot: "전망대에 도착해 나무와 멀리 보이는 도시를 휴대폰으로 담았던 순간에 집중합니다.",
        keep: ["took photos", "morning light", "clear scenery"],
      },
      {
        id: "hobby-change",
        label: "취미 태도의 변화",
        questionType: "과거와 현재",
        question: "How has your perspective on walking or photography changed over time?",
        pivot: "거리나 속도에만 집착하던 과거와 달리 주변 풍경을 관찰하고 사진으로 기록하는 여유를 즐기게 된 변화로 연결합니다.",
        keep: ["used to rush", "look closely", "peace of mind"],
      },
    ],
    blueprint: blueprint([
      ["target", "공원 장소인지 하이킹 루틴인지 사진 경험인지 파악", "질문의 핵심이 trail 묘사인지, weekend routine인지, photo memory인지 확인합니다."],
      ["open", "아침 트레일 출발점으로 열기", "공원 위치 소개, 주말 아침 준비, 전망대 도착 중 질문에 맞게 시작합니다."],
      ["reuse", "전망대와 사진 촬영 디테일 재사용", "morning air, viewpoint, took pictures, shared snacks 디테일을 유지합니다."],
      ["close", "상쾌함과 스트레스 해소로 마무리", "맑은 공기를 마시고 한 주를 상쾌하게 시작할 수 있었다는 결론으로 닫습니다."],
    ]),
  },
  "coastal-camp": {
    title: "해안 캠핑과 드라이브 경험을 문제 해결과 여행관 변화로 연결하기",
    description:
      "친구와 차를 타고 해안 캠핑장으로 가 강풍 문제를 해결하고 바다를 즐긴 경험을 바탕으로, 기억나는 캠핑 여행, 여행 문제 해결, 드라이브 루틴, 여행관 변화로 변형합니다.",
    variants: [
      {
        id: "camping-trip",
        label: "기억에 남는 캠핑 여행",
        questionType: "최근 경험",
        question: "Tell me about a memorable camping or outdoor trip you took recently.",
        pivot: "메인 스토리의 첫 문단 그대로 해안 도로 드라이브와 캠핑장 도착 경험을 또렷하게 전달합니다.",
        keep: ["coastal campground", "ocean breeze", "outdoor meal"],
      },
      {
        id: "travel-problem",
        label: "여행 중 겪은 문제와 해결",
        questionType: "예상 밖 상황",
        question: "Describe an unexpected problem you experienced during a trip and how you handled it.",
        pivot: "갑작스러운 바닷바람으로 텐트가 흔들렸을 때 이웃 캠퍼의 조언으로 팩을 단단히 고정했던 해결 과정에 집중합니다.",
        keep: ["strong wind", "neighbor helped", "secured the tent safely"],
      },
      {
        id: "drive-routine",
        label: "캠핑장으로 간 드라이브",
        questionType: "최근 이동 경험",
        question: "Describe the drive to your coastal campsite.",
        pivot: "새 드라이브 루틴을 만들지 않고 친구와 두 시간 이동해 캠핑장에 도착한 같은 여정을 말합니다.",
        keep: ["friend", "two-hour drive", "coastal campsite"],
      },
      {
        id: "travel-style-change",
        label: "여행관의 변화",
        questionType: "과거와 현재",
        question: "How has your approach to traveling or outdoor trips changed over the years?",
        pivot: "모든 것을 완벽하게 통제하려던 과거와 달리 예상 밖 상황에도 유연하게 대처하며 여정을 즐기게 된 변화를 설명합니다.",
        keep: ["strict schedules", "stay flexible", "enjoy the unexpected"],
      },
    ],
    blueprint: blueprint([
      ["target", "캠핑 경험 vs 문제 해결 vs 드라이브 파악", "단순 캠핑 이야기인지, 날씨 문제 해결인지, 드라이브 루틴인지 확인합니다."],
      ["open", "해안 이동 장면으로 시작", "캠핑 출발 또는 주말 드라이브 선언 문장으로 질문에 맞게 시작합니다."],
      ["reuse", "캠핑장 바다 풍경과 대처 과정 재사용", "ocean view, set up tent, wind problem, shared meal 디테일을 재사용합니다."],
      ["close", "유연성과 기억에 남는 추억으로 닫기", "작은 도전이 있었지만 그 덕분에 더 오래 기억에 남는 여행이 되었다는 결론으로 닫습니다."],
    ]),
  },
  "museum-reading": {
    title: "박물관 전시와 독서 루틴을 장소 묘사·최근 경험·관점 변화로 전환하기",
    description:
      "비 오는 날 작은 박물관에서 흑백 사진전을 보고 카페에서 도록을 읽은 경험을 좋아하는 박물관 묘사, 최근 전시 관람, 조용한 독서 루틴, 시각의 변화로 바꿉니다.",
    variants: [
      {
        id: "museum-description",
        label: "좋아하는 박물관",
        questionType: "장소 묘사",
        question: "Tell me about a museum or art gallery you like to visit.",
        pivot: "도심 속 한적한 골목에 위치한 작은 사진 박물관과 아늑한 카페 공간을 묘사합니다.",
        keep: ["quiet photography museum", "peaceful gallery", "museum cafe"],
      },
      {
        id: "recent-exhibition",
        label: "최근 관람한 전시",
        questionType: "최근 경험",
        question: "Describe a recent exhibition or cultural event you attended.",
        pivot: "메인 스토리대로 비 오는 오후에 방문해 일상 풍경을 담은 흑백 사진전을 감상했던 경험에 집중합니다.",
        keep: ["rainy afternoon", "black and white photos", "everyday moments"],
      },
      {
        id: "reading-routine",
        label: "전시 후 도록 읽기",
        questionType: "최근 경험",
        question: "What did you read after visiting the photography exhibition?",
        pivot: "같은 박물관 카페에서 전시 안내서를 읽은 장면만 자세히 고릅니다.",
        keep: ["museum cafe", "exhibition guide", "photography exhibition"],
      },
      {
        id: "perspective-change",
        label: "관점의 변화",
        questionType: "과거와 현재",
        question: "How has your appreciation for art or photography changed over time?",
        pivot: "유명한 작품만 찾던 과거에서 일상의 사소한 순간을 따뜻하게 포착한 사진을 더 깊이 감상하게 된 변화로 연결합니다.",
        keep: ["used to look for famous works", "appreciate simple moments", "slow down"],
      },
    ],
    blueprint: blueprint([
      ["target", "박물관 공간 vs 전시 관람 vs 독서 습관 확인", "공간 묘사인지, 전시 경험인지, 독서/휴식 습관인지 질문 단어를 확인합니다."],
      ["open", "비 오는 날의 차분한 출발", "조용한 박물관 소개, 최근 비 오던 날의 방문, 평소 독서 습관으로 엽니다."],
      ["reuse", "흑백 사진과 카페 도록 읽기 디테일 재사용", "black and white photos, exhibition guide, museum cafe 디테일을 활용합니다."],
      ["close", "차분한 사색과 힐링으로 마무리", "복잡한 생각에서 벗어나 마음이 차분해졌다는 감정으로 닫습니다."],
    ]),
  },
  "shared-home-vacation": {
    title: "룸메이트 공유 주거와 집 휴가를 해외여행 회상과 휴가관 변화로 풀기",
    description:
      "룸메이트와 집에서 편안하게 지내며 지난 해외여행 사진을 정리했던 집 휴가 장면을 바탕으로, 공유 주거 묘사, 집 휴가 루틴, 과거 해외여행 회상, 휴가관 변화로 변형합니다.",
    variants: [
      {
        id: "shared-home",
        label: "룸메이트와 사는 집",
        questionType: "장소 묘사",
        question: "Describe the home you live in with your roommate. How is the space shared?",
        pivot: "거실과 주방을 함께 쓰고 각자의 방에서 쉬는 편안한 주거 공간 구조를 설명합니다.",
        keep: ["shared apartment", "living room and kitchen", "comfortable space"],
      },
      {
        id: "home-holiday",
        label: "집에서 보낸 연휴",
        questionType: "일상 루틴",
        question: "What do you usually do when you spend a holiday or long weekend at home?",
        pivot: "비 오는 연휴에 룸메이트와 집을 정돈하고 음식을 함께 만들어 먹으며 쉬는 루틴을 말합니다.",
        keep: ["rainy long weekend", "made simple food", "relax together"],
      },
      {
        id: "overseas-memory",
        label: "지난 해외여행의 회상",
        questionType: "과거 경험",
        question: "Tell me about a memorable overseas trip you took in the past.",
        pivot: "집에서 사진첩을 보며 떠올렸던 과거 해외 도시 여행의 특별했던 순간을 회상합니다.",
        keep: ["overseas trip photo album", "city walk abroad", "great memories"],
      },
      {
        id: "vacation-preference",
        label: "선호하는 휴가 방식",
        questionType: "과거와 현재",
        question: "How have your preferences for holidays changed compared to the past?",
        pivot: "피곤하게 관광지를 돌던 여행에서 룸메이트와 집에서 푹 쉬거나 여유로운 일정을 선호하게 된 변화로 맺습니다.",
        keep: ["used to travel fast", "value true rest", "balanced lifestyle"],
      },
    ],
    blueprint: blueprint([
      ["target", "공유 주거 vs 집 휴가 vs 해외여행 구분", "룸메이트와의 집 묘사인지, 집 휴가인지, 과거 해외여행 회상인지 확인합니다."],
      ["open", "공유 공간 또는 연휴의 출발점 설정", "룸메이트와 사는 아파트 소개 또는 집에서 연휴를 시작한 날로 엽니다."],
      ["reuse", "사진 정리와 요리, 휴식 디테일 재사용", "clean up the living room, travel photos, shared meal 디테일을 재사용합니다."],
      ["close", "편안한 휴식과 일상의 충전으로 마무리", "집에서의 시간이 여행 못지않게 몸과 마음을 채워 주었다는 결론으로 닫습니다."],
    ]),
  },
};

export const variantSets = defineVariantSets(authoredVariantSets);
