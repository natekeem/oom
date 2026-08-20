# OOM Training Content Quality Audit (Course 1–3 × Level 1–3)

이 문서는 OOM (OPIc On Me)의 **Course × Level 아키텍처**와 **4개 만능 스토리라인 → 최대 질문 재사용** 철학에 따른 3개 코스 전체 콘텐츠 품질 감사 보고서입니다.

---

## 1. 감사 개요 및 기본 원칙

* **분석 대상**: Course 1 (Everyday & Getaway), Course 2 (Culture & City), Course 3 (Nature & Activity)
* **레벨 체계**: 1구간 (Advanced, AL), 2구간 (Intermediate, IH/IM3), 3구간 (Foundation, IM2/IM1)
* **핵심 철학**:
  1. **One Canonical Scene**: 동일 스토리라인은 3개 레벨에서 정확히 같은 핵심 장면(`anchorScene`)과 팩트(`core.facts`)를 공유하며 어휘 밀도와 문장 복잡도만 차별화함.
  2. **Speaking Cadence**: 글말(Essay)이 아닌 입말(Spoken English) 중심의 자연스러운 구어체와 필러(`Well`, `Actually`, `You know`, `To be honest`)를 적용.
  3. **High Question Reusability**: 4개 만능 스크립트로 12개 이상의 OPIc 빈출 질문 유형(묘사, 루틴, 과거 경험, 비교, 돌발/문제 등)을 방어.

---

## 2. 코스별 콘텐츠 구조 및 서베이 연계 매트릭스

| 코스 ID | 코스명 | 추천 서베이 활동 수 | 만능 스토리라인 수 | 롤플레이 시나리오 수 | 레벨별 실전 질문 수 |
|---|---|---|---|---|---|
| `course-1` | Everyday & Getaway | 12개 (공원, 해변, 카페, 쇼핑 등) | 4개 (공원, 카페, 해외여행, 집/재택) | 3개 (여행사, 공연예매, 친구약속) | 12개 × 3레벨 = 36개 |
| `course-2` | Culture & City | 12개 (영화, 공연, 박물관, 도시여행 등) | 4개 (영화관, 전시/공연, 국내도시, 혼자거주) | 3개 (티켓교환, 시설문의, 호텔예약) | 12개 × 3레벨 = 36개 |
| `course-3` | Nature & Activity | 12개 (조깅, 자전거, 캠핑, 하이킹 등) | 4개 (조깅/러닝, 자전거/야외, 캠핑/자연, 동네산책) | 3개 (장비대여, 캠핑장변경, 운동친구) | 12개 × 3레벨 = 36개 |

---

## 3. 레벨별 스크립트 발화량 및 목표 시간 가이드 (Editorial Guidelines)

| 레벨 ID | 목표 등급 | 목표 시간 (초) | 권장 단어 수 | 발화 속도 (WPM) | 구문 복잡도 및 학습 초점 |
|---|---|---|---|---|---|
| `advanced` (1구간) | AL | 60 ~ 90초 | 120 ~ 170 단어 | 110 ~ 130 WPM | 구체적 감각 묘사, 과거 시제 정밀성, 예상 밖 반전/해결, 질문별 즉흥 변형 |
| `intermediate` (2구간) | IH / IM3 | 45 ~ 65초 | 70 ~ 110 단어 | 95 ~ 115 WPM | 장소·루틴·이유 연결, 최근 기억에 남는 경험 1개, 핵심 블록 재사용 |
| `foundation` (3구간) | IM2 / IM1 | 30 ~ 45초 | 40 ~ 70 단어 | 80 ~ 100 WPM | 육하원칙(누구·어디·무엇·왜), 짧고 명확한 단문, 기본 현재 루틴 완성 |

> **편집 안내 (Editorial Notice)**:
> 실제 발화 속도는 학습자의 호흡과 필러 사용에 따라 다를 수 있습니다. 스크립트 길이는 엄격한 하한/상한 검사 대상이 아니며, 학습자가 목표 시간 내에 주요 장면을 끊김 없이 완성할 수 있도록 돕는 유연한 가이드입니다.

---

## 4. 롤플레이 (6-Step Formula) 감사 결과

* **STEP 1 상황 파악**: 전화/현장 질문의 목적을 첫 문장에서 즉시 밝힘 (`I'm calling because...`, `I'm here to ask about...`).
* **STEP 2 기본 정보 질문**: 2~3개의 핵심 질문 연속 구성 (`Could you tell me...`, `Is it possible to...`).
* **STEP 3 문제 발생 인지**: 돌발 문제 상황을 명확히 제시 (`Unfortunately, there is a problem...`).
* **STEP 4 대안 2가지 제시**: 현실적인 옵션 2개 제시 (`Option A or Option B`).
* **STEP 5 양해 및 확인**: 상대방의 사정과 규정을 배려하는 정중한 확인.
* **STEP 6 깔끔한 마무리**: 감사와 다음 행동 안내로 대화 종결.

모든 코스의 롤플레이 시나리오는 위 6단계 공식을 준수하며, 3개 레벨(`advanced`, `intermediate`, `foundation`)에 맞춘 예시와 포커스를 완비하고 있습니다.

---

## 5. 정기 점검 및 유지보수 규칙

1. 새 코스 추가 시 `manifest.ts`, `survey.ts`, `storylines.ts`, `roleplays.ts`, `questions.ts`, `variants.ts`, `replacementGuides.ts`, `index.ts`를 완전하게 구성해야 합니다.
2. 각 스토리라인은 `levels.advanced`, `levels.intermediate`, `levels.foundation` 3개 키를 반드시 포함해야 합니다.
3. 실전 연습 질문은 `resolved.level.targetSeconds`와 연동된 타이머 및 STT/AI 피드백 가이드와 일치해야 합니다.
