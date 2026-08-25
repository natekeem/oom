# OOM About — Interactive System Explorer
## Gemini Implementation Pack

이 패키지는 OOM의 `/about/` (`오픽온미란?`) 화면을 **한 화면 안에서 OOM 학습 시스템을 직접 눌러보며 이해하는 Interactive System Explorer**로 구현하기 위한 최종 핸드오프입니다.

이번 작업의 목적은 페이지를 다시 디자인하는 것이 아니라, 이미 선택된 최종 방향을 현재 OOM 코드에 안전하게 통합하는 것입니다.

---

## 최종 선택된 방향

Desktop 첫 화면에서 사용자가 다음을 직접 조작합니다.

### 왼쪽
- `COURSE — 무엇을 준비할지`
- `LEVEL — 얼마나 깊게 말할지`

### 오른쪽
선택에 따라 OOM Training System의 관련 부분이 강조됩니다.

`Course` 선택/클릭:
- 추천 서베이
- Story Pool
- STEP 4 질문 변형
- Training Context

`Level` 선택/클릭:
- STEP 3 난이도
- Answer Density
- STEP 6 Practice
- AI Coach / Retry

`전체 시스템 보기`:
- Course + Level 영향 경로를 동시에 보여줌

사용자가 실제 Course/Level 세부 선택을 바꾸면:
- 우측 `Training Context`
- 현재 Course 이름
- 현재 Level
- 답변 목표 시간
- 관련 highlight

가 함께 바뀝니다.

---

## 중요한 제품 원칙

이 화면은 **실제 훈련 설정 화면이 아닙니다.**

따라서 여기에서 Course / Level을 눌러도:

- `TrainingSelection` 변경 금지
- localStorage 저장 금지
- 실제 STEP 1 설정 변경 금지
- router state 변경 금지
- Recorder/STT/AI 호출 금지

모든 선택은 `/about/` 화면 안에서만 존재하는 **demo/local UI state**입니다.

CTA를 눌렀을 때만 실제 훈련 route로 이동합니다.

---

## Course가 앞으로 늘어나는 문제

현재 Course가 3개여도 UI를 `3개 고정`으로 만들지 않습니다.

### 결정

- Course 목록은 실제 Course registry에서 동적으로 생성
- 1~3개: 그대로 모두 노출
- 4개 이상: **Course 카드 내부에만 vertical scroll**
- page 자체는 desktop first viewport에서 계속 no-scroll 목표
- 대표 Course만 임의로 숨기지 않음
- 현재 선택 항목은 `scrollIntoView({ block: "nearest" })`
- metrics의 Course 숫자도 실제 registry length에서 계산

즉 Course가 4, 5, 8개로 늘어나도 About layout을 다시 설계할 필요가 없어야 합니다.

---

## 먼저 읽을 파일

1. `docs/PRODUCT_DECISIONS.md`
2. `docs/ABOUT_SYSTEM_EXPLORER_PRD.md`
3. `docs/INTERACTION_STATE_MACHINE.md`
4. `docs/FUTURE_COURSE_SCALING.md`
5. `docs/INTEGRATION_PLAN.md`
6. `docs/QA_ACCEPTANCE.md`
7. `docs/GEMINI_IMPLEMENTATION_PROMPT.md`
8. `reference/final-system-explorer.html`
9. `reference-react/`

---

## Agent 선택

Gemini 3.7 Flash / 3.1 Pro처럼 제품 판단을 임의로 확장할 가능성이 있는 agent를 사용할 예정이므로:

> 디자인을 새로 제안하지 말고 이 패키지의 결정을 그대로 구현하세요.

`docs/GEMINI_IMPLEMENTATION_PROMPT.md`를 최종 작업 지시서로 사용하면 됩니다.
