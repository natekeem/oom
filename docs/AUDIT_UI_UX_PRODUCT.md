# OOM UI/UX Product Audit

> **Status: HISTORICAL AUDIT (2026-08-22).** Findings reflect the audited snapshot. Use `ARCHITECTURE.md`, `ROUTING.md`, and active source/tests for current ownership and behavior.

> **VISUALLY VERIFIED** — 2026-08-22, latest local `main` (`d909740`) 기준

## Executive Summary

이번 감사는 현재 OOM의 아키텍처를 다시 설계하지 않고, 실제 학습자가 `Home → OPIc 수험 가이드 → 시험 화면 · 조작법 → Training Overview → STEP 1~6 → STT/AI 피드백 → 같은 문제 재도전`을 따라갈 때의 완성도를 평가했다. Production build와 preview를 실행한 뒤 1440×1000, 1024×900, 390×844에서 실제 화면과 상호작용을 확인했다. 라이트·다크 테마를 모두 보았고, 질문 듣기, 녹음 시작/종료, 수동 Transcript 입력, AI 미설정 fallback, 같은 문제 재도전까지 수행했다.

현재 제품의 강점은 분명하다. Course가 이야기 세계를, Level이 답변 밀도를 소유하는 구조가 STEP 2~6에 일관되게 이어진다. STEP 6은 EVA → 질문 듣기 → 답변 녹음 → ① 녹음 ② STT ③ AI 피드백 → 같은 문제 재도전의 상태 변화가 명확하며, 색뿐 아니라 텍스트로도 녹음·성공·경고 상태를 전달한다. 추천/연습과 파트/전체의 두 축을 분리한 STEP 2도 학습 목적에 잘 맞는다.

다만 현재 상태를 “완성된 제품”으로 보기 어렵게 만드는 한 가지 실사용 차단 문제가 있다. 1024px에서 STEP 6의 중첩 grid 최소 폭이 충돌해 질문 듣기 영역과 우측 질문 정보가 겹친다. 이 구간은 요구된 laptop viewport이자 핵심 학습 화면이므로 P0이다. 모바일에서는 메뉴 drawer가 modal semantics와 focus 관리를 제공하지 않고, 시험 화면 가이드의 전역 고정 버튼과 annotation badge가 설명 대상 UI를 가린다. STEP 1은 이미 보유한 `recommendedFor` 정보를 노출하지 않으면서 내부 제작 용어를 보여 선택을 어렵게 한다. STEP 3의 slider는 저장되지 않는 로컬 시뮬레이션이지만 “난이도 설정”처럼 읽힌다. STEP 4와 STEP 5는 좋은 학습 재료가 많지만 모바일에서 실제 훈련 시작점이 첫 화면보다 지나치게 아래에 있다.

### Audit scope and limits

- 실제 렌더 확인: Home, OPIc 수험 가이드 hub/overview, 시험 화면 · 조작법, Training Overview, STEP 1~6, STEP 6 Review.
- 실제 상호작용 확인: 테마, 모바일 메뉴, level/course 선택과 저장, survey mode/view 변경, script tab, question listen 0/2, recording, 수동 Transcript, AI 미설정 fallback, same-question retry, random question.
- 외부 연동 한계: STT endpoint와 LLM endpoint를 새로 설정하지 않았다. 따라서 **미설정·직접 입력·fallback UI는 시각 검증**, 실제 STT 성공 결과와 실제 AI 성공 응답은 **SOURCE REVIEW ONLY**다.
- 저장소 범위: 제품 코드, dependency, architecture, 콘텐츠는 수정하지 않았다. 이 보고서만 생성했다.

### Severity summary

| Severity | Count | Meaning in this audit |
| --- | ---: | --- |
| P0 | 1 | 핵심 STEP 6의 1024px 실사용을 방해 |
| P1 | 9 | 학습 선택, 접근성, 모바일 핵심 흐름의 품질을 의미 있게 저하 |
| P2 | 8 | 정보 밀도, copy, tap target, 성능, 검증 안정성과 일관성 개선 |
| KEEP | 6 | 다음 구현 패스에서 보존해야 할 검증된 강점 |

## Top 10 Findings

1. **OOM-UX-001 / P0** — 1024px STEP 6에서 질문 듣기 영역과 질문 정보 panel이 겹친다.
2. **OOM-UX-002 / P1** — 모바일 drawer가 열려도 focus가 뒤 페이지에 남고 dialog/modal semantics가 없다.
3. **OOM-UX-003 / P1** — 모바일 시험 화면 가이드에서 고정 메뉴·테마 버튼과 번호 badge가 설명 대상을 가린다.
4. **OOM-UX-004 / P1** — STEP 1이 “나에게 맞는 선택” 근거 대신 등급 코드와 내부 제작 문구를 보여준다.
5. **OOM-UX-005 / P1** — STEP 3의 저장되지 않는 slider가 실제 난이도 설정처럼 보인다.
6. **OOM-UX-006 / P1** — `aria-hidden` 영역 안에 focus 가능한 Recorder control이 남아 있다.
7. **OOM-UX-007 / P1** — 문제 텍스트를 펼치면 screen reader용 prompt와 visible prompt가 중복된다.
8. **OOM-UX-008 / P1** — STEP 4 모바일에서 4개 스토리 selector와 기능 밀도가 추천 학습 순서를 가린다.
9. **OOM-UX-009 / P1** — STEP 5 모바일에서 실제 scenario CTA가 4,381px 길이의 설명 뒤에 묻힌다.
10. **OOM-UX-010 / P1** — Home의 “STEP 1 실전 훈련 시작”이 STEP 1이 아닌 Training Overview로 이동한다.

## What Should NOT Be Changed

- Course는 survey/story context, Level은 difficulty/answer density를 소유하는 현재 경계를 유지한다.
- 하나의 canonical storyline을 level별 밀도로 변형하고, 질문 유형별 variation/blueprint를 제공하는 모델을 유지한다.
- Training 전용 sticky title/progress header와 sidebar의 STEP 1~6 계층을 유지한다.
- STEP 2의 `추천 보기 / 연습 모드`와 `파트별 보기 / 전체 보기`를 서로 다른 축으로 유지한다.
- STEP 6의 audio-first 기본값, 질문 최대 2회 듣기, recording color+text, Review의 `① 녹음 → ② STT → ③ AI` 순서를 유지한다.
- STT가 없어도 Transcript를 직접 입력하고, AI가 없어도 checklist로 학습을 계속할 수 있는 progressive enhancement를 유지한다.
- zinc 기반, indigo action/active, emerald success, amber warning/prerequisite, red recording/error의 현재 semantic color 역할을 유지한다.
- 현재의 정돈된 Card radius, Button variant, keyboard focus ring을 전면 재설계하지 않는다. 문제 구간만 국소 수정한다.

