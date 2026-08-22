# OOM Training Content Quality Audit (Course 1–3 × Level 1–3)

이 문서는 OOM (OPIc On Me)의 **Course × Level 아키텍처**와 **4개 만능 스토리라인 → 최대 질문 재사용** 철학에 따른 3개 코스 전체 콘텐츠 품질 감사 보고서입니다.

---

## 1. 감사 개요 및 기본 원칙

* **분석 대상**: Course 1 (Everyday & Getaway), Course 2 (Culture & City), Course 3 (Nature & Weekend)
* **레벨 체계**: 1구간 (Advanced, AL), 2구간 (Intermediate, IH/IM3), 3구간 (Foundation, IM2/IM1)
* **핵심 철학**:
  1. **One Canonical Scene**: 동일 스토리라인은 3개 레벨에서 정확히 같은 핵심 장면(`anchorScene`)과 팩트(`core.facts`)를 공유하며 어휘 밀도와 문장 복잡도만 차별화함.
  2. **Same Story, Different Focus**: variant는 핵심 사람·장소·사건·object를 유지하고 질문이 요구하는 최소 정보만 추가함. 새 주제에 맞는 별도 이야기를 만들지 않음.
  3. **Level-aware Speaking Cadence**: Level별 목표 시간과 답변 밀도를 지키며, 필러는 원문 필수 암기 요소가 아니라 필요할 때 고르는 recovery phrase로 취급함.
  4. **High Question Reusability**: 4개 핵심 이야기에서 질문과 anchor가 자연스럽게 맞는 communicative function을 골라 연습함. Advanced라고 모든 이야기에 문제/교훈 질문을 강제하지 않음.

---

## 2. 코스별 콘텐츠 구조 및 서베이 연계 매트릭스

| 코스 ID | 코스명 | 추천 서베이 활동 수 | 만능 스토리라인 수 | 롤플레이 시나리오 수 | 레벨별 실전 질문 수 |
|---|---|---|---|---|---|
| `course-1` | Everyday & Getaway | 12개 (공원, 해변, 카페, 쇼핑 등) | 4개 (공원, 카페, 해외여행, 집/재택) | 3개 (여행사, 공연예매, 친구약속) | 12개 × 3레벨 = 36개 |
| `course-2` | Culture & City | 12개 (영화, 공연, 박물관, 도시여행 등) | 4개 (영화관, 전시/공연, 국내도시, 혼자거주) | 3개 (티켓교환, 시설문의, 호텔예약) | 12개 × 3레벨 = 36개 |
| `course-3` | Nature & Weekend | 12개 (조깅, 자전거, 캠핑, 하이킹 등) | 4개 (조깅/러닝, 자전거/야외, 캠핑/자연, 동네산책) | 3개 (장비대여, 캠핑장변경, 운동친구) | 12개 × 3레벨 = 36개 |

---

## 3. 레벨별 스크립트 발화량 및 목표 시간 가이드 (Editorial Guidelines)

| 레벨 ID | 목표 등급 | 목표 시간 (초) | 권장 단어 수 | 발화 속도 (WPM) | 구문 복잡도 및 학습 초점 |
|---|---|---|---|---|---|
| `advanced` (1구간) | AL | 60 ~ 90초 | CORE 약 120 ~ 160 단어 + 선택 확장 | 110 ~ 130 WPM | 구체적 감각 묘사, 과거 시제 정밀성, anchor에 맞는 비교·변화·문제, 질문별 즉흥 변형 |
| `intermediate` (2구간) | IH / IM3 | 45 ~ 65초 | 70 ~ 110 단어 | 95 ~ 115 WPM | 장소·루틴·이유 연결, 최근 기억에 남는 경험 1개, 핵심 블록 재사용 |
| `foundation` (3구간) | IM2 / IM1 | 30 ~ 45초 | 40 ~ 70 단어 | 80 ~ 100 WPM | 육하원칙(누구·어디·무엇·왜), 짧고 명확한 단문, 기본 현재 루틴 완성 |

