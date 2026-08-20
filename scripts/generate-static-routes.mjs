import { createRequire } from "module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const projectRoot = process.cwd();
const distDir = join(projectRoot, "dist");
const distIndexPath = join(distDir, "index.html");
const siteUrl = "https://opic-on-me.com";
const lastmod = "2026-07-27";
const require = createRequire(import.meta.url);

const baseRoutes = [
  {
    path: "/",
    title: "오픽온미 | OPIc 말하기 연습 도구",
    description: "오픽온미에서 OPIc 서베이, 스크립트, 롤플레이, 실전 녹음 연습을 한 흐름으로 준비하세요.",
    heading: "오픽온미",
    content: ["OPIc 말하기를 준비하는 학습자를 위한 브라우저 기반 연습 도구입니다.", "서베이 고정, 난이도 설정, 스크립트 훈련, 롤플레이 공식, 실전 녹음 연습을 한 흐름으로 제공합니다."],
  },
  {
    path: "/exam-guide/",
    title: "OPIc 수험 가이드 | 오픽온미",
    description: "OPIc 시험 소개, 신청, 시험 당일 준비, 성적 확인까지 수험자가 확인할 핵심 흐름을 정리했습니다.",
    heading: "OPIc 수험 가이드",
    content: ["OPIc 시험 준비 과정에서 확인해야 할 시험 구조, 신청, 신분증, 입실, 성적 확인 정보를 한곳에서 살펴봅니다.", "변동 가능한 시험 운영 정보는 최종 응시 전 공식 안내를 다시 확인해야 합니다."],
  },
  {
    path: "/exam-guide/overview/",
    title: "OPIc 소개와 등급 체계 | 오픽온미",
    description: "OPIc 말하기 평가의 기본 흐름과 IM, IH, AL 목표별 연습 방향을 정리했습니다.",
    heading: "OPIc 소개와 등급 체계",
    content: ["OPIc은 실제 상황에서 영어로 경험과 의견을 말하는 능력을 확인하는 말하기 평가입니다.", "오픽온미는 공식 채점표가 아니라 목표 등급별 답변 밀도와 연습 순서를 이해하기 위한 학습 참고 자료를 제공합니다."],
  },
  {
    path: "/exam-guide/apply/",
    title: "OPIc 신청과 응시료 안내 | 오픽온미",
    description: "OPIc 회원가입, 시험 신청, 응시료 확인 과정에서 학습자가 점검할 항목을 정리했습니다.",
    heading: "OPIc 신청과 응시료",
    content: ["시험 신청 전 계정, 시험 일정, 고사장, 응시료, 결제 상태를 확인하는 흐름을 정리합니다.", "일정과 비용은 바뀔 수 있으므로 결제 전 공식 접수 페이지에서 다시 확인해야 합니다."],
  },
  {
    path: "/exam-guide/day/",
    title: "OPIc 시험 당일 준비 | 오픽온미",
    description: "OPIc 시험 당일 신분증, 입실 시간, 오리엔테이션과 본시험 흐름을 준비할 수 있도록 안내합니다.",
    heading: "OPIc 시험 당일 준비",
    content: ["시험 당일에는 규정 신분증, 입실 시간, 오리엔테이션, 본시험 진행 순서를 미리 확인하는 것이 중요합니다.", "오픽온미는 수험 준비를 돕는 비공식 학습 참고 자료입니다."],
  },
  {
    path: "/exam-guide/results/",
    title: "OPIc 성적 확인과 인증서 | 오픽온미",
    description: "OPIc 성적 발표, 인증서, 쿠폰 관련 확인 흐름을 학습자 관점에서 정리했습니다.",
    heading: "OPIc 성적 확인과 인증서",
    content: ["성적 발표 시점, 인증서 확인, 쿠폰 사용 여부는 응시 시점과 운영 정책에 따라 달라질 수 있습니다.", "최종 정보는 공식 안내 페이지를 기준으로 확인하세요."],
  },
  {
    path: "/exam-guide/faq/",
    title: "OPIc 자주 묻는 질문 | 오픽온미",
    description: "OPIc 준비 과정에서 자주 나오는 질문과 시험 전 확인할 내용을 정리했습니다.",
    heading: "OPIc 자주 묻는 질문",
    content: ["시험 준비, 신청, 시험 당일, 성적 확인 과정에서 자주 묻는 질문을 학습자 관점으로 정리했습니다.", "공식 기관과 제휴된 답변이 아니며 학습 참고용 안내입니다."],
  },
  {
    path: "/training/",
    title: "OPIc 실전 훈련하기 | 오픽온미",
    description: "목표 구간 설정부터 서베이 고정, 스크립트, 롤플레이, 실전 녹음까지 OPIc 말하기 훈련 6단계를 제공합니다.",
    heading: "OPIc 실전 훈련 6 STEP",
    content: ["오픽온미의 훈련 흐름은 STEP 1 목표 구간·코스 설정, STEP 2 서베이 고정, STEP 3 난이도 설정, STEP 4 만능 스크립트, STEP 5 롤플레이 공식, STEP 6 실전 연습으로 이어집니다.", "답변을 통째로 암기하기보다 하나의 장면을 여러 질문에 맞게 변형하는 연습을 목표로 합니다."],
  },
  {
    path: "/training/setup/",
    title: "OPIc 목표 구간 · 코스 설정 | 오픽온미",
    description: "1구간(AL), 2구간(IH/IM3), 3구간(IM2/IM1) 중 목표와 3개 훈련 코스를 설정합니다.",
    heading: "STEP 1. 목표 구간 · 코스 설정",
    content: ["목표 등급과 학습 코스를 먼저 설정해 맞춤형 서베이, 스크립트, 롤플레이, 실전 연습으로 연결합니다.", "훈련 도중 언제든지 설정을 변경할 수 있습니다."],
  },
  {
    path: "/training/survey/",
    title: "OPIc 서베이 고정 가이드 | 오픽온미",
    description: "OPIc Background Survey를 참고한 연습용 고정 선택 조합으로 답변 범위를 좁히는 방법을 안내합니다.",
    heading: "STEP 2. 서베이 고정",
    content: ["OPIc Background Survey의 일반적인 진행 순서를 참고해 만든 연습용 고정 선택본입니다.", "시험 당일 실제 화면 표현은 운영 시점에 따라 달라질 수 있습니다."],
  },
  {
    path: "/training/difficulty/",
    title: "OPIc 난이도 설정 전략 | 오픽온미",
    description: "OPIc 난이도 선택과 목표 등급별 말하기 길이, 답변 밀도를 연습하는 방법을 정리했습니다.",
    heading: "STEP 3. 난이도 설정",
    content: ["오픽온미는 선택한 목표 구간에 맞춘 학습용 권장 프리셋을 제안합니다: 1구간(AL) 5-5 / 60~90초, 2구간(IH/IM3) 4-4 / 45~65초, 3구간(IM2/IM1) 3-3 / 30~45초. 이는 OOM 학습 프리셋이며 공식 점수·등급을 보장하지 않습니다.", "실제 시험 난이도 선택은 개인 상황과 목표에 맞춰 결정해야 합니다."],
  },
  {
    path: "/training/scripts/",
    title: "OPIc 만능 스크립트 훈련 | 오픽온미",
    description: "OPIc 답변을 통째로 외우기보다 장면과 블록 중심으로 재사용하는 스크립트 훈련 방식입니다.",
    heading: "STEP 4. 만능 스크립트",
    content: [
      "스크립트 그룹은 추가 암기 목록이 아니라 선택형 이야기 세트입니다.",
      "하나의 60-90초 장면을 질문 유형별 변형과 같은 흐름으로 연결해 연습합니다.",
      "선택한 코스의 4개 canonical storyline을 통해 묘사, 루틴, 최근 경험, 과거 비교 질문에 답변을 맞춰 나갑니다."
    ],
  },
  {
    path: "/training/scripts/outdoor/",
    title: "OPIc 만능 스크립트 훈련 | 오픽온미",
    description: "선택한 코스의 핵심 스토리를 질문 유형별로 변형하여 연습하는 스크립트 훈련 페이지입니다.",
    heading: "STEP 4. 만능 스크립트 그룹 1",
    content: [
      "선택한 코스의 핵심 스토리를 묘사, 루틴, 최근 경험, 변화 질문에 맞게 변형하여 연습합니다.",
      "핵심 장면을 바탕으로 질문 유형별 변형과 답변 블루프린트를 학습합니다.",
      "전체 스크립트 암기에서 벗어나 질문 의도에 맞게 문장 블록을 유연하게 교체하는 감각을 기릅니다."
    ],
  },
  {
    path: "/training/scripts/indoor/",
    title: "OPIc 만능 스크립트 훈련 | 오픽온미",
    description: "선택한 코스의 핵심 스토리를 질문 유형별로 변형하여 연습하는 스크립트 훈련 페이지입니다.",
    heading: "STEP 4. 만능 스크립트 그룹 2",
    content: [
      "선택한 코스의 핵심 스토리를 묘사, 루틴, 최근 경험, 변화 질문에 맞게 변형하여 연습합니다.",
      "핵심 장면을 바탕으로 질문 유형별 변형과 답변 블루프린트를 학습합니다.",
      "전체 스크립트 암기에서 벗어나 질문 의도에 맞게 문장 블록을 유연하게 교체하는 감각을 기릅니다."
    ],
  },
  {
    path: "/training/scripts/sports/",
    title: "OPIc 만능 스크립트 훈련 | 오픽온미",
    description: "선택한 코스의 핵심 스토리를 질문 유형별로 변형하여 연습하는 스크립트 훈련 페이지입니다.",
    heading: "STEP 4. 만능 스크립트 그룹 3",
    content: [
      "선택한 코스의 핵심 스토리를 묘사, 루틴, 최근 경험, 변화 질문에 맞게 변형하여 연습합니다.",
      "핵심 장면을 바탕으로 질문 유형별 변형과 답변 블루프린트를 학습합니다.",
      "전체 스크립트 암기에서 벗어나 질문 의도에 맞게 문장 블록을 유연하게 교체하는 감각을 기릅니다."
    ],
  },
  {
    path: "/training/scripts/home/",
    title: "OPIc 만능 스크립트 훈련 | 오픽온미",
    description: "선택한 코스의 핵심 스토리를 질문 유형별로 변형하여 연습하는 스크립트 훈련 페이지입니다.",
    heading: "STEP 4. 만능 스크립트 그룹 4",
    content: [
      "선택한 코스의 핵심 스토리를 묘사, 루틴, 최근 경험, 변화 질문에 맞게 변형하여 연습합니다.",
      "핵심 장면을 바탕으로 질문 유형별 변형과 답변 블루프린트를 학습합니다.",
      "전체 스크립트 암기에서 벗어나 질문 의도에 맞게 문장 블록을 유연하게 교체하는 감각을 기릅니다."
    ],
  },
  {
    path: "/roleplay/",
    title: "OPIc 롤플레이 훈련 | 오픽온미",
    description: "OPIc 롤플레이 질문에 상황 설명, 문제 설명, 정보 질문, 대안 제시로 대응하는 6단계 공식 훈련입니다.",
    heading: "STEP 5. 롤플레이 공식",
    content: [
      "롤플레이는 문제 상황 파악, 필요한 정보 질문, 가능한 대안 요청, 감사 마무리의 6단계 구조로 연습합니다.",
      "선택한 코스에 맞춘 실전 상황별 시나리오를 제공합니다.",
      "돌발 질문을 받더라도 당황하지 않고 일관된 6단계 흐름으로 안정적인 문제 해결형 답변을 완성할 수 있도록 훈련합니다."
    ],
  },
  {
    path: "/roleplay/formula/",
    title: "OPIc 롤플레이 6단계 공식 | 오픽온미",
    description: "상황 설명부터 대안 요청까지 OPIc 롤플레이 답변의 6단계 구조를 정리했습니다.",
    heading: "STEP 5. 롤플레이 공식과 출제 구조",
    content: [
      "상황을 밝히고, 문제를 설명하고, 필요한 정보를 묻고, 대안을 요청하고, 감사로 마무리하는 흐름을 연습합니다.",
      "공식은 암기 문장이 아니라 낯선 상황에서도 답변 순서를 잃지 않기 위한 구조입니다.",
      "상대방의 입장을 고려한 정중한 대안 제시와 확인 질문을 통해 대화의 주도권을 유지합니다."
    ],
  },
  {
    path: "/roleplay/travel/",
    title: "OPIc 롤플레이 실전 시나리오 | 오픽온미",
    description: "선택한 코스의 상황을 바탕으로 문제 설명 및 대안 제시를 연습하는 롤플레이 페이지입니다.",
    heading: "STEP 5. 롤플레이 시나리오 1",
    content: [
      "선택한 코스의 실제 상황에서 문제를 설명하고 가능한 대안을 요청하는 연습을 합니다.",
      "상황 이해 → 문제 설명 → 대안 요청 흐름으로 답변을 완성합니다.",
      "6단계 해결 공식을 적용해 실제 서비스 현장에서 바로 활용할 수 있는 회복 발화를 훈련합니다."
    ],
  },
  {
    path: "/roleplay/indoor/",
    title: "OPIc 롤플레이 실전 시나리오 | 오픽온미",
    description: "선택한 코스의 상황을 바탕으로 문제 설명 및 대안 제시를 연습하는 롤플레이 페이지입니다.",
    heading: "STEP 5. 롤플레이 시나리오 2",
    content: [
      "선택한 코스의 실제 상황에서 문제를 설명하고 가능한 대안을 요청하는 연습을 합니다.",
      "상황 이해 → 문제 설명 → 대안 요청 흐름으로 답변을 완성합니다.",
      "6단계 해결 공식을 적용해 실제 서비스 현장에서 바로 활용할 수 있는 회복 발화를 훈련합니다."
    ],
  },
  {
    path: "/roleplay/sports/",
    title: "OPIc 롤플레이 실전 시나리오 | 오픽온미",
    description: "선택한 코스의 상황을 바탕으로 문제 설명 및 대안 제시를 연습하는 롤플레이 페이지입니다.",
    heading: "STEP 5. 롤플레이 시나리오 3",
    content: [
      "선택한 코스의 실제 상황에서 문제를 설명하고 가능한 대안을 요청하는 연습을 합니다.",
      "상황 이해 → 문제 설명 → 대안 요청 흐름으로 답변을 완성합니다.",
      "6단계 해결 공식을 적용해 실제 서비스 현장에서 바로 활용할 수 있는 회복 발화를 훈련합니다."
    ],
  },
  {
    path: "/roleplay/home/",
    title: "OPIc 롤플레이 실전 시나리오 | 오픽온미",
    description: "선택한 코스의 상황을 바탕으로 문제 설명 및 대안 제시를 연습하는 롤플레이 페이지입니다.",
    heading: "STEP 5. 롤플레이 시나리오 4",
    content: [
      "선택한 코스의 실제 상황에서 문제를 설명하고 가능한 대안을 요청하는 연습을 합니다.",
      "상황 이해 → 문제 설명 → 대안 요청 흐름으로 답변을 완성합니다.",
      "6단계 해결 공식을 적용해 실제 서비스 현장에서 바로 활용할 수 있는 회복 발화를 훈련합니다."
    ],
  },
  {
    path: "/practice/",
    title: "OPIc 실전 연습 | 오픽온미",
    description: "목표 구간에 맞는 시간으로 답변을 녹음하고 STT 전사, AI 피드백, 재도전으로 OPIc 실전 말하기를 연습합니다.",
    heading: "STEP 6. 실전 연습",
    content: ["선택한 목표 구간에 맞는 시간으로 랜덤 질문에 답변을 녹음합니다. STT가 설정된 경우 음성을 자동으로 transcript로 변환하며, 설정하지 않아도 직접 입력할 수 있습니다.", "transcript를 확인·수정한 뒤 Course × Level 기반 AI 피드백을 받고, 같은 질문을 다시 말하며 개선합니다. 마이크 실패 시 타이머만 시작하고 수동 입력으로 이어갈 수 있습니다."],
  },
  {
    path: "/magazine/",
    title: "오픽 매거진 | 오픽온미",
    description: "OPIc 학습 전략, 자기소개, 목표 등급, 필러 표현, 오픽온미 활용법을 담은 학습 아티클입니다.",
    heading: "오픽 매거진",
    content: ["OPIc 학습자가 자주 고민하는 자기소개, 목표 등급, 스크립트 훈련, 필러 표현을 아티클로 정리했습니다.", "모든 글은 학습 참고용이며 공식 시험기관의 보증 자료가 아닙니다."],
  },
  {
    path: "/ai-settings/",
    title: "AI 피드백 설정 | 오픽온미",
    description: "브라우저 localStorage에만 저장되는 사용자 제공 LLM endpoint와 요청 형식을 설정합니다.",
    heading: "AI 피드백 설정",
    content: ["AI 피드백 설정은 사용자가 직접 제공한 endpoint, API key, 모델명, 요청 형식을 브라우저 localStorage에 저장합니다.", "오픽온미는 API key를 서버에 저장하지 않습니다."],
    noindex: true,
  },
];


