export type LegalPageId = "about" | "privacy" | "contact" | "terms" | "editorial-policy" | "image-credits";

export type LegalPage = {
  id: LegalPageId;
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
    links?: { label: string; href: string }[];
  }[];
};

export const legalPages: Record<LegalPageId, LegalPage> = {
  about: {
    id: "about",
    eyebrow: "소개",
    title: "오픽온미란?",
    description: "오픽온미는 내 이야기 하나를 여러 질문과 목표 구간에 맞게 바꾸어 말하도록 돕는 OPIc 연습 도구입니다.",
    updatedAt: "2026-08-22",
    sections: [
      {
        heading: "운영자와 작성 책임",
        paragraphs: [
          "오픽온미는 운영자 나태킴이 직접 설계하고 관리하는 개인 OPIc 학습 프로젝트입니다. 사이트의 학습 흐름, 예시 답변, 매거진 글과 정정 내역의 최종 책임도 나태킴에게 있습니다.",
          "나태킴은 서베이 선택부터 스크립트 변형, 롤플레이, 녹음 복습까지 이어지는 학습 흐름을 실제 서비스 화면으로 구현하고 반복 점검합니다. 공개된 OPIc·ACTFL 공식 안내와 사이트 안의 훈련 예시를 교차 확인하되, 공식 기관의 자격이나 보증이 있는 것처럼 표현하지 않습니다.",
        ],
        links: [{ label: "콘텐츠 작성·검수 원칙 보기", href: "/editorial-policy/" }],
      },
      {
        heading: "내 이야기로 말하는 훈련",
        paragraphs: [
          "오픽온미(OOM, OPIc On Me)는 질문마다 새로운 모범답안을 외우는 대신, 학습자가 익숙한 경험 장면을 정리하고 여러 질문 유형에 맞춰 자연스럽게 바꾸어 말하도록 돕는 브라우저 기반 학습 도구입니다.",
          "이 서비스는 공식 시험기관과 제휴하거나 인증받은 서비스가 아니며, 등급 취득이나 특정 결과를 보장하지 않습니다.",
        ],
      },
      {
        heading: "Course × Level 학습 구조",
        paragraphs: ["Course는 서베이와 이야기 맥락을 정하고, Level은 같은 장면의 답변 밀도와 목표 시간을 조절합니다. 코스마다 네 개의 canonical story를 두고, 하나의 중심 장면을 묘사·루틴·경험·비교 같은 질문 방향에 재사용합니다."],
        bullets: ["1구간 · AL · 60~90초", "2구간 · IH / IM3 · 45~65초", "3구간 · IM2 / IM1 · 30~45초", "같은 story를 유지하며 질문에 따라 KEEP / CHANGE / REQUIRED / DROP fact 선택"],
      },
      {
        heading: "듣고, 말하고, 복기하고, 다시 말하기",
        paragraphs: ["목표와 코스를 고르는 STEP 1부터 실제형 질문을 듣고 녹음하는 STEP 6까지 하나의 훈련 흐름으로 이어집니다. 녹음 뒤에는 내 목소리를 재생하고, 필요하면 transcript와 KEEP / FIX / RETRY 피드백을 확인한 다음 같은 질문에 다시 답합니다."],
        links: [
          { label: "6 STEP 실전 훈련 둘러보기", href: "/training/" },
          { label: "OPIc 수험 가이드 보기", href: "/exam-guide/" },
        ],
      },
      {
        heading: "대상 사용자",
        paragraphs: ["OPIc을 처음 준비하는 학습자, 스크립트를 통째로 외우기보다 자신의 경험을 재사용하고 싶은 학습자, 실전 답변 시간을 맞춰 반복 연습하려는 사용자를 대상으로 합니다."],
      },
      {
        heading: "왜 만들었나요",
        paragraphs: [
          "OPIc 준비 과정에서는 서베이 선택, 난이도, 스크립트, 롤플레이, 녹음 복습이 따로 흩어져 있는 경우가 많습니다. 오픽온미는 이 흐름을 한 화면의 학습 순서로 묶어 학습자가 오늘 무엇을 연습해야 하는지 덜 헤매도록 돕기 위해 만들었습니다.",
          "특히 외운 답변을 그대로 읽는 방식보다 내 경험에서 하나의 장면을 고르고, 질문 유형에 맞춰 조금씩 바꾸어 말하는 연습을 중요하게 봅니다.",
        ],
      },
      {
        heading: "제공하지 않는 것",
        paragraphs: [
          "오픽온미는 공식 시험 접수, 성적 조회, 인증서 발급, 채점 대행 서비스를 제공하지 않습니다. 시험 일정, 응시료, 신분증 규정처럼 바뀔 수 있는 정보는 응시 전 공식 안내를 통해 확인해야 합니다.",
          "예시 답변과 가이드는 학습 참고용이며 특정 등급, 합격, 성적 향상 결과를 보장하지 않습니다.",
        ],
      },
    ],
  },
  privacy: {
    id: "privacy",
    eyebrow: "개인정보처리방침",
    title: "개인정보처리방침",
    description: "오픽온미의 개인정보 처리, 쿠키, Google 광고 쿠키, 제3자 광고 및 문의 방법을 안내합니다.",
    updatedAt: "2026-07-27",
    sections: [
      {
        heading: "수집하는 정보",
        paragraphs: [
          "오픽온미는 회원가입이나 자체 서버 로그인을 제공하지 않습니다. 사용자가 입력한 내부 LLM 설정은 현재 브라우저의 localStorage에만 저장되며, 오픽온미 서버로 전송되지 않습니다.",
          "서비스 이용 과정에서 브라우저, 기기, 접속 시간, 방문 페이지 같은 일반적인 서비스 이용 기록이 정적 호스팅, 분석 도구 또는 광고 도구를 통해 처리될 수 있습니다.",
        ],
      },
      {
        heading: "쿠키와 Google 광고",
        paragraphs: [
          "오픽온미는 Google AdSense를 포함한 광고 서비스를 사용할 수 있습니다. Google과 제3자 광고 사업자는 쿠키 또는 유사 기술을 사용해 사용자의 이전 방문 기록을 바탕으로 광고를 게재할 수 있습니다.",
          "Google 광고 쿠키를 통해 Google과 파트너는 이 사이트 및 다른 사이트 방문 정보를 활용해 맞춤 광고를 표시할 수 있습니다.",
        ],
        bullets: ["맞춤 광고 설정은 Google 광고 설정 페이지에서 변경할 수 있습니다.", "브라우저 설정에서 쿠키 저장을 차단하거나 기존 쿠키를 삭제할 수 있습니다.", "일부 쿠키를 제한하면 광고나 사이트 기능 일부가 다르게 동작할 수 있습니다."],
      },
      {
        heading: "제3자 광고 사업자",
        paragraphs: ["Google을 포함한 제3자 광고 사업자는 이 사이트에 광고를 게재할 수 있으며, 광고 제공 및 성과 측정을 위해 쿠키를 사용할 수 있습니다. 각 사업자의 개인정보 처리 방식은 해당 사업자의 정책을 따릅니다."],
      },
      {
        heading: "문의 및 시행일",
        paragraphs: ["개인정보 관련 문의는 86seongmin.kim@gmail.com 으로 보내 주세요.", "이 개인정보처리방침의 시행일은 2026년 6월 29일이며, 연락처와 광고 노출 범위는 2026년 7월 27일 갱신했습니다."],
      },
      {
        heading: "브라우저 localStorage",
        paragraphs: [
          "AI 피드백 설정 화면에서 사용자가 입력하는 endpoint, 인증 방식, 모델 이름, 토큰 정보는 현재 브라우저의 localStorage에 저장됩니다. 이 값은 오픽온미 서버로 별도 저장되지 않지만, 같은 기기를 함께 쓰는 경우 브라우저에 남을 수 있습니다.",
          "공용 PC나 다른 사람과 함께 사용하는 기기에서는 AI 설정을 저장하지 않거나 사용 후 브라우저 저장 데이터를 삭제하는 것을 권장합니다.",
        ],
      },
      {
        heading: "광고와 콘텐츠 분리",
        paragraphs: [
          "오픽온미는 Google AdSense 승인 여부와 무관하게 학습 기능을 우선합니다. 광고가 표시되는 경우에도 녹음 버튼, 답변 입력창, 설정 입력창처럼 사용자가 직접 조작하는 영역과 혼동되지 않도록 배치하는 것을 원칙으로 합니다.",
          "AI 설정, 실전 녹음, 문의, 개인정보처리방침, 이용약관, 편집 원칙, 이미지 출처처럼 입력·정책·신뢰 확인이 중심인 페이지에는 AdSense 스크립트를 로드하지 않습니다.",
        ],
      },
    ],
  },
  contact: {
    id: "contact",
    eyebrow: "문의",
    title: "문의",
    description: "오픽온미 서비스 관련 문의와 콘텐츠 정정 요청을 보내는 방법입니다.",
    updatedAt: "2026-07-27",
    sections: [
      {
        heading: "연락 방법",
        paragraphs: ["서비스 이용 문의, 콘텐츠 오류 제보, 개인정보 관련 요청은 86seongmin.kim@gmail.com 으로 보내 주세요. 문의 시 확인이 필요한 페이지 주소와 상황을 함께 적어 주시면 더 정확히 확인할 수 있습니다."],
        links: [{ label: "운영자 나태킴에게 이메일 보내기", href: "mailto:86seongmin.kim@gmail.com" }],
      },
      {
        heading: "응답 안내",
        paragraphs: ["오픽온미는 개인 학습자를 위한 정적 웹 도구이므로 실시간 상담을 제공하지 않습니다. 접수된 문의는 가능한 범위에서 순차적으로 확인합니다."],
      },
      {
        heading: "문의 이메일",
        paragraphs: [
          "오픽온미 관련 문의 이메일은 86seongmin.kim@gmail.com 입니다. 서비스 이용 문의, 콘텐츠 오류 제보, 개인정보 관련 요청, 광고 또는 정책 관련 문의를 이 주소로 보낼 수 있습니다.",
          "문의할 때는 확인이 필요한 페이지 주소, 사용 중인 브라우저, 오류가 발생한 상황을 함께 적어 주면 문제를 더 정확히 확인할 수 있습니다.",
        ],
        bullets: ["운영자: 나태킴", "이메일: 86seongmin.kim@gmail.com", "권장 포함 정보: 페이지 URL, 브라우저, 오류 상황", "민감한 API key나 개인 토큰은 이메일에 포함하지 마세요."],
      },
      {
        heading: "콘텐츠 정정 요청",
        paragraphs: [
          "시험 운영 정보, 공식 링크, 학습 설명 중 부정확하거나 오래된 내용이 보이면 정정 요청을 보낼 수 있습니다. 오픽온미는 공식 기관이 아니므로 시험 관련 최종 판단은 반드시 공식 안내를 기준으로 해야 합니다.",
          "콘텐츠는 학습 참고용으로 제공되며, 개별 사용자의 등급 결과를 보장하거나 응시 전략을 확정적으로 제시하지 않습니다.",
        ],
      },
    ],
  },
  "editorial-policy": {
    id: "editorial-policy",
    eyebrow: "편집 원칙",
    title: "콘텐츠 작성·검수 원칙",
    description: "오픽온미의 작성 책임, 공식 자료 확인, 예시 답변 제작, 수정 기록과 AI 보조 도구 사용 기준을 공개합니다.",
    updatedAt: "2026-07-27",
    sections: [
      {
        heading: "작성자와 책임",
        paragraphs: [
          "오픽온미의 운영자이자 기본 작성자는 나태킴입니다. 매거진 글과 학습 가이드는 익명 대량 게시물이 아니라, 오픽온미의 실제 훈련 화면에서 어떤 순서로 연습할지 설명하기 위해 작성합니다.",
          "각 글에는 작성자, 최초 공개일, 최종 수정일과 참고 자료를 표시합니다. 외부 필자가 참여하거나 별도 검수가 이루어지는 경우에는 해당 책임자를 글에 추가로 밝힙니다.",
        ],
      },
      {
        heading: "공식 정보와 학습 조언의 구분",
        paragraphs: [
          "시험 시간, 응시료, 신분증, 등급 체계처럼 확인 가능한 사실은 OPIc 공식 수험자 가이드와 ACTFL 공개 자료를 우선 확인합니다. 변동 가능한 항목은 확인 기준일과 공식 링크를 함께 제공합니다.",
          "장면 중심 스크립트, 녹음 복습, 필러 사용처럼 오픽온미가 제안하는 연습법은 공식 채점 기준과 구분해 표시하며 특정 등급이나 점수 향상을 보장하지 않습니다.",
        ],
        links: [
          { label: "OPIc 공식 수험자 가이드", href: "https://www.opic.or.kr/opics/servlet/controller.opic.site.guide.GuideServlet?p_process=move-exam-guide" },
          { label: "ACTFL Proficiency Guidelines 2024", href: "https://www.opic.or.kr/senior/img/com_2/ACTFL_Proficiency_Guidelines_2024.pdf" },
        ],
      },
      {
        heading: "예시 답변과 독자적 가치",
        paragraphs: [
          "영어 예문은 외부 답안을 복사하지 않고 오픽온미의 장면·변형·회복 훈련 구조에 맞춰 직접 작성합니다. 예문을 정답처럼 외우게 하기보다 장소, 행동, 이유, 변화 중 무엇을 바꾸어 자기 경험으로 옮길지 설명합니다.",
          "글을 추가할 때는 비슷한 검색어를 늘리는 것보다 기존 글과 다른 학습 문제를 해결하는지 먼저 확인합니다. 중복이 큰 글은 새 글로 만들지 않고 기존 글에 통합하거나 관련 훈련 화면으로 연결합니다.",
        ],
      },
      {
        heading: "AI 보조 도구 사용",
        paragraphs: [
          "초안 정리, 맞춤법 확인 또는 코드 구현에 AI 보조 도구를 사용할 수 있습니다. 다만 운영자 나태킴이 최종 문장, 예시의 질문 적합성, 공식 링크와 공개일을 직접 확인한 뒤 게시합니다.",
          "AI가 생성했다는 이유만으로 내용을 사실로 취급하지 않으며, 확인할 수 없는 응시 경험, 성과, 통계, 전문가 경력은 만들지 않습니다.",
        ],
      },
      {
        heading: "수정과 정정 요청",
        paragraphs: [
          "사실 오류, 오래된 공식 정보, 작동하지 않는 링크, 출처 누락이 확인되면 해당 글의 수정일과 내용을 갱신합니다. 중요한 변경은 글 본문이나 편집 원칙에 이유를 남깁니다.",
          "정정 요청은 86seongmin.kim@gmail.com 으로 받을 수 있습니다. 페이지 URL과 수정이 필요한 문장을 함께 보내면 운영자 나태킴이 확인합니다.",
        ],
        links: [{ label: "정정 요청 이메일 보내기", href: "mailto:86seongmin.kim@gmail.com" }],
      },
    ],
  },
  "image-credits": {
    id: "image-credits",
    eyebrow: "이미지 출처",
    title: "이미지 출처",
    description: "오픽온미 매거진 표지에 사용한 외부 이미지 중 저작자 표시가 필요한 이미지의 출처와 라이선스를 정리합니다.",
    updatedAt: "2026-07-12",
    sections: [
      {
        heading: "표기 기준",
        paragraphs: [
          "오픽온미는 매거진 표지 이미지를 외부 URL로 직접 연결하지 않고 프로젝트 asset으로 저장해 사용합니다. 이 페이지는 CC BY, CC BY-SA처럼 저작자 표시가 필요한 이미지의 출처를 공개하기 위한 페이지입니다.",
          "아래 이미지는 OPIc 학습 콘텐츠의 표지 크기에 맞춰 로컬 파일로 저장해 사용하며, 별도의 AI 이미지 생성은 사용하지 않았습니다.",
        ],
        bullets: ["수정 여부: 웹 표지 표시를 위한 로컬 저장 및 빌드 번들링", "이미지 자체의 저작권과 라이선스는 각 원 출처와 라이선스 조건을 따릅니다.", "CC0 이미지는 별도 저작자 표시 의무가 없지만 내부 출처 문서에 기록해 둡니다."],
      },
      {
        heading: "OPIc 서베이 선택, 답변 범위를 좁히는 기준",
        paragraphs: [
          "이미지 파일: src/assets/magazine/opic-survey-choice-guide-cover.jpg",
          "저작자: Generationbass.com",
          "수정 여부: 원본 이미지를 로컬 asset으로 저장하고 Vite 빌드 과정에서 번들링했습니다.",
        ],
        links: [
          { label: "출처 이미지: Pen, Diary and Glasses", href: "https://www.flickr.com/photos/46959536@N04/4827013488" },
          { label: "라이선스: CC BY 2.0", href: "https://creativecommons.org/licenses/by/2.0/" },
        ],
      },
      {
        heading: "녹음으로 답변을 고치는 10분 루틴",
        paragraphs: [
          "이미지 파일: src/assets/magazine/opic-recording-review-routine-cover.jpg",
          "저작자: TimWilson",
          "수정 여부: 원본 이미지를 로컬 asset으로 저장하고 Vite 빌드 과정에서 번들링했습니다.",
        ],
        links: [
          { label: "출처 이미지: The Podcave", href: "https://www.flickr.com/photos/70816538@N00/76894378" },
          { label: "라이선스: CC BY 2.0", href: "https://creativecommons.org/licenses/by/2.0/" },
        ],
      },
      {
        heading: "여행 주제를 묘사·비교·문제해결로 확장하는 법",
        paragraphs: [
          "이미지 파일: src/assets/magazine/opic-travel-topic-script-guide-cover.jpg",
          "저작자: brewbooks",
          "수정 여부: 원본 이미지를 로컬 asset으로 저장하고 Vite 빌드 과정에서 번들링했습니다.",
        ],
        links: [
          { label: "출처 이미지: Whats' in My Bag? Packed", href: "https://www.flickr.com/photos/93452909@N00/4256613426" },
          { label: "라이선스: CC BY-SA 2.0", href: "https://creativecommons.org/licenses/by-sa/2.0/" },
        ],
      },
      {
        heading: "카페·집·실내활동 답변 소재 만드는 법",
        paragraphs: [
          "이미지 파일: src/assets/magazine/opic-indoor-topic-guide-cover.jpg",
          "저작자: Rawpixel Ltd",
          "수정 여부: 원본 이미지를 로컬 asset으로 저장하고 Vite 빌드 과정에서 번들링했습니다.",
        ],
        links: [
          { label: "출처 이미지: Business meeting at a cafe", href: "https://www.flickr.com/photos/147875007@N03/45739277852" },
          { label: "라이선스: CC BY 2.0", href: "https://creativecommons.org/licenses/by/2.0/" },
        ],
      },
      {
        heading: "IM에서 IH로 올릴 때 바꿔야 할 답변 습관",
        paragraphs: [
          "이미지 파일: src/assets/magazine/opic-im-to-ih-practice-plan-cover.jpg",
          "저작자: Bohman",
          "수정 여부: 원본 이미지를 로컬 asset으로 저장하고 Vite 빌드 과정에서 번들링했습니다.",
        ],
        links: [
          { label: "출처 이미지: moleskine-1", href: "https://www.flickr.com/photos/79729522@N00/3216438752" },
          { label: "라이선스: CC BY 2.0", href: "https://creativecommons.org/licenses/by/2.0/" },
        ],
      },
      {
        heading: "시험 일주일 전 OPIc 학습 플랜",
        paragraphs: [
          "이미지 파일: src/assets/magazine/opic-last-week-study-plan-cover.jpg",
          "저작자: Infodad",
          "수정 여부: 원본 이미지를 로컬 asset으로 저장하고 Vite 빌드 과정에서 번들링했습니다.",
        ],
        links: [
          { label: "출처 이미지: Moleskine", href: "https://www.flickr.com/photos/39154012@N00/4072560067" },
          { label: "라이선스: CC BY-SA 2.0", href: "https://creativecommons.org/licenses/by-sa/2.0/" },
        ],
      },
      {
        heading: "CC0 이미지",
        paragraphs: [
          "난이도 5-5 가이드, 롤플레이 6단계 템플릿, 집/거주지 주제 가이드, 답변 체크리스트 표지에는 CC0 이미지가 사용되었습니다. CC0 이미지는 저작자 표시 의무가 없지만, 투명성을 위해 docs/image-sources.md에 출처와 다운로드 정보를 기록했습니다.",
        ],
      },
    ],
  },
  terms: {
    id: "terms",
    eyebrow: "이용약관",
    title: "이용약관",
    description: "오픽온미 이용 시 주의사항, 학습 참고용 고지, 비공식 관계를 안내합니다.",
    updatedAt: "2026-06-29",
    sections: [
      {
        heading: "서비스 성격",
        paragraphs: [
          "오픽온미는 OPIc 말하기 연습을 돕는 학습 참고용 서비스입니다. 제공되는 스크립트, 예시 답변, 가이드, 피드백 흐름은 시험 준비를 위한 참고 자료이며 공식 채점 기준이나 결과를 대체하지 않습니다.",
          "오픽온미는 ETS, ACTFL, OPIc 운영기관 또는 관련 공식 기관과 제휴, 인증, 후원 관계에 있지 않습니다.",
        ],
      },
      {
        heading: "이용 시 주의사항",
        paragraphs: ["사용자는 서비스 내용을 자신의 학습 상황에 맞게 참고해야 하며, 실제 시험 일정, 응시료, 신분증 규정, 성적 발표 등 변동 가능한 정보는 반드시 공식 안내를 통해 최종 확인해야 합니다."],
        bullets: ["특정 등급, 합격, 성적 향상은 보장하지 않습니다.", "AI 피드백 기능은 사용자가 직접 입력한 외부 LLM 설정에 따라 동작합니다.", "공유 PC에서는 localStorage에 저장된 설정을 사용 후 삭제하는 것이 좋습니다."],
      },
      {
        heading: "콘텐츠와 책임",
        paragraphs: ["오픽온미의 콘텐츠를 무단 복제하거나 상업적으로 재배포할 수 없습니다. 서비스는 정적 웹 환경과 브라우저 API에 의존하므로, 기기와 브라우저 상태에 따라 일부 기능이 제한될 수 있습니다."],
      },
      {
        heading: "비공식 학습 도구 고지",
        paragraphs: [
          "오픽온미는 OPIc 말하기 연습을 돕는 비공식 학습 도구입니다. ETS, ACTFL, OPIc 운영기관 또는 관련 공식 기관과 제휴, 인증, 후원, 보증 관계에 있지 않습니다.",
          "서비스 안의 예시 답변, 등급 설명, 롤플레이 구조, 녹음 복습 루틴은 학습자가 연습 방향을 잡기 위한 자료이며 공식 채점 기준이나 실제 시험 결과를 대체하지 않습니다.",
        ],
      },
      {
        heading: "결과 보장 없음",
        paragraphs: [
          "오픽온미 사용 여부만으로 특정 등급 취득, 합격, 성적 향상, 시험 결과를 보장하지 않습니다. 학습 결과는 사용자의 기존 실력, 연습 시간, 실제 시험 환경, 당일 컨디션 등에 따라 달라질 수 있습니다.",
          "사용자는 서비스의 자료를 자신의 학습 상황에 맞게 참고해야 하며, 시험 응시 전 최신 규정과 준비물은 공식 안내를 통해 직접 확인해야 합니다.",
        ],
      },
    ],
  },
};