## Journey Audit

| Stage | 5-second comprehension | Connection to previous/next | Audit result |
| --- | --- | --- | --- |
| Home | 제품 목적과 6 STEP은 보임 | 첫 CTA label과 destination 불일치 | 개선 필요: OOM-UX-010, 017 |
| OPIc 수험 가이드 | 가이드 영역과 6개 주제가 명확 | 동일한 “자세히 보기”가 반복되어 목적 차이가 약함 | 대체로 양호 |
| 시험 화면 · 조작법 | demo와 번호 설명의 관계가 desktop에서 명확 | 실제 연습 CTA가 존재 | mobile 개선 필요: OOM-UX-003 |
| Training Overview | 6 STEP과 현재 설정/선행조건을 이해 가능 | 모든 CTA가 활성이라 guard를 거쳐야 의미가 확정됨 | 개선 필요: OOM-UX-011 |
| STEP 1 | Level을 고른 뒤 Course가 나타나는 순서는 명확 | 추천 대상과 course 차이 판단 근거가 부족 | 개선 필요: OOM-UX-004 |
| STEP 2 | 추천/연습, 파트/전체 두 축이 구분됨 | story group까지 연결 | 유지: OOM-UX-021 |
| STEP 3 | 선택 level과 권장 숫자는 크게 보임 | slider의 실제 효력이 불명확 | 개선 필요: OOM-UX-005 |
| STEP 4 | “한 장면을 여러 질문에 변형” 목적은 좋음 | selector→tabs→세부 도구의 우선순위가 mobile에서 흐림 | 개선 필요: OOM-UX-008 |
| STEP 5 | flow→공식→표현→scenario 논리는 맞음 | mobile에서는 scenario 도달 비용이 큼 | 개선 필요: OOM-UX-009 |
| STEP 6 Phase A | EVA→Play→답변 시작의 exam mental model이 강함 | 1024에서 layout이 깨짐 | P0: OOM-UX-001 |
| STEP 6 Phase B | ① 녹음→② STT→③ AI→재도전이 명확 | 같은 질문을 유지하고 Phase A 상태를 reset | 유지: OOM-UX-019 |

## Screen-by-Screen Audit

### Home and global entry

#### OOM-UX-010

- **ID:** OOM-UX-010
- **Severity:** P1
- **Screen:** Home `/`
- **Problem:** Primary CTA가 “STEP 1 실전 훈련 시작”이라고 말하지만 `/training/` Overview로 이동한다.
- **Why it matters:** 사용자는 이미 STEP 1 선택 화면으로 이동한다고 기대한다. label과 destination의 작은 불일치는 첫 사용의 신뢰와 진행 감각을 떨어뜨린다.
- **Evidence:** 1440px와 390px에서 CTA를 확인했다. Source에서 `ButtonLink to="/training/"`와 “STEP 1 실전 훈련 시작”이 같은 요소에 있다.
- **Recommended change:** Overview로 보낼 의도라면 label을 “실전 훈련 둘러보기”로 바꾸고, STEP 1을 약속하려면 `/training/setup/`으로 보낸다. 둘 중 하나만 선택해 label-destination contract를 맞춘다.
- **Files:** `src/components/home/HomeView.tsx`, `src/lib/routes.ts`
- **Risk:** Low. 다만 deep-link보다 Overview onboarding을 우선한 기존 의도를 먼저 확인해야 한다.

#### OOM-UX-017

- **ID:** OOM-UX-017
- **Severity:** P2
- **Screen:** Home `/`
- **Problem:** 제품 entry dashboard 뒤에 긴 editorial 학습 가이드가 여러 Card로 이어져 Home의 주 행동이 희석된다.
- **Why it matters:** 모바일에서 첫 학습 시작과 보조 읽기 콘텐츠의 경계가 약해지고, Card가 많아 하나의 제품 흐름보다 여러 독립 dashboard module처럼 보인다.
- **Evidence:** 390px에서 hero, 추천 시작점, 3개 등급 Card, 6 STEP flow 이후 긴 OPIc 학습 가이드가 계속 이어졌다. Desktop에서도 primary CTA 이후 동일한 시각 무게의 Card가 반복된다.
- **Recommended change:** 콘텐츠를 삭제하거나 rewrite하지 말고, Home에는 핵심 1개 요약과 “가이드 더 보기” anchor를 두거나 기존 section을 progressive disclosure로 묶는다. 훈련 CTA의 시각 우선순위는 유지한다.
- **Files:** `src/components/home/HomeView.tsx`
- **Risk:** Medium. crawler-visible static body와 신뢰 콘텐츠를 축소하면 안 되므로 DOM content는 유지하면서 정보 계층만 조정해야 한다.

### OPIc guide and exam screen guide

#### OOM-UX-003

- **ID:** OOM-UX-003
- **Severity:** P1
- **Screen:** 시험 화면 · 조작법 `/exam-guide/screen/`
- **Problem:** 390px에서 전역 고정 메뉴/테마 버튼이 demo의 EVA status와 상단 tab을 덮고, absolute annotation badge 3·4가 각각 listen count와 microphone target 위에 놓인다.
- **Why it matters:** 설명을 위한 표식이 설명 대상의 상태와 조작점을 가리키면 학습자의 mental model을 만드는 가이드가 오히려 오독을 만든다.
- **Evidence:** Mobile light theme에서 선택된 “시험 화면” tab 일부가 fixed controls 아래로 들어갔고, demo를 scroll했을 때 EVA status badge와 1/2 counter, mic icon이 겹쳤다. Desktop 1440에서는 callout 위치가 양호했다.
- **Recommended change:** Mobile에서는 global controls가 content와 겹치지 않도록 상단 안전 영역을 확보한다. Demo annotation은 target 바깥 edge에 고정하지 말고 mobile-specific offset/leader line 또는 callout list 선택 시 target outline을 사용한다.
- **Files:** `src/components/layout/AppShell.tsx`, `src/components/practice/ExamScreenShell.tsx`, `src/components/guide/ExamGuideScreen.tsx`
- **Risk:** Medium. 실제 STEP 6 shell과 guide demo가 공유되므로 guide-only annotation 변경이 실전 console에 영향을 주지 않게 분리해야 한다.

### Training Overview

#### OOM-UX-011