const pageGuides = {
  "/": { purpose: "오픽온미는 OPIc 말하기를 준비하는 학습자가 서베이 선택, 난이도 설정, 스크립트 훈련, 롤플레이, 녹음 복습을 한 흐름으로 이어 가도록 만든 연습용 도구입니다.", how: "처음에는 훈련 허브에서 STEP 1부터 STEP 6까지 순서대로 이동하고, 이후에는 부족한 단계만 반복합니다. 한 번에 많은 주제를 외우기보다 하나의 장면을 여러 질문에 맞게 바꾸는 방식으로 사용하세요.", benefit: "학습자는 답변 범위를 좁히고, 같은 경험을 묘사·비교·문제 해결 질문으로 확장하는 감각을 얻을 수 있습니다.", checklist: ["서베이 선택을 고정했다", "60-90초로 말할 장면 하나를 정했다", "녹음 후 첫 문장과 마무리를 확인했다"], links: [["/training/", "OPIc 실전 훈련하기"], ["/magazine/", "오픽 매거진"], ["/exam-guide/", "OPIc 수험 가이드"]] },
  "/exam-guide/": { purpose: "OPIc 수험 가이드는 시험의 기본 구조부터 신청, 시험 당일 준비, 성적 확인까지 처음 응시하는 학습자가 확인할 내용을 순서대로 정리한 허브입니다.", how: "소개·등급에서 평가 방식을 이해한 뒤 신청·응시료, 신분증·입실, 성적·인증서 순서로 확인합니다. 날짜와 비용처럼 바뀔 수 있는 정보는 각 페이지의 공식 링크에서 응시 직전에 다시 확인합니다.", benefit: "학습 정보와 시험 운영 정보를 구분해 준비 누락을 줄이고, 공식 확인이 필요한 항목을 빠르게 찾을 수 있습니다.", checklist: ["시험 구조와 등급 체계를 확인했다", "접수 상태와 응시료를 공식 화면에서 확인했다", "규정 신분증과 입실 시간을 확인했다", "성적 발표와 인증서 사용 일정을 확인했다"], mistakes: ["학습 예시를 공식 규정으로 오해한다", "오래된 후기만 보고 응시료나 신분증을 결정한다"], links: [["/exam-guide/overview/", "OPIc 소개·등급"], ["/exam-guide/apply/", "신청·응시료"], ["/exam-guide/day/", "시험 당일"], ["/exam-guide/results/", "성적·인증서"], ["/exam-guide/faq/", "자주 묻는 질문"]] },
  "/exam-guide/overview/": { purpose: "OPIc 소개·등급 페이지는 컴퓨터 기반 말하기 평가의 흐름과 Novice, Intermediate, Advanced 등급대에서 연습할 발화 기준을 설명합니다.", how: "등급 이름만 외우지 말고 질문에 직접 답하는지, 시간·장소·행동·이유를 이어 말하는지, 예상 밖 상황을 설명하고 해결하는지를 기준으로 현재 답변을 확인합니다.", benefit: "어려운 단어 수보다 답변의 구체성, 시간 흐름, 연결과 회복 능력을 중심으로 연습 목표를 세울 수 있습니다.", example: "I usually go to a small park on Sunday mornings because it helps me slow down after a busy week.처럼 장소, 시간, 행동과 이유를 한 장면으로 연결합니다.", checklist: ["목표 등급의 발화 초점을 확인했다", "45초와 90초 답변을 각각 녹음했다", "공식 숙련도 자료 링크를 확인했다"], links: [["/training/difficulty/", "난이도 설정"], ["/magazine/opic-grade-guide/", "등급별 답변 차이 읽기"], ["/exam-guide/apply/", "신청 안내로 이동"]] },
  "/exam-guide/apply/": { purpose: "신청·응시료 페이지는 회원가입, 본인인증, 시험 일정과 센터 선택, 결제, 접수 완료 확인까지 신청 과정에서 놓치기 쉬운 항목을 정리합니다.", how: "일정과 센터를 선택하기 전에 변경·취소 조건을 읽고, 결제 직전 공식 신청 화면의 최종 응시료와 할인 적용 여부를 확인합니다. 접수 후에는 나의 OPIc에서 상태를 다시 확인합니다.", benefit: "오래된 블로그 정보나 기억에 의존하지 않고 실제 신청 화면을 기준으로 비용과 일정을 결정할 수 있습니다.", checklist: ["본인인증 수단을 준비했다", "센터와 입실 시간을 확인했다", "결제 화면의 최종 금액을 확인했다", "접수 완료 상태를 확인했다"], mistakes: ["고정된 응시료로 단정한다", "단체·할인 시험 조건을 일반 시험과 혼동한다"], links: [["/exam-guide/day/", "시험 당일 준비"], ["/exam-guide/faq/", "신청 관련 질문"], ["/contact/", "사이트 내용 정정 요청"]] },
  "/exam-guide/day/": { purpose: "시험 당일 페이지는 규정 신분증, 입실 통제 시간, 오리엔테이션과 본시험 흐름, 현장 오류 대응을 한곳에서 점검하도록 만든 준비 목록입니다.", how: "응시자 유형에 맞는 신분증 원본을 준비하고 시험 시작보다 여유 있게 도착합니다. 입실 직전에는 공식 수험자 가이드에서 신분증 인정 범위와 입실 시간을 다시 확인합니다.", benefit: "학습 내용과 무관한 신분증·지각 문제로 응시하지 못하는 위험을 줄이고 시험실에서의 진행 순서를 미리 이해할 수 있습니다.", checklist: ["유효한 규정 신분증 원본을 준비했다", "시험 센터와 입실 시간을 확인했다", "헤드셋과 녹음 오류 시 감독관에게 알릴 것을 기억한다"], mistakes: ["신분증 사진이나 사본을 준비한다", "시험 시작 시간에 맞춰 도착하면 된다고 생각한다"], links: [["/exam-guide/faq/", "시험장 질문 확인"], ["/exam-guide/results/", "성적 확인 안내"], ["/training/", "실전 훈련으로 이동"]] },
  "/exam-guide/results/": { purpose: "성적·인증서 페이지는 성적 발표 시점, 확인 가능 기간, 인증서 출력과 제출, 세이빙 쿠폰과 UR 안내를 구분해 설명합니다.", how: "시험 후 공식 홈페이지에서 발표 상태를 확인하고 기관 제출 시 등급, Test ID와 응시일을 다시 대조합니다. 쿠폰이나 재시험 조건은 개인 상황에 따라 달라질 수 있으므로 공식 문의를 우선합니다.", benefit: "성적 확인과 기관 제출에 필요한 정보를 빠뜨리지 않고, 예외 상황을 일반적인 결과 보장으로 오해하지 않을 수 있습니다.", checklist: ["공식 성적 발표 화면을 확인했다", "인증서의 Test ID와 응시일을 확인했다", "제출 기관의 유효기간 기준을 확인했다"], mistakes: ["사이트 안내를 실제 성적 조회로 오해한다", "예외 쿠폰이 모든 미응시 상황에 적용된다고 생각한다"], links: [["/exam-guide/faq/", "성적 관련 질문"], ["/exam-guide/", "수험 가이드 전체 보기"], ["/contact/", "오류 제보"]] },
  "/exam-guide/faq/": { purpose: "자주 묻는 질문 페이지는 신청, 시험장, 신분증, 답변 방식, 성적 확인 과정에서 반복해서 혼동되는 내용을 짧은 문답으로 정리합니다.", how: "질문을 범주별로 확인하고 공식 기준 표시가 있는 답변은 연결된 공식 페이지에서 최신 내용을 다시 읽습니다. 개인 경험이나 학습 팁은 공식 운영 규정과 구분합니다.", benefit: "긴 가이드를 모두 다시 읽지 않고도 현재 막힌 지점을 찾고, 추가 확인이 필요한 공식 자료로 이동할 수 있습니다.", checklist: ["내 질문의 범주를 먼저 확인했다", "공식 기준과 학습 팁을 구분했다", "변동 가능한 정보는 최신 공식 페이지에서 확인했다"], mistakes: ["FAQ 한 문장만 보고 예외 조건을 생략한다", "커뮤니티 후기를 공식 정책보다 우선한다"], links: [["/exam-guide/overview/", "시험 구조"], ["/exam-guide/apply/", "신청 안내"], ["/exam-guide/day/", "시험 당일"], ["/exam-guide/results/", "성적 안내"]] },
  "/magazine/": { purpose: "오픽 매거진은 오픽온미의 훈련 화면을 실제로 활용하는 방법을 설명하는 학습 노트 모음입니다. 각 글은 서로 다른 연습 문제를 다루고 작성자, 공개일, 수정일과 확인한 공식 자료를 표시합니다.", how: "현재 필요한 문제에 가까운 글 한 편을 고른 뒤 예시를 그대로 외우지 말고 자신의 장소, 행동, 이유와 변화로 바꿉니다. 글 마지막의 관련 훈련 화면에서 같은 구조를 직접 말하고 녹음합니다.", benefit: "검색어별 답안을 늘리는 대신 하나의 장면을 여러 질문에 옮기는 오픽온미의 학습 방식을 글과 도구 사이에서 반복할 수 있습니다.", checklist: ["글의 작성·검수자와 수정일을 확인했다", "예문에서 바꿀 요소를 정했다", "관련 훈련 화면에서 직접 녹음했다", "공식 자료와 OOM 학습 조언을 구분했다"], mistakes: ["예문을 정답으로 외운다", "비슷한 글을 여러 편 읽고도 직접 말하지 않는다"], links: [["/magazine/opic-survey-choice-guide/", "서베이 선택 가이드"], ["/magazine/opic-recording-review-routine/", "10분 녹음 복습"], ["/magazine/opic-roleplay-6-step-template/", "롤플레이 6단계"], ["/magazine/opic-answer-checklist/", "답변 체크리스트"], ["/editorial-policy/", "콘텐츠 편집 원칙"]] },
  "/training/": { purpose: "OPIc 실전 훈련의 전체 학습 원리와 6단계를 한눈에 이해하는 허브입니다.", how: "STEP 1에서 목표 구간과 코스를 정하고, STEP 2에서 서베이를 고정한 뒤, STEP 3~5에서 같은 이야기를 확장하고, STEP 6에서 직접 말하고 점검합니다.", benefit: "새 답변을 계속 추가하기보다 적은 수의 스토리를 여러 질문에 재사용하는 훈련 흐름을 유지합니다.", checklist: ["오늘 연습할 STEP 하나를 고른다", "새 주제보다 기존 장면을 먼저 변형한다", "녹음 복습은 한 가지 수정만 남긴다"], links: [["/training/setup/", "STEP 1 목표/코스 설정"], ["/training/survey/", "STEP 2 서베이 고정"], ["/practice/", "STEP 6 실전 연습"]] },
  "/training/setup/": { purpose: "목표 등급과 훈련 코스를 선택해 전체 훈련 콘텐츠를 맞춤 구성하는 STEP 1 화면입니다.", how: "1구간(AL), 2구간(IH/IM3), 3구간(IM2/IM1) 중 목표를 선택하고, Everyday & Getaway, Culture & City, Nature & Weekend 코스 중 하나를 결정한 뒤 학습을 시작합니다.", benefit: "내 목표 등급에 맞는 답변 밀도와 서베이·스토리 세트가 자동으로 배정되어 불필요한 암기를 줄입니다.", checklist: ["목표 구간을 선택했다", "학습 코스를 선택했다", "이 구성으로 학습 시작을 눌렀다"], links: [["/training/", "훈련 개요 허브"], ["/training/survey/", "STEP 2 서베이 고정으로 이동"]] },
  "/training/survey/": { purpose: "서베이 페이지는 실제 관심사를 모두 고르는 곳이 아니라 답변 범위를 좁히기 위한 연습용 선택표입니다.", how: "10초 안에 경험이 떠오르는 선택지, 장소와 행동과 감정을 붙일 수 있는 선택지를 우선 확인합니다.", benefit: "응시 전 말할 소재가 줄어들어 질문을 받았을 때 장면을 더 빨리 떠올릴 수 있습니다.", checklist: ["경험 하나가 즉시 떠오른다", "장소·사람·행동 중 두 가지 이상을 말할 수 있다", "과거 경험이나 최근 변화로 확장 가능하다"], mistakes: ["남들이 많이 고른다는 이유만으로 선택한다", "선택지를 자주 바꿔 스크립트 장면이 흔들린다"], links: [["/training/difficulty/", "난이도 설정으로 이동"], ["/magazine/opic-survey-choice-guide/", "서베이 선택 가이드"]] },
  "/training/difficulty/": { purpose: "난이도 페이지는 어려운 단어를 고르는 곳이 아니라 답변 길이와 구체성의 기준을 정하는 곳입니다.", how: "목표 구간에 맞는 권장 난이도를 바탕으로 장소, 행동, 이유, 변화가 들어간 답변을 만들어 봅니다.", benefit: "목표 등급에 맞는 답변 밀도를 의식하면서도 과장된 표현 대신 익숙한 경험을 안정적으로 말할 수 있습니다.", example: "집 근처 카페를 말한다면 위치 소개에서 끝내지 말고, 언제 가는지, 무엇을 하는지, 왜 편한지까지 이어 말합니다.", checklist: ["답변 길이를 정했다", "구체적 행동 하나를 넣었다", "마무리 감정을 붙였다"], links: [["/training/scripts/", "스크립트 훈련으로 이동"], ["/magazine/opic-55-difficulty-guide/", "난이도 5-5 가이드"]] },
  "/training/scripts/": { purpose: "스크립트 허브는 답변을 통째로 외우기보다 질문이 바뀌어도 재사용할 장면 블록을 고르는 곳입니다.", how: "선택한 코스의 핵심 스토리 그룹을 고른 뒤 전체 보기, 키워드 보기, 질문 변형 순서로 반복합니다.", benefit: "하나의 핵심 장면을 묘사, 루틴, 최근 경험, 변화 질문으로 바꾸는 감각을 만들 수 있습니다.", checklist: ["그룹 하나를 고른다", "첫 문장과 마무리를 분리해 연습한다", "질문 변형에서 전체 답변을 새로 만들지 않는다"], links: [["/training/scripts/outdoor/", "만능 스크립트 그룹 1"], ["/training/scripts/indoor/", "만능 스크립트 그룹 2"], ["/training/scripts/sports/", "만능 스크립트 그룹 3"], ["/training/scripts/home/", "만능 스크립트 그룹 4"]] },
  "/training/scripts/outdoor/": { purpose: "현재 선택한 코스의 핵심 스토리를 묘사·루틴·최근 경험·변화 질문에 맞게 변형합니다.", how: "핵심 장면을 바탕으로 질문 유형별 변형 스크립트와 답변 블루프린트를 확인하며 연습합니다.", benefit: "새로운 답변을 외우지 않고도 하나의 이야기를 질문에 맞춰 자연스럽게 확장할 수 있습니다.", checklist: ["핵심 장면을 확인했다", "질문 변형 4단계를 연습했다", "답변 블루프린트를 참고해 직접 말했다"], links: [["/training/scripts/", "스크립트 허브"], ["/roleplay/", "롤플레이 공식"]] },
  "/training/scripts/indoor/": { purpose: "현재 선택한 코스의 핵심 스토리를 묘사·루틴·최근 경험·변화 질문에 맞게 변형합니다.", how: "핵심 장면을 바탕으로 질문 유형별 변형 스크립트와 답변 블루프린트를 확인하며 연습합니다.", benefit: "새로운 답변을 외우지 않고도 하나의 이야기를 질문에 맞춰 자연스럽게 확장할 수 있습니다.", checklist: ["핵심 장면을 확인했다", "질문 변형 4단계를 연습했다", "답변 블루프린트를 참고해 직접 말했다"], links: [["/training/scripts/", "스크립트 허브"], ["/roleplay/", "롤플레이 공식"]] },
  "/training/scripts/sports/": { purpose: "현재 선택한 코스의 핵심 스토리를 묘사·루틴·최근 경험·변화 질문에 맞게 변형합니다.", how: "핵심 장면을 바탕으로 질문 유형별 변형 스크립트와 답변 블루프린트를 확인하며 연습합니다.", benefit: "새로운 답변을 외우지 않고도 하나의 이야기를 질문에 맞춰 자연스럽게 확장할 수 있습니다.", checklist: ["핵심 장면을 확인했다", "질문 변형 4단계를 연습했다", "답변 블루프린트를 참고해 직접 말했다"], links: [["/training/scripts/", "스크립트 허브"], ["/roleplay/", "롤플레이 공식"]] },
  "/training/scripts/home/": { purpose: "현재 선택한 코스의 핵심 스토리를 묘사·루틴·최근 경험·변화 질문에 맞게 변형합니다.", how: "핵심 장면을 바탕으로 질문 유형별 변형 스크립트와 답변 블루프린트를 확인하며 연습합니다.", benefit: "새로운 답변을 외우지 않고도 하나의 이야기를 질문에 맞춰 자연스럽게 확장할 수 있습니다.", checklist: ["핵심 장면을 확인했다", "질문 변형 4단계를 연습했다", "답변 블루프린트를 참고해 직접 말했다"], links: [["/training/scripts/", "스크립트 허브"], ["/roleplay/", "롤플레이 공식"]] },
  "/roleplay/": { purpose: "롤플레이 허브는 6단계 만능 해결 공식과 코스별 실전 시나리오를 연습하는 공간입니다.", how: "상황 설명 → 문제 설명 → 정보 질문 → 대안 제시 → 조건 확인 → 감사 마무리 흐름을 반복합니다.", benefit: "돌발 상황에서도 당황하지 않고 일관된 문제 해결 흐름으로 답변을 이어갈 수 있습니다.", checklist: ["6단계 해결 공식을 확인했다", "코스 시나리오를 직접 말했다", "대안 제시와 감사 표현을 포함했다"], links: [["/roleplay/formula/", "롤플레이 공식"], ["/practice/", "실전 연습"]] },
  "/roleplay/formula/": { purpose: "문제 해결형 롤플레이 질문에 안정적으로 대처하기 위한 6단계 공식을 안내합니다.", how: "상황 설명, 문제 진술, 질문, 대안 제시, 조건 확인, 감사의 순서를 연습합니다.", benefit: "암기 문장이 아니라 낯선 상황에서도 답변의 흐름을 지킬 수 있는 구조를 만듭니다.", checklist: ["상황과 문제를 명확히 말했다", "대안을 1~2개 제시했다", "정중한 감사로 마무리했다"], links: [["/roleplay/", "롤플레이 허브"], ["/practice/", "실전 연습"]] },
  "/roleplay/travel/": { purpose: "현재 선택한 코스의 실제 상황을 사용하여 문제 설명 → 정보 질문 → 대안 제시 흐름을 연습합니다.", how: "코스별 롤플레이 시나리오에서 문제를 파악하고 6단계 공식에 맞춰 해결책을 요청합니다.", benefit: "실제 서비스 상황에서 침착하게 대안을 요청하고 마무리하는 능력을 기릅니다.", checklist: ["문제 상황을 파악했다", "가능한 대안을 제시했다", "녹음으로 답변 흐름을 점검했다"], links: [["/roleplay/", "롤플레이 허브"], ["/practice/", "실전 연습"]] },
  "/roleplay/indoor/": { purpose: "현재 선택한 코스의 실제 상황을 사용하여 문제 설명 → 정보 질문 → 대안 제시 흐름을 연습합니다.", how: "코스별 롤플레이 시나리오에서 문제를 파악하고 6단계 공식에 맞춰 해결책을 요청합니다.", benefit: "실제 서비스 상황에서 침착하게 대안을 요청하고 마무리하는 능력을 기릅니다.", checklist: ["문제 상황을 파악했다", "가능한 대안을 제시했다", "녹음으로 답변 흐름을 점검했다"], links: [["/roleplay/", "롤플레이 허브"], ["/practice/", "실전 연습"]] },
  "/roleplay/sports/": { purpose: "현재 선택한 코스의 실제 상황을 사용하여 문제 설명 → 정보 질문 → 대안 제시 흐름을 연습합니다.", how: "코스별 롤플레이 시나리오에서 문제를 파악하고 6단계 공식에 맞춰 해결책을 요청합니다.", benefit: "실제 서비스 상황에서 침착하게 대안을 요청하고 마무리하는 능력을 기릅니다.", checklist: ["문제 상황을 파악했다", "가능한 대안을 제시했다", "녹음으로 답변 흐름을 점검했다"], links: [["/roleplay/", "롤플레이 허브"], ["/practice/", "실전 연습"]] },
  "/roleplay/home/": { purpose: "현재 선택한 코스의 실제 상황을 사용하여 문제 설명 → 정보 질문 → 대안 제시 흐름을 연습합니다.", how: "코스별 롤플레이 시나리오에서 문제를 파악하고 6단계 공식에 맞춰 해결책을 요청합니다.", benefit: "실제 서비스 상황에서 침착하게 대안을 요청하고 마무리하는 능력을 기릅니다.", checklist: ["문제 상황을 파악했다", "가능한 대안을 제시했다", "녹음으로 답변 흐름을 점검했다"], links: [["/roleplay/", "롤플레이 허브"], ["/practice/", "실전 연습"]] },
  "/practice/": { purpose: "실전 연습 페이지는 목표 구간 맞춤 랜덤 질문, 레벨별 타이머, 녹음, optional STT 전사, AI 피드백, 재도전으로 구성된 끊김 없는 말하기 훈련 공간입니다.", how: "질문을 뽑은 뒤 '답변 시작'을 눌러 녹음과 타이머를 동시에 시작합니다. 녹음 종료 후 STT가 설정된 경우 자동 전사되며, 미설정 시 직접 입력합니다. transcript를 확인하고 AI 피드백을 받은 뒤 같은 질문을 다시 말합니다.", benefit: "완벽한 문장보다 목표 시간 내에 장면을 끝까지 전달하는 연습이 우선입니다. 첫 문장과 마무리를 점검하고 한 가지만 고쳐 재도전하는 반복이 핵심입니다.", checklist: ["질문을 읽고 핵심 장면을 정했다", "레벨 타이머에 맞춰 녹음하거나 타이머만 시작했다", "transcript를 확인·수정했다", "첫 문장 또는 마무리를 고쳐 다시 말했다"], mistakes: ["녹음 후 모든 문법을 한 번에 고치려 한다", "STT 미설정 시 직접 입력이 가능한데 포기한다"], links: [["/training/scripts/", "스크립트 훈련"], ["/roleplay/formula/", "롤플레이 공식"]] },
};

