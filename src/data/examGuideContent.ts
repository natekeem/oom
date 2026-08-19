export type ExamGuideSection = "exam-overview" | "exam-apply" | "exam-day" | "exam-results" | "exam-faq";

export const examGuideSections: Array<{ id: ExamGuideSection; label: string; shortLabel: string; description: string }> = [
  { id: "exam-overview", label: "OPIc 소개 · 등급", shortLabel: "소개 · 등급", description: "시험의 목적, 형식, 등급 체계와 전체 흐름" },
  { id: "exam-apply", label: "회원 · 신청 · 응시료", shortLabel: "신청 · 응시료", description: "회원가입, 접수 과정, 응시료와 지원 안내" },
  { id: "exam-day", label: "신분증 · 입실 · 진행", shortLabel: "당일 진행", description: "규정 신분증, 입실 통제, 시험 진행 프로세스" },
  { id: "exam-results", label: "성적 · 인증서 · 쿠폰", shortLabel: "성적 · 쿠폰", description: "성적 발표, 인증서, UR과 세이빙 쿠폰" },
  { id: "exam-faq", label: "자주 묻는 질문", shortLabel: "Q&A", description: "시험장과 준비 과정에서 자주 헷갈리는 질문 모음" },
];

export const guideSourceNote = "규정성 정보는 제공된 OPIc 공식 안내(응시료는 2025년 11월 1일 신청부터 적용) 기준으로 정리했습니다. 시험 신청 직전에는 공식 사이트의 최신 공지와 수험자 가이드를 다시 확인하세요.";

export const examAtAGlance = [
  { label: "평가 언어", value: "영어 포함 7개 언어", detail: "영어, 중국어, 러시아어, 스페인어, 한국어, 일본어, 베트남어" },
  { label: "문항 수", value: "약 12~15문항", detail: "배경과 관심사에 맞춘 개인 맞춤형 문항" },
  { label: "시험 시간", value: "본시험 약 40분", detail: "오리엔테이션 포함 전체 약 60분" },
  { label: "평가 방식", value: "Holistic Evaluation", detail: "전체 답변을 ACTFL Proficiency Guidelines 기준으로 종합 평가" },
];

export const gradeGuide = [
  { band: "Novice", levels: "NL · NM · NH", tone: "zinc", explanation: "암기한 단어·표현에서 출발해 일상 소재의 기본 질문과 응답을 만드는 단계입니다.", focus: "짧아도 문장으로 말하고, 익숙한 주제에서 자신 있게 답하기" },
  { band: "Intermediate", levels: "IL · IM1 · IM2 · IM3 · IH", tone: "emerald", explanation: "일상과 친숙한 경험을 문장으로 연결하고, IM3와 IH에서는 발화량·구체성·문제 해결의 폭이 중요해집니다.", focus: "장면, 시간, 활동, 감정을 이어서 말하기" },
  { band: "Advanced", levels: "AL", tone: "amber", explanation: "동사 시제와 접속사를 비교적 일관되게 쓰며, 익숙하지 않은 복잡한 상황도 설명하고 해결하는 능숙도를 봅니다.", focus: "변화·비교·문제 해결을 하나의 흐름으로 엮기" },
];

export const examProcess = [
  { step: "1", title: "Background Survey", detail: "평가 문항을 위한 사전 설문입니다. OOM STEP 1에서 고정한 조합을 선택합니다.", phase: "orientation" },
  { step: "2", title: "Self Assessment", detail: "평가 난이도를 결정하기 위한 수준 선택입니다.", phase: "orientation" },
  { step: "3", title: "Pre-Test Setup", detail: "질문 청취와 답변 녹음 기능을 사전 점검합니다.", phase: "orientation" },
  { step: "4", title: "Sample Question", detail: "화면 구성, 청취·답변 방법을 안내받고 답변을 연습합니다.", phase: "orientation" },
  { step: "5", title: "1st Session", detail: "개인 맞춤형 문항 약 7문항. 질문을 2회 듣고 답변합니다.", phase: "test" },
  { step: "6", title: "난이도 재조정", detail: "쉬운·비슷한·어려운 질문 중 2차 난이도를 선택합니다.", phase: "test" },
  { step: "7", title: "2nd Session", detail: "개인 맞춤형 문항 약 5~8문항. 문항별 답변 시간 제한은 없습니다.", phase: "test" },
];