- **ID:** OOM-UX-011
- **Severity:** P2
- **Screen:** Training Overview `/training/`
- **Problem:** 3개 개념 Card와 6개 STEP Card가 연속되고, 미설정 상태의 STEP 2~6에도 동일한 full-width “이동” CTA가 활성이다.
- **Why it matters:** 선행조건 badge는 읽히지만 action affordance는 지금 이동할 수 있다는 반대 신호를 준다. Mobile에서는 6 STEP 목적을 파악하기 전에 긴 Card stack을 통과한다.
- **Evidence:** 초기 미설정 상태에서 STEP 2~6에 amber “STEP 1 설정 후 이용” badge와 활성 CTA가 동시에 보였고, 이동 후 `TrainingSelectionGuard`가 막았다. 390px에서는 모든 concept/step Card가 한 열로 쌓였다.
- **Recommended change:** Architecture는 유지하되 상단 concept 3개를 한 줄 요약/compact legend로 축약하고, locked step CTA label을 “STEP 1 먼저 설정”으로 바꾸거나 disabled-like state와 설정 이동 action을 제공한다. 선택 완료 뒤에는 현재 동작으로 전환한다.
- **Files:** `src/components/training/TrainingHub.tsx`, `src/components/training/TrainingSelectionGuard.tsx`
- **Risk:** Medium. HTML `disabled`만 적용하면 정보 탐색도 막을 수 있으므로 prerequisite 안내와 이동 경로를 함께 보존해야 한다.

### STEP 1 — level and course

#### OOM-UX-004

- **ID:** OOM-UX-004
- **Severity:** P1
- **Screen:** STEP 1 `/training/setup/`
- **Problem:** Level Card는 1/2/3구간, AL/IH/IM3 등급, disclaimer를 보여주지만 “현재 실력 기준 누구에게 맞는지”를 보여주지 않는다. Course Card에는 “Course 1”, “anchor scene”, “2025~2026 공개 서베이 전략”, “현재 OOM의 main 4개 스크립트” 같은 내부 제작 문구가 노출된다.
- **Why it matters:** 첫 필수 결정에서 사용자는 등급 체계를 이미 알아야 하고, course 간 실제 학습 경험 차이보다 제작 방식의 차이를 읽게 된다. 이 지점의 망설임은 이후 모든 STEP 진입을 지연한다.
- **Evidence:** 1440px와 390px에서 level 선택 전/후를 확인했다. `src/training/levels.ts`에는 이미 `recommendedFor`가 있지만 `TrainingSetupView`는 이를 렌더하지 않는다. Course description은 manifest 원문을 그대로 출력한다.
- **Recommended change:** Level Card에 기존 `recommendedFor`를 “이런 분께 추천”으로 노출하고, 목표 등급→권장 난이도→답변 시간 순으로 계층화한다. Course Card에는 survey 주제 2~3개와 대표 장면의 learner-facing 차이만 보여주고 내부 제작 설명은 UI에서 숨긴다. 데이터 rewrite가 아니라 display summary field를 분리한다.
- **Files:** `src/components/training/TrainingSetupView.tsx`, `src/training/levels.ts`, `src/data/training/courses/course-*/manifest.ts`
- **Risk:** Medium. “추천”을 점수 보장처럼 읽히지 않도록 기존 disclaimer는 선택 뒤 보조 설명으로 유지해야 한다.

### STEP 2 — survey

#### OOM-UX-021

- **ID:** OOM-UX-021
- **Severity:** KEEP
- **Screen:** STEP 2 `/training/survey/`
- **Problem:** 변경 대상이 아니라 유지 대상이다. 추천/연습 mode와 파트/전체 view가 서로 다른 레벨에서 표현되고, practice에서는 선택→채점의 상태가 분리된다.
- **Why it matters:** “무엇을 익히는가”와 “어떻게 보는가”를 한 toggle에 섞지 않아 실제 survey rehearsal에 도움이 된다.
- **Evidence:** 추천 보기에서 고정 답이 명확했고, 연습 모드 전환 시 선택 상태가 독립적으로 시작됐다. 파트별/전체 보기 전환과 story grouping이 1440, 1024, 390에서 overflow 없이 동작했다.
- **Recommended change:** 현재 두 축의 계층과 full survey-like list를 유지한다. 다음 패스에서도 두 toggle을 하나의 segmented control로 합치지 않는다.
- **Files:** `src/components/survey/BackgroundSurveySheet.tsx`, `src/data/fixedSurvey.ts`
- **Risk:** High if changed. 두 축을 합치면 현재 명확한 학습 mode와 정보 view의 구분이 사라진다.

### STEP 3 — difficulty

#### OOM-UX-005

- **ID:** OOM-UX-005
- **Severity:** P1
- **Screen:** STEP 3 `/training/difficulty/`
- **Problem:** 선택된 level의 권장값은 명확하지만, 오른쪽의 “내 연습용 난이도 표시” slider는 local component state만 바꾸면서 화면 제목과 문맥상 실제 OOM preset 또는 시험 난이도를 설정하는 것처럼 보인다. Foundation/Intermediate/Advanced 목표 Card도 선택 level과 무관하게 같은 무게다.
- **Why it matters:** 사용자가 `2구간 → 4→4`의 관계를 이해한 뒤 slider를 움직이면 downstream 질문이나 시험 설정이 바뀐다고 기대할 수 있다. 저장·적용 CTA가 없다는 사실은 효력이 없는 설정인지, 자동 저장인지 불분명하게 만든다.
- **Evidence:** 2구간에서 4→4 추천과 두 slider를 실제 변경했다. 새 값은 “현재 선택”만 바꾸고 navigation/context에 반영되지 않았다. Source에서도 `useState` local state 외 persistence나 training context update가 없다.
- **Recommended change:** 실제 설정으로 만들지 않을 계획이라면 section을 “난이도 조합 미리 보기” 또는 “연습 시뮬레이션”으로 명명하고 “다른 STEP의 질문 구성은 바뀌지 않음”을 즉시 표시한다. 선택 level에 해당하는 목표 Card만 primary로 강조하고 나머지는 참고로 낮춘다.
- **Files:** `src/components/difficulty/DifficultyGuide.tsx`, `src/training/levels.ts`
- **Risk:** Low to Medium. 실제 시험 난이도 추천으로 오해되지 않도록 copy 검수는 필요하다.

### STEP 4 — scripts

#### OOM-UX-008