> **편집 안내 (Editorial Notice)**:
> 실제 발화 속도는 학습자의 호흡과 필러 사용에 따라 다를 수 있습니다. 스크립트 길이는 엄격한 하한/상한 검사 대상이 아니며, 학습자가 목표 시간 내에 주요 장면을 끊김 없이 완성할 수 있도록 돕는 유연한 가이드입니다.

---

## 4. 질문 변형·교체 블록 계약

- 답변 설계는 문단 index가 아니라 `ANSWER`, `SCENE / ACTION`, `RESULT`, 필요 시 `EXPANSION` 기능으로 나눕니다.
- 교체 가이드는 `KEEP`, `CHANGE`, `DROP`을 표시하고 Foundation·Intermediate·Advanced용 micro-example을 각각 소유합니다. Foundation이 Advanced 문단으로 fallback해서는 안 됩니다.
- Foundation 최근 경험 질문은 코스당 4개, 전체 12개이며 자연스러운 과거 시제와 한 개의 중심 topic family를 사용합니다. 각 Foundation storyline은 3문항을 유지합니다.
- Course 3 Intermediate metadata와 Advanced question type은 실제 prompt가 요구하는 묘사·이유·변화·비교·선호·문제 기능을 반영합니다.

## 5. 롤플레이 (6-Step Menu) 감사 결과

* **CORE 문제/목적**: 해결할 상황을 분명히 밝힘 (`I'm calling because...`).
* **CORE 질문 또는 요청**: 필요한 정보나 조치를 직접 요청함 (`Could you tell me...`, `Is it possible to...`).
* **CORE 다음 행동**: 확인 뒤 무엇을 할지 말함.
* **OPTIONAL 상황 설명·정보 질문·대안 1·대안 2·마무리**: 실제 질문과 상황에 필요한 기능만 선택함.

6개 이름은 회상 메뉴로 유지하지만 매 답변에서 모두 사용할 필요는 없습니다. 각 코스 manifest는 실제 데이터의 3개 roleplay ID와 정확히 일치하며, 시나리오마다 예약 변경·서비스 문제·조건 확인 같은 learner-facing 학습 기능과 세 Level 예시를 완비합니다. Roleplay 개수는 4개 storyline 수와 독립적입니다.

## 6. 자동 회귀 계약

`src/TrainingCourse.test.tsx`와 관련 컴포넌트 테스트는 다음을 검사합니다.

- Course 1~3 × Level resolve 및 12개 핵심 이야기 continuity
- 각 story/roleplay의 Foundation·Intermediate·Advanced 완전성
- Level별 replacement example 존재와 Foundation의 Advanced fallback 방지
- 모든 variant의 명시적 `newFacts` 배열과 최대 2개 제한
- Foundation 최근 경험 문법, 12문항 및 storyline당 3문항 분포
- roleplay manifest ID와 실제 3개 데이터 정합
- Level label/time 단일 source 표시
- STEP 6 단일 prompt source, headless Recorder, KEEP/FIX/RETRY, recorder/STT 안전장치
- mobile drawer의 focus 진입, Escape 닫기, trigger focus 복원

---

## 7. 정기 점검 및 유지보수 규칙

1. 새 코스 추가 시 `manifest.ts`, `survey.ts`, `storylines.ts`, `roleplays.ts`, `questions.ts`, `variants.ts`, `replacementGuides.ts`, `index.ts`를 완전하게 구성해야 합니다.
2. 각 스토리라인은 `levels.advanced`, `levels.intermediate`, `levels.foundation` 3개 키를 반드시 포함해야 합니다.
3. 실전 연습 질문은 `resolved.level.targetSeconds`와 연동된 타이머 및 STT/AI 피드백 가이드와 일치해야 합니다.
4. variant 변경 시 anchor와 충돌하는 장소·사람·사건·object를 새로 만들지 않았는지 검토하고, 질문에 필수인 NEW fact만 허용합니다.
5. Level 표시 문구는 `TRAINING_LEVELS`와 `formatTrainingPreset`에서 읽고 view에 별도 축약값을 하드코딩하지 않습니다.