export const membershipGuidance = [
  { title: "회원가입 후 시험 신청", detail: "휴대폰 또는 아이핀 본인인증을 거쳐 가입한 뒤 시험을 신청할 수 있습니다. 14세 미만은 법정대리인 인증이 필요합니다." },
  { title: "탈퇴 전 확인할 것", detail: "탈퇴하면 성적 확인과 인증서 출력이 불가능하고 지급된 쿠폰도 삭제됩니다. 미리 출력한 인증서 역시 외부 제출·활용 시 불이익이 있을 수 있습니다." },
  { title: "재가입과 제한", detail: "탈퇴 후 재가입은 30일이 지나야 가능하며, 사용하던 아이디는 다시 사용할 수 없습니다. 규정 위반·부정행위로 응시 제한 기간에는 탈퇴가 제한될 수 있습니다." },
  { title: "장애 수험자 상담", detail: "시각·청각 및 기타 신체 장애 수험자는 1:1 문의 또는 고객센터에서 상담 후 신청해야 합니다." },
];

export const feeRows = [
  { exam: "OPIc", name: "Oral Proficiency Interview - computer", fee: "84,000원", emphasis: true },
];

export const applyStepsDetailed = [
  { title: "회원가입 · 본인인증", detail: "본인 명의 정보를 확인하고, 필요한 경우 장애 수험자 상담을 먼저 진행합니다." },
  { title: "일정 · 센터 선택", detail: "희망일의 접수 가능 여부, 센터, 입실 시간과 변경·취소 규정을 확인합니다." },
  { title: "시험 유형 · 결제", detail: "시험 유형과 응시료를 확인한 뒤 결제합니다. 단체·기관 시험은 별도 응시료가 적용될 수 있습니다." },
  { title: "접수 완료 · 당일 준비", detail: "나의 OPIc에서 접수 상태를 확인하고 규정 신분증과 입실 시간을 점검합니다." },
];

export const identityGroups = [
  { title: "일반인", accepted: "주민등록증, 자동차운전면허증, 유효기간 전 여권, 공무원증, 장애인 복지카드, 국가보훈등록증", alternative: "사진이 부착된 유효기간 내 주민등록증 발급 신청 확인서" },
  { title: "초등학생", accepted: "유효기간 전 여권, 주민등록등본·초본, 건강보험증, 청소년증", alternative: "직인을 받은 신분확인증명서" },
  { title: "중·고등학생", accepted: "국내 학생증, 유효기간 전 여권, 청소년증", alternative: "공식 수험자 가이드에서 개별 기준 재확인" },
  { title: "외국인 · 재외국인", accepted: "외국인등록증, 국내거소신고증, 영주증, 재외국인 주민등록증 또는 유효기간 전 여권", alternative: "대체 증명서 없음" },
];

export const identityWarnings = [
  "법적 효력이 있는 모바일 신분증은 인정되지만, 캡처본은 인정되지 않습니다.",
  "모든 규정 신분증과 확인서류는 원본만 인정됩니다. 사본·촬영본·훼손되었거나 본인 식별이 어려운 신분증은 거부될 수 있습니다.",
  "대학·대학원 학생증, 사원증, 구 주민등록증, 각종 자격증, 사진 부착 신용카드, 국제운전면허증, 유효기간이 지난 신분증 등은 인정되지 않는 예시에 포함됩니다.",
];

export const militaryIdGuidance = [
  { target: "장교 · 부사관 · 군무원 · 국방공무원", primary: "공무원증", alternative: "일반인 규정 신분증 + 군복무확인서 또는 밀리패스" },
  { target: "병", primary: "신분확인증명서(부대장 직인) + 외출·외박증", alternative: "일반인 규정 신분증 + 외출·외박증·휴가증 또는 밀리패스" },
  { target: "사관생도", primary: "사관생도신분증", alternative: "일반인 규정 신분증 + 밀리패스" },
  { target: "사관후보생(ROTC)", primary: "신분확인증명서(학군단장 직인) 또는 유효한 후보생증 + 규정 신분증", alternative: "일반인 규정 신분증 + 밀리패스" },
];