- **ID:** OOM-UX-008
- **Severity:** P1
- **Screen:** STEP 4 hub/detail `/training/scripts/`, `/training/scripts/outdoor/` 등
- **Problem:** 학습 모델 자체는 좋지만 detail mobile 첫 viewport가 4개 story selector로 소비된다. 그 아래 `메인 스토리 / 질문별 변형 / 답변 설계`와 strategy, keyword, expected question, memory/blind, script, TTS, copy, AI variation이 이어져 “첫 행동”이 약하다.
- **Why it matters:** 기능을 발견하는 것과 학습법을 이해하는 것은 다르다. 반복 방문자에게는 story 선택이 유용하지만 첫 방문자는 읽기·듣기·회상·변형 중 어디부터 시작할지 결정해야 한다.
- **Evidence:** 390px detail에서 4개 selector Card가 첫 화면을 채워 실제 script tab/content가 아래로 밀렸다. 1440px에서는 selector가 한 행이라 문제가 작았다. Hub의 3단계 안내는 좋지만 detail 진입 후 지속적으로 보이지 않는다.
- **Recommended change:** Detail에서는 선택된 story를 compact selector/dropdown 또는 horizontally scrollable compact tabs로 줄인다. Hub의 3단계를 detail에도 작은 progress rail로 유지한다: `1 읽고 듣기 → 2 키워드로 회상 → 3 질문별 변형/설계`. 기존 기능은 삭제하지 말고 단계 안에 배치한다.
- **Files:** `src/components/script/ScriptDashboardV2.tsx`, `src/components/script/ScriptTrainingTabs.tsx`, `src/components/script/ScriptDetail.tsx`, `src/components/script/ScriptHub.tsx`
- **Risk:** Medium. 빠른 story 전환과 현재 URL slot ownership은 보존해야 한다.

#### OOM-UX-023

- **ID:** OOM-UX-023
- **Severity:** KEEP
- **Screen:** STEP 4
- **Problem:** 변경 대상이 아니라 유지 대상이다. `메인 스토리 / 질문별 변형 / 답변 설계`는 암기량을 늘리지 않고 같은 장면을 question pivot에 맞게 바꾸는 제품 원칙을 잘 설명한다.
- **Why it matters:** 이 구조가 OOM을 단순 script library와 구분한다.
- **Evidence:** 실제로 세 tab을 전환해 core scene 유지, 바꿀 block, answer blueprint를 확인했다. 선택된 Course/Level 문맥도 유지됐다.
- **Recommended change:** 세 tab과 canonical story model은 유지한다. 개선은 진입 순서와 mobile selector 밀도에만 한정한다.
- **Files:** `src/components/script/ScriptTrainingTabs.tsx`, `src/components/script/ScriptTrainingGuide.tsx`, `src/components/script/ScriptDashboardV2.tsx`
- **Risk:** High if changed. Story A/B 또는 질문별 완성 답안 목록으로 되돌리면 현재 architecture의 핵심 이점이 사라진다.

### STEP 5 — roleplay

#### OOM-UX-009

- **ID:** OOM-UX-009
- **Severity:** P1
- **Screen:** STEP 5 `/roleplay/`
- **Problem:** 출제 흐름→6단계 공식→필수 표현→scenario 순서는 논리적이지만, mobile에서 scenario CTA가 4,381px 길이의 읽기 콘텐츠 뒤에 있다.
- **Why it matters:** STEP 5의 목적은 공식을 읽는 것보다 scenario에서 꺼내 쓰는 것이다. 이미 공식을 아는 반복 사용자는 매번 긴 설명을 지나야 한다.
- **Evidence:** 390×844에서 page `scrollHeight` 4,381px를 확인했고, scenario Card는 flow 4개, formula 6개, phrase section 다음에 나타났다. Desktop에서는 다열 layout으로 부담이 줄었다.
- **Recommended change:** Header 바로 아래 “현재 코스 scenario로 연습” anchor CTA를 추가하고, formula/phrase는 접을 수 있는 reference section으로 만든다. 첫 방문에는 순서를 안내하되 재방문에는 scenario를 우선 노출한다.
- **Files:** `src/components/roleplay/RoleplayHub.tsx`
- **Risk:** Medium. 공식 자체를 숨겨 reference discoverability를 떨어뜨리지 않도록 default/open state를 세션 또는 viewport에 맞게 설계해야 한다.

### STEP 6 — Phase A: Exam

#### OOM-UX-001

- **ID:** OOM-UX-001
- **Severity:** P0
- **Screen:** STEP 6 `/practice/`, 1024px laptop
- **Problem:** 1024px에서 outer console은 이미 2-column `lg` layout으로 전환되는데, 왼쪽 내부도 `sm` 2-column 최소폭 200px+240px을 유지한다. 사용 가능한 main 폭 안에서 두 조건이 동시에 충족되지 않아 우측 질문 정보 panel이 질문 듣기 control 위로 겹친다.
- **Why it matters:** Play/status/listen count가 가려져 핵심 질문 청취와 답변 시작 흐름을 방해한다. STEP 6은 제품의 가장 중요한 실전 UX이며 1024px은 명시된 laptop target이다.
- **Evidence:** 1024×900 light theme에서 우측 `Question Info`가 중앙 Play/control/status를 시각적으로 덮는 것을 실제 확인했다. Document horizontal overflow는 없었기 때문에 사용자가 옆으로 scroll해 회피할 수도 없다. Source의 outer `lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]`와 inner `sm:grid-cols-[minmax(200px,0.85fr)_minmax(240px,1.15fr)]` 조합이 원인과 일치한다.
- **Recommended change:** Outer 2-column breakpoint를 실제 container 폭 기준으로 `xl`까지 늦추거나, 1024 main width에서는 interviewer/listen을 한 열로 유지한다. 가능하면 viewport가 아니라 console container query로 결정한다. 1440의 현재 3영역 시선 순서는 보존한다.
- **Files:** `src/components/practice/ExamScreenShell.tsx`, `src/components/layout/AppShell.tsx`
- **Risk:** Medium. breakpoint만 옮겨도 1024은 안전해지지만 중간 폭(1100~1279)과 sidebar 폭을 함께 회귀 검증해야 한다.

#### OOM-UX-007

- **ID:** OOM-UX-007
- **Severity:** P1
- **Screen:** STEP 6 및 guide demo의 Question Prompt
- **Problem:** Question prompt를 항상 `sr-only` paragraph로 렌더하고, `showQuestionText`가 true이면 같은 문장을 visible paragraph로 다시 렌더한다.
- **Why it matters:** 보조기술 사용자가 toggle 후 같은 질문을 중복으로 들을 수 있고, `aria-expanded`가 알려주는 상태 변화보다 중복 content가 더 크게 느껴질 수 있다.
- **Evidence:** 실제 DOM에서 같은 prompt paragraph가 두 번 존재하는 것을 확인했다. Source에서도 always-present screen-reader prompt 다음에 conditional visual prompt가 별도 렌더된다.
- **Recommended change:** 하나의 prompt node를 유지해 visual/sr-only class만 상태에 따라 바꾸거나, visible prompt를 `aria-hidden` 처리하고 toggle에 연결된 단일 accessible description을 유지한다. 상태 변화는 live announcement가 필요할 때만 별도 짧게 알린다.
- **Files:** `src/components/practice/ExamScreenShell.tsx`
- **Risk:** Low. audio-first 상태에서 prompt의 screen-reader 접근성이 사라지지 않는지 테스트해야 한다.

