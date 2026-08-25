# PRD — About Interactive System Explorer

## Goal

처음 방문한 사용자가 10~15초 안에:

1. Course가 `무엇을 준비할지` 정한다.
2. Level이 `얼마나 깊게 말할지` 정한다.
3. 두 선택이 STEP 2~6의 훈련 흐름으로 이어진다.
4. 마지막에는 AI feedback과 retry가 있다.

를 이해하게 합니다.

---

# Layout

## Desktop

```text
┌ Sidebar ┐ ┌─────────────────────────────────────────────┐
│         │ │ OOM · OPIC ON ME                           │
│         │ │ 오픽온미란?                                │
│         │ │ Course로 준비 범위를 정하고 ...            │
│         │ │                                             │
│         │ │ 3 COURSES | 3 LEVELS | 6 STEPS | AI COACH │
│         │ │                                             │
│         │ │ ┌──────────┐ ┌───────────────────────────┐ │
│         │ │ │ COURSE   │ │ TRAINING CONTEXT          │ │
│         │ │ │ choices  │ │                           │ │
│         │ │ │          │ │  Survey     Script       │ │
│         │ │ ├──────────┤ │     \        /            │ │
│         │ │ │ LEVEL    │ │       O                   │ │
│         │ │ │ choices  │ │     /        \            │ │
│         │ │ │          │ │ Difficulty   Practice     │ │
│         │ │ └──────────┘ │           AI Coach        │ │
│         │ │              └───────────────────────────┘ │
│         │ │                                             │
│         │ │ summary                         CTA         │
│         │ └─────────────────────────────────────────────┘
```

---

# Header

Eyebrow:
`OOM · OPIC ON ME`

H1:
`오픽온미란?`

Support:
`Course로 준비 범위를 정하고, Level로 답변 밀도를 맞춘 뒤, 6단계 훈련과 AI 재시도로 연결합니다.`

Desktop 1280+:
가급적 1 line.

Mobile:
natural wrap.

---

# Metrics

Dynamic:

- `${courseCount} COURSES`
- `3 LEVELS`
- `6 STEPS`
- `AI COACH`

Metrics는 주요 interactive element가 아닙니다.

hover animation 필수 아님.

---

# Left — Course Input

Label:
`COURSE`

Question:
`무엇을 준비할지`

Helper:
`반복해서 쓸 이야기의 맥락과 소재를 정합니다.`

Course options:
실제 registry 순서대로.

Option representation:
- 번호
- course display name
- optional compact Korean/category helper if actual metadata exists

### Do not invent metadata

현재 registry에 helper/subtitle이 없다면:
Course name만 보여도 됩니다.

임의로 Course 설명을 만들어 데이터에 저장하지 않습니다.

---

# Left — Level Input

Label:
`LEVEL`

Question:
`얼마나 깊게 말할지`

Helper:
`같은 장면의 길이와 구체성을 목표에 맞게 조절합니다.`

Options:
- 3구간 · Foundation
- 2구간 · Intermediate
- 1구간 · Advanced

시간:
반드시 현재 level source-of-truth에서 가져옵니다.

기존 training preset을 별도로 복제하지 않습니다.

---

# Right — Training Context

항상 선택된 Course + Level 표시.

예:

`Everyday & Getaway × 2구간`

`Intermediate · 45–65초`

이 화면은 demo이므로 초기값은 다음 중 하나:

### Preferred
현재 registry의 첫 Course + Intermediate

또는

### Better if existing product already has a default demo context
현재 코드에 이미 명시적인 demo/default가 있으면 그것 사용.

사용자의 실제 TrainingSelection을 읽어 초기값으로 사용할 수는 있지만,
About에서 바꾼 값을 저장하면 안 됩니다.

단순성과 privacy/side-effect 측면에서는 local default 권장.

---

# Right — Modules

## Course-related

### STEP 2
추천 서베이

`Course가 준비할 범위를 정합니다.`

### Story Pool
핵심 장면

`같은 story를 여러 질문에 재사용합니다.`

### STEP 4
스크립트 · 질문 변형

`Course의 사실을 질문 방향에 맞게 바꿉니다.`

---

## Level-related

### STEP 3
난이도

`Level이 질문 복잡도를 조절합니다.`

### Answer Density
길이 · 구체성

동적으로:
`${levelLabel} · ${targetTime}`

### STEP 6
실전 연습

`Listen → Speak → Review → Retry`

---

## Both / merged

STEP 4는 Course와 Level 모두 영향을 받는 영역으로 표현해도 좋습니다.

예:
`Course의 사실을 Level 밀도로 말합니다.`

---

# Bottom System

## Six Step Rail

실제 STEP labels를 현재 source에서 가져올 수 있으면 재사용.

그렇지 않으면 existing app user-facing labels와 정확히 일치:

1. 목표·코스
2. 추천 서베이
3. 난이도
4. 스크립트
5. 롤플레이
6. 실전

Course focus:
2 / 4 / 6 정도 강조 가능.

Level focus:
3 / 4 / 6 강조.

Full:
1~6 모두 강조.

이 highlight는 설명용이며 공식 dependency graph를 주장하는 것은 아닙니다.

---

# AI Coach

Label:
`AI COACH`

Cells:
- KEEP
- FIX
- RETRY

Helper:
`이번 답변에서 고칠 것 하나를 다음 시도로 넘깁니다.`

Level focus/full system에서 강조.

---

# Current flow summary

동적 한 줄.

예:

`Everyday & Getaway의 story를 준비하고 → 2구간 밀도로 바꾸어 → 말하고 AI 피드백으로 다시 시도합니다.`

긴 paragraph 금지.

---

# CTA

Primary:
`실전 훈련 둘러보기`

Target:
기존 `/training/`

Secondary:
`수험 가이드`

Target:
기존 실제 guide route.

---

# Hover vs click

Primary interaction:
CLICK / keyboard selection.

Hover:
보조 preview만.

선택 state가 hover out 때문에 바뀌면 안 됩니다.

즉:

- hover = subtle preview
- click = persistent selected state

Mobile:
tap = selected state.

---

# Accessibility

Course/Level option이 실제 선택 기능이므로:
- `<button type="button">`
- `aria-pressed` 또는 proper radiogroup pattern 중 하나

추천:
`role="radiogroup"` + button `aria-checked`보다
native radio styling이 복잡하지 않다면 actual `<input type="radio">` 사용도 가능.

다만 현재 visual component와 test conventions를 우선.

`전체 시스템 보기`는 실제 button.

Right system modules는 interactive action이 아니면 focusable하게 만들지 않습니다.

Hover highlight 때문에 fake button semantics를 붙이지 않습니다.