export const dayOfExamRules = [
  { title: "시험 시작 10분 전까지 도착", detail: "센터 입구의 명단·유의사항을 확인하고 감독관 안내에 따라 1차 신분 확인을 거쳐 입실합니다." },
  { title: "입실 통제", detail: "예를 들어 10시 시험이면 9:50~9:59에 입실하고, 10시 정시부터 입실 통제 및 지각 판정이 적용됩니다." },
  { title: "입실 불가 사유", detail: "명단에 없거나 접수가 완료되지 않은 경우, 규정 신분증 또는 할인 시험 추가 확인 서류를 지참하지 않은 경우, 지각한 경우에는 입실할 수 없습니다." },
  { title: "현장 오류 대응", detail: "PC 기반 평가 중 네트워크·시스템 오류가 나면 즉시 감독관에게 알립니다. 일시적 장애는 조치 뒤 시험을 재개할 수 있습니다." },
];

export const resultGuidance = [
  { title: "성적 발표", detail: "OPIc 성적은 응시일로부터 5일 후 13:00 이후 발표 예정입니다. 채점 기관 사정에 따라 지연될 수 있으며 특정 시험일은 조기 발표될 수 있습니다." },
  { title: "유효기간", detail: "성적과 응시 정보의 확인 가능 기간은 응시일로부터 2년입니다. 기간이 지나면 확인할 수 없습니다." },
  { title: "인증서", detail: "성적 공개 뒤 홈페이지에서 인증서를 직접 출력할 수 있습니다. 스캔본·팩스 전송은 제공되지 않습니다." },
  { title: "성적 제출", detail: "기관 제출 시 등급, Test ID, 응시일을 정확히 기재하고 I·L·O·0처럼 혼동하기 쉬운 문자를 다시 확인합니다." },
];

export const savingCouponRules = [
  { title: "지급 사례", detail: "지각, 규정 신분증·관련 서류 미지참, 당일 녹음 불량 등 시스템 문제로 채점이 불가한 UR 판정에 세이빙 쿠폰이 지급될 수 있습니다." },
  { title: "현장 확인", detail: "시험 당일 반드시 응시 장소에 도착해 감독관 확인을 받아야 합니다. 시험 시간이 지난 뒤나 전화 등 비대면으로 신청할 수 없습니다." },
  { title: "유효기간 · 사용 범위", detail: "지급일로부터 180일간 유효하며 기간 연장·현금 전환·다른 쿠폰과 중복 사용은 불가합니다. 일반시험에서만 사용 가능하고 단체·할인시험에는 사용할 수 없습니다." },
  { title: "UR 안내", detail: "기계적 문제로 정상 채점이 불가하면 재시험 또는 응시료 전액 환불이 이뤄질 수 있습니다. 답변 미흡 같은 응시자 귀책 사유는 대상이 아닙니다." },
];

export const officialGuideLinks = {
  inquiry: "https://www.opic.or.kr/opics/servlet/controller.opic.site.cscenter.MailServlet?p_process=select-qna-list",
  identificationForm: "https://www.opic.or.kr/opics/jsp/senior/guide/ACTFL.docx",
  actflGuidelines: "https://www.opic.or.kr/senior/img/com_2/ACTFL_Proficiency_Guidelines_2024.pdf",
  guide: "https://www.opic.or.kr/opics/servlet/controller.opic.site.guide.GuideServlet?p_process=move-exam-guide",
  apply: "https://www.opic.or.kr/opics/servlet/controller.opic.site.apply.ApplyServlet?p_process=apply-init",
  results: "https://www.opic.or.kr/opics/servlet/controller.opic.site.certi.CertiServlet?p_process=move-page-certiissue",
};