#### OOM-UX-012

- **ID:** OOM-UX-012
- **Severity:** P2
- **Screen:** Training sticky header, especially STEP 1 and STEP 6 mobile
- **Problem:** 390px에서 긴 현재 page title이 말줄임되고, 다음 단계 action은 label 없이 화살표 icon만 보인다.
- **Why it matters:** progress bar가 있어도 사용자는 현재 STEP의 정확한 이름과 다음 destination을 한눈에 확인하기 어렵다. 특히 “지금 어디/다음 무엇”이라는 training header의 핵심 역할이 mobile에서 약해진다.
- **Evidence:** STEP 1에서 title이 “STEP 1. 목표 구간 · 코스 ...”로 잘렸고 다음 action은 icon만 보였다. Accessible label은 존재하지만 시각 사용자에게 destination은 숨겨진다.
- **Recommended change:** Mobile title은 `STEP 1 · 코스 설정`처럼 짧은 display label을 별도로 쓰고, next action에는 최소 `STEP 2` text를 노출한다. 전체 title은 page H1에서 유지한다.
- **Files:** `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`
- **Risk:** Low. accessible name과 desktop full label은 유지해야 한다.

#### OOM-UX-018

- **ID:** OOM-UX-018
- **Severity:** KEEP
- **Screen:** STEP 6 Phase A
- **Problem:** 변경 대상이 아니라 유지 대상이다. EVA, 중앙 Play, 0/2, Question Prompt, answer state, timer, target time, random question과 question info가 desktop에서 exam mental model을 강하게 만든다.
- **Why it matters:** 사용자는 화면을 보는 즉시 “시험 연습”임을 이해하고, `EVA → Play → 질문 prompt 선택 → 답변 시작` 순서로 시선이 이동한다.
- **Evidence:** 1440 dark/light에서 질문 듣기 클릭 후 Playing state, EVA speaking badge, 0/2→1/2, disabled control이 즉시 반영됐다. 녹음 중에는 red dot+“답변 녹음 중”+timer+“답변 종료”가 함께 보였다.
- **Recommended change:** 1440 layout, audio-first 기본, 최대 2회 듣기와 state feedback을 유지한다. 1024 breakpoint만 국소 수정한다.
- **Files:** `src/components/practice/ExamScreenShell.tsx`, `src/components/practice/ExamInterviewer.tsx`, `src/components/practice/PracticeView.tsx`
- **Risk:** High if changed. 일반 dashboard Card로 평준화하면 현재의 실전 몰입감이 사라진다.

### STEP 6 — Phase B: Review and retry

#### OOM-UX-006

- **ID:** OOM-UX-006
- **Severity:** P1
- **Screen:** STEP 6 `/practice/`
- **Problem:** 실제 recording engine인 `Recorder` 전체를 `div.sr-only[aria-hidden=true]` 안에 렌더하지만 Recorder 내부에는 focus 가능한 녹음 버튼이 남아 있다.
- **Why it matters:** 화면에 보이지 않고 screen reader에서도 숨겨진 duplicate control이 keyboard tab order에 들어가면 사용자는 어디에 focus가 있는지 알 수 없다. `aria-hidden` 안의 focusable descendant 자체도 접근성 tree와 keyboard tree의 불일치를 만든다.
- **Evidence:** DOM/source에서 `PracticeView`의 invisible Recorder wrapper와 Recorder 내부 button을 확인했다. Visible `ExamScreenShell`도 별도의 답변 시작/종료 control을 제공한다.
- **Recommended change:** Recorder를 headless hook/imperative engine으로 분리하거나, engine mode에서는 내부 UI를 렌더하지 않도록 한다. 임시 대응이라면 hidden subtree의 모든 interactive element를 제거하고 visible control만 tab order에 둔다.
- **Files:** `src/components/practice/PracticeView.tsx`, `src/components/practice/Recorder.tsx`
- **Risk:** Medium. MediaRecorder lifecycle과 imperative ref contract를 깨지 않도록 녹음 시작/종료/cleanup 회귀 테스트가 필요하다.

#### OOM-UX-016

- **ID:** OOM-UX-016
- **Severity:** P2
- **Screen:** STEP 6 Review / AI fallback
- **Problem:** LLM 미설정 상태에서 AI 피드백을 누르면 Review에 checklist를 제공하는 동시에 Phase A의 story hint를 자동으로 펼친다.
- **Why it matters:** 사용자의 현재 초점은 Review의 ③ AI Card인데, 위쪽 exam console 높이가 갑자기 바뀌어 별도 attention shift를 만든다. 설정 실패와 학습 hint 공개가 하나의 action에 결합돼 있다.
- **Evidence:** 수동 Transcript 입력 후 AI 피드백을 눌렀을 때 설정 안내 toast와 fallback checklist가 나타났고, 위 Phase A hint도 expanded 상태로 바뀌었다. Source의 미설정·성공·실패 branch가 모두 `setShowStoryHint(true)`를 호출한다.
- **Recommended change:** Fallback checklist는 Review 안에서만 유지하고, story hint는 사용자가 직접 펼치거나 실제 feedback이 해당 hint를 참조할 때 명시적 CTA로 연다. 필요하면 Review heading으로 focus/scroll을 유지한다.
- **Files:** `src/components/practice/PracticeView.tsx`, `src/components/practice/PracticeReviewPanel.tsx`
- **Risk:** Low. AI 성공 시 hint와 피드백을 함께 비교하는 기존 학습 의도가 있다면 explicit link로 보존한다.

#### OOM-UX-019

- **ID:** OOM-UX-019
- **Severity:** KEEP
- **Screen:** STEP 6 Phase B and same-question retry
- **Problem:** 변경 대상이 아니라 유지 대상이다. Review는 ① 녹음 ② STT ③ AI 순서를 번호와 layout으로 반복하고, STT가 없어도 직접 입력할 수 있으며 retry가 같은 질문을 유지한다.
- **Why it matters:** 외부 서비스 설정 여부와 무관하게 학습 loop가 끊기지 않는다. 같은 문제 재도전은 feedback을 다음 발화로 전이시키는 핵심 행동이다.
- **Evidence:** 녹음 종료 후 audio control과 Review가 나타났고, STT 미설정 banner와 설정 CTA, editable textarea, word count, disabled/enabled AI button을 확인했다. “피드백 반영하여 다시 말하기” 후 질문은 유지되고 0/2·녹음·Transcript·feedback이 reset됐으며 “재도전 준비 완료” feedback이 나타났다.
- **Recommended change:** 순서, manual fallback, same-question preservation, reset feedback을 유지한다. 1440의 3-column과 mobile의 1-column 반응형도 유지한다.
- **Files:** `src/components/practice/PracticeReviewPanel.tsx`, `src/components/practice/PracticeView.tsx`, `src/components/practice/sttUiStatus.ts`
- **Risk:** High if changed. AI/STT를 필수 gate로 만들면 현재의 resilient learning loop가 사라진다.