function loadTypeScriptExport(relativePath, exportName) {
  const fullPath = join(projectRoot, relativePath);
  let code = readFileSync(fullPath, "utf8");
  code = code.replace(/const\s+(\w+)\s*=\s*new URL\([^;]+;\r?\n/g, 'const $1 = "";\n');
  const ts = require("typescript");
  const compiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  const fn = new Function("module", "exports", "require", compiled);
  fn(module, module.exports, require);
  return module.exports[exportName];
}

function sectionsFromGuide(guide) {
  if (!guide) return undefined;
  const sections = [
    { heading: "페이지 목적", paragraphs: [guide.purpose] },
    { heading: "사용 방법", paragraphs: [guide.how] },
    { heading: "학습자가 얻는 이점", paragraphs: [guide.benefit] },
  ];
  if (guide.example) sections.push({ heading: "예시 흐름", paragraphs: [guide.example] });
  if (guide.checklist) sections.push({ heading: "체크리스트", paragraphs: ["다음 항목을 기준으로 답변을 점검하세요."], bullets: guide.checklist });
  if (guide.mistakes) sections.push({ heading: "흔한 실수", paragraphs: guide.mistakes });
  if (guide.links) sections.push({ heading: "다음으로 이동할 내부 링크", paragraphs: ["관련 훈련 페이지와 학습 글로 이어서 연습할 수 있습니다."], links: guide.links.map(([href, label]) => ({ href, label })) });
  return sections;
}

const enrichedBaseRoutes = baseRoutes.map((route) => ({
  ...route,
  sections: route.sections ?? sectionsFromGuide(pageGuides[route.path]),
  adExcluded: route.noindex || ["/ai-settings/", "/practice/", "/magazine/"].includes(route.path),
}));

const magazineRoutes = loadTypeScriptExport("src/data/magazine.ts", "magazineArticles").map((article) => ({
  path: "/magazine/" + article.id + "/",
  title: article.title + " | 오픽온미",
  description: article.summary,
  heading: article.title,
  content: [article.subtitle, article.summary],
  type: "article",
  article,
  lastmod: article.modifiedAt,
}));

const legalRoutes = Object.values(loadTypeScriptExport("src/data/legalPages.ts", "legalPages")).map((page) => ({
  path: "/" + page.id + "/",
  title: page.title + " | 오픽온미",
  description: page.description,
  heading: page.title,
  content: [page.description],
  legalPage: page,
  adExcluded: true,
  lastmod: page.updatedAt,
}));

const routes = [...enrichedBaseRoutes, ...magazineRoutes, ...legalRoutes];

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function canonicalFor(path) {
  const canonicalPath = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `${siteUrl}${canonicalPath}`;
}

function renderParagraphs(paragraphs = [], indent = "      ") {
  return paragraphs.map((paragraph) => `${indent}<p>${escapeHtml(paragraph)}</p>`).join("\n");
}

function renderBullets(bullets = [], indent = "      ") {
  if (!bullets.length) return "";
  const items = bullets.map((bullet) => `${indent}  <li>${escapeHtml(bullet)}</li>`).join("\n");
  return `${indent}<ul>\n${items}\n${indent}</ul>`;
}

function renderLinks(links = [], indent = "      ") {
  if (!links.length) return "";
  const items = links
    .map((link) => `${indent}  <li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join("\n");
  return `${indent}<ul>\n${items}\n${indent}</ul>`;
}

function renderExample(example, indent = "      ") {
  if (!example) return "";
  const lines = example.lines.map((line) => `${indent}  <p>${escapeHtml(line)}</p>`).join("\n");
  const description = example.description ? `${indent}  <p>${escapeHtml(example.description)}</p>\n` : "";
  return `${indent}<blockquote>\n${indent}  <strong>${escapeHtml(example.title)}</strong>\n${description}${lines}\n${indent}</blockquote>`;
}

function renderNote(note, indent = "      ") {
  if (!note) return "";
  return `${indent}<blockquote>\n${indent}  <strong>${escapeHtml(note.title)}</strong>\n${indent}  <p>${escapeHtml(note.text)}</p>\n${indent}</blockquote>`;
}

function renderSections(sections = []) {
  return sections
    .map((section) => {
      const pieces = [
        `    <section>\n      <h2>${escapeHtml(section.heading)}</h2>`,
        renderParagraphs(section.paragraphs),
        renderBullets(section.bullets),
        renderExample(section.example),
        renderNote(section.note),
        renderLinks(section.links),
        "    </section>",
      ].filter(Boolean);
      return pieces.join("\n");
    })
    .join("\n");
}

function articleBody(route) {
  const article = route.article;
  const sources = renderLinks(article.sources);
  const relatedLinks = renderLinks([
    { href: "/training/", label: "훈련 화면에서 적용하기" },
    { href: "/magazine/", label: "전체 매거진 보기" },
    { href: "/editorial-policy/", label: "콘텐츠 편집 원칙" },
  ]);
  return `<main class="seo-static-content" aria-label="${escapeHtml(article.title)}">
    <article>
      <p>${escapeHtml(article.category)} · <time datetime="${escapeHtml(article.publishedAt)}">${escapeHtml(article.date)}</time> · ${escapeHtml(article.readMinutes)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p>${escapeHtml(article.subtitle)}</p>
      <p>${escapeHtml(article.summary)}</p>
      <p>작성·검수: <span rel="author">${escapeHtml(article.author)}</span> · 최종 수정: <time datetime="${escapeHtml(article.modifiedAt)}">${escapeHtml(article.modifiedAt)}</time></p>
      <section>
        <h2>작성·검수 메모</h2>
        <p>${escapeHtml(article.creationNote)}</p>
        <p><a href="/editorial-policy/">오픽온미 편집 원칙 확인</a></p>
      </section>
      <blockquote>
        <strong>핵심 요약</strong>
        <p>${escapeHtml(article.takeaway)}</p>
      </blockquote>
${article.disclaimer ? `      <p>${escapeHtml(article.disclaimer)}</p>\n` : ""}${renderSections(article.sections)}
      <section>
        <h2>확인한 공식 자료</h2>
        <p>시험 운영 정보는 응시 전에 공식 사이트의 최신 내용을 다시 확인하세요.</p>
${sources}
      </section>
      <section>
        <h2>관련 학습 경로</h2>
${relatedLinks}
      </section>
    </article>
  </main>`;
}

function legalBody(route) {
  const page = route.legalPage;
  return `<main class="seo-static-content" aria-label="${escapeHtml(page.title)}">
    <article>
      <p>${escapeHtml(page.eyebrow)} · ${escapeHtml(page.updatedAt)}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
${renderSections(page.sections)}
    </article>
  </main>`;
}

function staticBody(route) {
  if (route.article) return articleBody(route);
  if (route.legalPage) return legalBody(route);
  const paragraphs = renderParagraphs(route.content);
  const sections = route.sections ? `\n${renderSections(route.sections)}` : "";
  return `<main class="seo-static-content" aria-label="${escapeHtml(route.heading)}">
    <h1>${escapeHtml(route.heading)}</h1>
${paragraphs}${sections}
  </main>`;
}

function injectSeo(html, route) {
  const canonical = canonicalFor(route.path);
  const ogType = route.type ?? "website";
  const robots = route.noindex ? '    <meta name="robots" content="noindex,follow" />\n' : "";
  const adsense = route.adExcluded ? "" : `    <script id="oom-adsense-script" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8734087248170812" crossorigin="anonymous"></script>\n`;
  const structuredData = route.article ? `    <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: route.article.title,
    description: route.article.summary,
    datePublished: route.article.publishedAt,
    dateModified: route.article.modifiedAt,
    mainEntityOfPage: canonical,
    author: { "@type": "Person", name: route.article.author },
    publisher: { "@type": "Organization", name: "오픽온미", url: siteUrl + "/" },
  }).replaceAll("<", "\\u003c")}</script>\n` : "";
  const meta = `    <title>${escapeHtml(route.title)}</title>
    <meta name="description" content="${escapeHtml(route.description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(route.title)}" />
    <meta property="og:description" content="${escapeHtml(route.description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
${robots}${structuredData}${adsense}`;
  let next = html
    .replace(/\s*<title>[\s\S]*?<\/title>\s*/g, "\n")
    .replace(/\s*<meta name="description"[^>]*>\s*/g, "\n")
    .replace(/\s*<meta name="keywords"[^>]*>\s*/g, "\n")
    .replace(/\s*<link rel="canonical"[^>]*>\s*/g, "\n")
    .replace(/\s*<meta property="og:title"[^>]*>\s*/g, "\n")
    .replace(/\s*<meta property="og:description"[^>]*>\s*/g, "\n")
    .replace(/\s*<meta property="og:url"[^>]*>\s*/g, "\n")
    .replace(/\s*<meta property="og:type"[^>]*>\s*/g, "\n")
    .replace(/\s*<meta name="robots"[^>]*>\s*/g, "\n");
  next = next.replace("</head>", `${meta}  </head>`);
  next = next.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">\n${staticBody(route)}\n    </div>`);
  return next;
}

function targetFor(path) {
  if (path === "/") return distIndexPath;
  const cleanPath = path.replace(/^\/|\/$/g, "");
  return join(distDir, cleanPath, "index.html");
}

function writeRouteHtml(baseHtml, route) {
  const target = targetFor(route.path);
  ensureDir(dirname(target));
  writeFileSync(target, injectSeo(baseHtml, route), "utf8");
  console.log("written", target);
}

function generateSitemap() {
  const urls = routes
    .filter((route) => !route.noindex)
    .map((route) => {
      const depth = route.path.split("/").filter(Boolean).length;
      const priority = route.path === "/" ? "1.0" : depth <= 2 ? "0.8" : "0.6";
      return `  <url>
    <loc>${canonicalFor(route.path)}</loc>
    <lastmod>${route.lastmod ?? lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  writeFileSync(join(distDir, "sitemap.xml"), sitemap, "utf8");
  console.log("updated dist/sitemap.xml");
}

if (!existsSync(distIndexPath)) {
  throw new Error("dist/index.html does not exist. Run vite build before generating static routes.");
}

const baseHtml = readFileSync(distIndexPath, "utf8");
for (const route of routes) {
  writeRouteHtml(baseHtml, route);
}
generateSitemap();
console.log("Static SEO route generation complete.");