### Global navigation and accessibility

#### OOM-UX-002

- **ID:** OOM-UX-002
- **Severity:** P1
- **Screen:** Global mobile navigation
- **Problem:** Drawer가 열려도 trigger focus가 뒤 페이지에 남고, drawer는 `aria-label`만 있는 `aside`이며 `role="dialog"`, `aria-modal`, focus trap/inert, open trigger의 `aria-expanded`, close 후 focus restore가 없다.
- **Why it matters:** Keyboard와 screen-reader 사용자는 overlay 뒤의 page content로 이동할 수 있고, menu가 modal navigation context라는 사실을 알기 어렵다.
- **Evidence:** 390px Home에서 menu를 연 뒤 active element가 뒤의 “메뉴 열기” button에 남아 있음을 확인했다. DOM/source에서 backdrop button과 `aside aria-label="모바일 메뉴"`만 확인됐다.
- **Recommended change:** Trigger에 `aria-expanded`/`aria-controls`를 연결하고, open 시 첫 meaningful menu item 또는 close button으로 focus 이동, background inert, Escape close, focus trap, close 후 trigger restore를 구현한다. Drawer에 적절한 dialog/navigation semantics를 부여한다.
- **Files:** `src/components/layout/AppShell.tsx`, `src/components/layout/ExpandableSidebar.tsx`
- **Risk:** Medium. Sidebar accordion keyboard behavior와 route 이동 시 자동 close를 함께 회귀 테스트해야 한다.

#### OOM-UX-013

- **ID:** OOM-UX-013
- **Severity:** P2
- **Screen:** Global controls, guide annotations, STEP 6 secondary actions
- **Problem:** 공통 `sm` Button은 높이 32px이고, prompt toggle과 annotation badge는 28px이다. 일부 mobile touch target이 권장 44×44px에 못 미친다.
- **Why it matters:** 작은 target이 촘촘한 시험 console이나 이동 중 사용에서 오탭 가능성을 높인다. 특히 annotation과 text reveal은 icon/짧은 label이라 실제 hit area가 작다.
- **Evidence:** Source의 `sm: h-8`, prompt `h-7`, annotation `h-7 w-7`을 확인했고 mobile render에서도 인접 control이 조밀했다.
- **Recommended change:** Desktop 시각 크기는 유지해도 mobile coarse-pointer에서는 pseudo-element/padding으로 hit area를 44px 이상 확보한다. 모든 `sm`을 일괄 확대하지 말고 실제 touch action을 선별한다.
- **Files:** `src/components/ui/Button.tsx`, `src/components/practice/ExamScreenShell.tsx`, `src/components/layout/ExpandableSidebar.tsx`
- **Risk:** Low to Medium. Console 안에서 실제 visual size를 키우면 layout 문제가 커질 수 있으므로 invisible hit area 방식을 우선한다.

#### OOM-UX-015

- **ID:** OOM-UX-015
- **Severity:** P2
- **Screen:** Global copy, STEP 1/4/6
- **Problem:** Korean-first UI 안에 learner-facing label과 내부/영문 용어가 혼재한다: `Course`, `anchor scene`, internal survey ID (`leisure-movie` 등), `Transcript`, `Phase B`, `Question Prompt`, `Practice Question`.
- **Why it matters:** 시험 용어인 영문은 유용하지만 제작 메타데이터와 개발 명칭은 학습자의 이해를 돕지 않는다. “고정/익히기/설정/훈련”도 같은 행동을 다르게 묘사하는 구간이 있다.
- **Evidence:** STEP 1 Course description, STEP 4 hub Card ID, STEP 6 Review heading/textarea label에서 실제 노출을 확인했다. Home은 “STEP 2 서베이 고정”, navigation은 “추천 서베이 익히기”를 사용한다.
- **Recommended change:** 시험에서 실제로 보는 영문은 병기하고, 내부 ID/제작 용어는 숨긴다. Product glossary를 짧게 정해 `코스`, `추천 서베이 익히기`, `답변 복기`, `음성 받아쓰기(STT)`를 primary label로 통일한다.
- **Files:** `src/components/home/HomeView.tsx`, `src/components/training/TrainingSetupView.tsx`, `src/components/script/ScriptHub.tsx`, `src/components/practice/ExamScreenShell.tsx`, `src/components/practice/PracticeReviewPanel.tsx`, course manifests
- **Risk:** Medium. 공식 OPIc 화면을 모사하는 영문 label까지 무리하게 번역하면 exam fidelity가 낮아질 수 있다.

#### OOM-UX-020

- **ID:** OOM-UX-020
- **Severity:** KEEP
- **Screen:** Global navigation and selection state
- **Problem:** 변경 대상이 아니라 유지 대상이다. Sidebar의 현재 위치, training-only header, direct URL guard, Course/Level context의 cross-screen persistence가 일관된다.
- **Why it matters:** 6 STEP 제품에서 사용자가 현재 위치와 선택 context를 잃지 않는 것이 핵심이다.
- **Evidence:** STEP 이동 중 선택한 Culture & City / 2구간이 header와 각 screen에 유지됐다. 미설정 상태에서 STEP 2~6은 `TrainingSelectionGuard`로 STEP 1 복귀 경로를 제공한다. Home/guide에는 training header가 나타나지 않았다.
- **Recommended change:** Current route ownership, direct URL guard, training-only header rule을 유지한다. Overview CTA wording과 mobile header만 국소 개선한다.
- **Files:** `src/App.tsx`, `src/components/layout/AppShell.tsx`, `src/components/layout/ExpandableSidebar.tsx`, `src/components/training/TrainingSelectionGuard.tsx`, `src/training/TrainingSelectionContext.tsx`
- **Risk:** High if changed. 전역 header로 확장하거나 guard를 redirect-only로 바꾸면 현재 context 설명과 복구 경로가 약해진다.

#### OOM-UX-022

- **ID:** OOM-UX-022
- **Severity:** KEEP
- **Screen:** Global visual system and interaction feedback
- **Problem:** 변경 대상이 아니라 유지 대상이다. 색 역할, Button variants, focus ring, loading/disabled state, toast/status 조합이 전반적으로 일관된다.
- **Why it matters:** 기능 수가 많은 제품에서 상태 의미가 화면마다 바뀌지 않는다. 녹음은 red+text, 선택/성공은 emerald, 선행조건/미설정은 amber, primary action은 indigo로 읽힌다.
- **Evidence:** 라이트/다크, 1440/1024/390에서 확인했다. 질문 듣기 disabled, 녹음 timer, survey 선택, STT 미설정, AI fallback, retry toast가 색 외 텍스트를 함께 사용했다. 공통 Button은 focus-visible ring을 제공한다.
- **Recommended change:** Semantic palette와 Button system을 유지한다. P2 tap target 개선을 이유로 variant 체계를 재설계하지 않는다.
- **Files:** `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Toast.tsx`, `src/components/practice/ExamScreenShell.tsx`
- **Risk:** High if changed. 장식 색을 늘리면 현재 상태 언어가 약해진다.

## Desktop Audit

### 1440×1000

- Fixed 256px sidebar와 최대 content width의 균형은 양호했다. 대부분의 학습 Card가 3~4열로 펼쳐져 긴 콘텐츠의 부담이 줄었다.
- STEP 6의 시선 순서는 EVA → Play/0-of-2 → Question Info/Prompt → 답변 control로 자연스러웠다.
- Review의 3-column은 `녹음 / STT / AI`의 순서를 유지하면서 middle Transcript column에 더 많은 폭을 주어 적절했다.
- Exam guide callout은 desktop에서는 target과 설명 Card의 관계가 명확했다.
- Home과 Training Overview는 usable하지만 Card 밀도가 높아 “학습 문서”보다 “dashboard module 묶음”처럼 보이는 구간이 있다.

### 1024×900

- Sidebar가 여전히 256px을 차지한 상태에서 main content가 약 753px로 줄어든다. 일반 Card/grid는 1~2열로 자연스럽게 적응했다.
- STEP 4 selector의 2-column 전환은 안정적이었다.
- STEP 6만 `lg` outer split과 `sm` inner split이 동시에 적용돼 겹침이 발생했다. 이는 단순 polish가 아니라 주요 control을 가리는 P0이다.

## Mobile Audit

### 390×844

- 가로 overflow는 주요 화면에서 관찰되지 않았고 Card, Review, survey row는 한 열로 안정적으로 쌓였다.
- Training sticky header는 progress를 유지하지만 title truncation과 icon-only next로 destination 정보가 줄었다.
- Home과 Training Overview는 scroll이 길지만 primary CTA는 상단에서 찾을 수 있었다.
- STEP 1은 level→course progressive reveal이 이해 가능했으나 선택 근거가 약했다.
- STEP 2의 두 toggle 축과 full/part list는 mobile에서도 명확했다.
- STEP 4 detail은 story selector가 첫 viewport를 차지했고, STEP 5는 scenario까지 4,381px이었다.
- STEP 6은 exam fidelity와 recording state가 유지됐으나 첫 viewport에서 EVA 비중이 커 Play가 하단에 부분적으로만 보인다. 현재는 scroll로 해결 가능해 별도 severity를 부여하지 않았지만 OOM-UX-008/009의 “핵심 행동 우선” 개선과 함께 재검토할 가치가 있다.
- Mobile drawer modal/focus와 exam guide overlay는 accessibility와 조작법 이해에 직접 영향을 준다.

## Accessibility

### Confirmed strengths

- 주요 icon button에 accessible label이 있다.
- script tab은 `role="tablist"`, `role="tab"`, `aria-selected`를 사용한다.
- Question text toggle은 `aria-expanded`를 제공한다.
- recording, speaking, STT, error/success가 색만이 아니라 텍스트와 icon으로 표현된다.
- 공통 Button은 `focus-visible` outline/ring을 제공하고, Toast는 `role="status"`를 사용한다.

### Priority gaps

1. **Mobile navigation modal semantics/focus** — OOM-UX-002.
2. **Hidden Recorder의 focusable descendant** — OOM-UX-006.
3. **Question prompt accessible duplicate** — OOM-UX-007.
4. **Touch targets below 44px** — OOM-UX-013.
5. **Guide annotation occlusion** — OOM-UX-003.

Keyboard review는 menu open/focus와 주요 button focusability를 중심으로 수행했다. 전체 screen-reader announcement 순서와 실제 iOS VoiceOver/Android TalkBack은 이번 환경에서 실행하지 않았으므로 후속 구현 후 별도 보조기술 QA가 필요하다.

## Technical UI Debt

#### OOM-UX-014

- **ID:** OOM-UX-014
- **Severity:** P2
- **Screen:** Global startup/performance
- **Problem:** Production build의 main JavaScript chunk가 약 799.58kB로 Vite의 500kB warning을 넘는다.
- **Why it matters:** 정적 hosting과 mobile 사용에서 initial parse/execute 비용이 커질 수 있다. 특히 Home 방문에도 training/practice 기능 전체가 eager-loaded되면 첫 반응성이 불리하다.
- **Evidence:** `npm run build`에서 `dist/assets/index-*.js 799.58 kB`와 chunk-size warning을 실제 확인했다.
- **Recommended change:** route-level lazy loading을 우선 검토해 guide, magazine, STEP 4/5, practice를 화면 단위로 분리한다. dependency 교체나 architecture migration 없이 측정 기반으로 적용한다.
- **Files:** `src/App.tsx`, route-imported screen components, `vite.config.ts`
- **Risk:** Medium. BrowserRouter/static route generation과 suspense/loading state가 함께 검증돼야 한다.

#### OOM-UX-024

- **ID:** OOM-UX-024
- **Severity:** P2
- **Screen:** Training sidebar navigation regression coverage
- **Problem:** 현재 `npm run test`에서 training navigation test 1개가 STEP 5 heading을 기다리지 못해 실패한다. 전체 결과는 70 passed, 1 failed다.
- **Why it matters:** 실제 제품의 sidebar 이동은 정상이어도 회귀 신호가 red인 상태다. 다음 UI 수정이 navigation을 깨뜨려도 baseline failure에 묻힐 수 있다.
- **Evidence:** `src/TrainingNavigation.test.tsx:45`의 `findByText(/문제를 설명하고.../)`가 실패했다. 이후 실제 1440px browser에서 `STEP 1` sidebar click→`STEP 5. 롤플레이 공식` parent label click을 같은 순서로 재현했고 `/roleplay/`, heading, scenario button이 정상 나타났다. 같은 test run에서 나머지 70개 test는 통과했고 lint, build, static page verification은 통과했다.
- **Recommended change:** Test가 실제 route transition 완료를 안정적으로 기다리도록 assertion/animation boundary를 정렬한다. Product navigation contract는 현재 정상 확인됐으므로 timeout 숫자만 임의로 늘리기보다 test 환경의 transition 대기 조건을 명시한다.
- **Files:** `src/TrainingNavigation.test.tsx`, `src/components/layout/ExpandableSidebar.tsx`, `src/App.tsx`
- **Risk:** Low. Test만 무조건 green으로 만들면 실제 parent-navigation 회귀를 숨길 수 있으므로 browser assertion을 함께 둔다.

### UX risk-linked debt only

- **Fragile absolute positioning:** Exam guide annotation의 negative edge offset은 mobile target occlusion을 만든다. OOM-UX-003.
- **Breakpoint composition:** viewport `lg`와 nested `sm` grid의 독립 판단이 1024 overlap을 만든다. OOM-UX-001.
- **Duplicate UI state/control:** visible Exam control과 hidden Recorder UI가 동시에 존재한다. OOM-UX-006.
- **Duplicate accessible content:** prompt가 sr-only와 visible node로 중복된다. OOM-UX-007.
- **Visual state detached from product state:** Difficulty slider가 local state에만 있다. OOM-UX-005.
- **Repeated Card composition:** Home/Overview/Roleplay의 긴 stack이 mobile task priority를 약화한다. OOM-UX-009, 011, 017.

Repeated Tailwind class string이나 일반적인 component branching은 실제 UX 위험이 확인되지 않은 경우 backlog에 넣지 않았다.

## P0 / P1 / P2 Backlog

### P0

| ID | Screen | Outcome required |
| --- | --- | --- |
| OOM-UX-001 | STEP 6, 1024px | Question Info와 listen control 겹침 제거; 1024~1279 회귀 검증 |

### P1

| ID | Screen | Outcome required |
| --- | --- | --- |
| OOM-UX-002 | Mobile nav | modal semantics, focus move/trap/restore, Escape, inert |
| OOM-UX-003 | Exam guide mobile | global controls와 annotation이 target을 가리지 않음 |
| OOM-UX-004 | STEP 1 | learner fit와 course 차이를 내부 용어 없이 판단 |
| OOM-UX-005 | STEP 3 | 실제 preset과 local simulation을 명확히 구분 |
| OOM-UX-006 | STEP 6 | hidden focusable Recorder control 제거 |
| OOM-UX-007 | STEP 6 | screen reader prompt 중복 제거 |
| OOM-UX-008 | STEP 4 mobile | 첫 행동과 3단계 학습 순서를 detail에서도 유지 |
| OOM-UX-009 | STEP 5 mobile | scenario CTA를 긴 reference 앞에서도 접근 가능 |
| OOM-UX-010 | Home | CTA label과 destination 일치 |

### P2

| ID | Screen | Outcome required |
| --- | --- | --- |
| OOM-UX-011 | Training Overview | locked CTA와 Card stack hierarchy 정리 |
| OOM-UX-012 | Training mobile header | 짧은 현재 STEP + visible next label |
| OOM-UX-013 | Global mobile | 실제 touch target 44px 확보 |
| OOM-UX-014 | Global | route-level chunk 분리 검토 및 측정 |
| OOM-UX-015 | Global copy | Korean-first glossary와 내부 ID 제거 |
| OOM-UX-016 | STEP 6 Review | AI fallback이 Phase A layout을 임의 확장하지 않음 |
| OOM-UX-017 | Home | crawler content를 보존하며 primary flow hierarchy 강화 |
| OOM-UX-024 | Navigation test | STEP 1→STEP 5 sidebar contract의 baseline regression 복구 |

### KEEP

| ID | Preserve |
| --- | --- |
| OOM-UX-018 | STEP 6 exam mental model와 state feedback |
| OOM-UX-019 | ① 녹음→② STT→③ AI→same-question retry loop |
| OOM-UX-020 | Course/Level persistence, route ownership, SelectionGuard |
| OOM-UX-021 | STEP 2의 mode/view 두 축과 full survey list |
| OOM-UX-022 | Semantic color, Button variants, focus/status language |
| OOM-UX-023 | Canonical story + variation + blueprint model |

## Recommended Implementation Order

1. **Laptop blocker pass:** OOM-UX-001만 먼저 수정하고 1024, 1100, 1280, 1440에서 STEP 6 Phase A/Review를 회귀 확인한다.
2. **Accessibility pass:** OOM-UX-002, 006, 007, 013을 함께 처리하고 keyboard, screen-reader tree, mobile drawer focus를 검증한다.
3. **Guide/mobile overlay pass:** OOM-UX-003과 OOM-UX-012를 처리해 fixed controls, sticky header, annotation offset의 안전 영역을 정리한다.
4. **Decision clarity pass:** OOM-UX-004, 005, 010, 015로 STEP 1/3과 entry copy의 기대를 맞춘다. 데이터 architecture는 유지한다.
5. **Learning-order pass:** OOM-UX-008, 009, 011, 017로 mobile에서 실제 훈련 CTA를 먼저 보이게 하고 reference 콘텐츠를 progressive disclosure한다.
6. **Feedback polish pass:** OOM-UX-016을 수정하고 STT configured/unconfigured/error, AI success/error/fallback, retry를 상태별로 회귀 확인한다.
7. **Performance pass:** OOM-UX-014를 route-level lazy loading 후보부터 측정·적용한다. 기능별 rewrite나 dependency 교체로 확장하지 않는다.
8. **Regression baseline pass:** OOM-UX-024의 sidebar navigation test를 실제 browser contract와 정렬해 full suite를 green으로 만든다.

각 pass에서는 `VISUALLY VERIFIED` 기준을 유지해야 한다. 최소 1440/1024/390, light/dark, keyboard focus, direct URL guard, recording lifecycle, same-question retry를 다시 확인한다.

## If only 5 things can be improved, improve these:

1. **1024px STEP 6 겹침을 제거한다** — 핵심 질문 듣기/답변 흐름을 막는 유일한 P0.
2. **모바일 메뉴와 STEP 6의 접근성 오류를 함께 고친다** — focus trap/restore, hidden Recorder control, duplicate prompt.
3. **STEP 1 선택을 learner-facing하게 만든다** — 기존 `recommendedFor`를 보여주고 내부 Course/anchor scene 문구를 숨긴다.
4. **STEP 4 detail에 3단계 학습 순서를 고정하고 mobile selector를 compact하게 만든다.**
5. **STEP 5 상단에서 현재 Course scenario로 바로 갈 수 있게 한다** — 긴 공식/표현은 reference로 유지한다.
