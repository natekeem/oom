# Implementation Plan

Landing은 한 번에 모든 shader polish까지 구현하지 않습니다.

각 단계가 green일 때 다음 단계로 진행합니다.

---

## Phase 0 — checkpoint

현재 STEP 4 안정 commit 이후 clean working tree에서 시작.

Codex:
- HEAD/origin check
- package versions
- React version
- current `/` route implementation
- static page generator
- AppShell routing

코드 변경 전에 기록.

---

## Phase 1 — Landing shell

목표:
기존 Home을 독립 landing route로 분리.

구현:
- LandingPage
- LandingNav
- semantic sections
- no AppShell/sidebar/footer
- CTA routing
- static content
- mobile base

아직 Three.js 없음.

검증:
- `/`
- other routes unchanged
- build/pages/docs

---

## Phase 2 — Motion foundation

추가:
- GSAP
- @gsap/react
- Lenis
- ScrollTrigger
- SplitText as needed
- capability/reduced motion
- cleanup

구현:
- typography
- section reveal
- pinned desktop timeline
- normal mobile flow

---

## Phase 3 — Signature 3D

추가:
- three
- R3F compatible with current React
- drei

구현:
- fixed Canvas
- MorphingSignalPoints
- Hero O
- O → waveform
- waveform → level bands
- level bands → signal

아직 full fluid simulation 금지.

---

## Phase 4 — Pointer interactive field

구현:
- lightweight pointer trail / shader
- particle attraction
- section cursor modes
- magnetic CTA

성능 측정.

---

## Phase 5 — Product choreography

- 6-step pulse
- STEP 4 pivot concept
- STEP 6 REC handoff
- exam presentation
- final O return

---

## Phase 6 — Competition polish

측정 후 선택:

- subtle postprocessing
- shader refinements
- better point easing
- noise/dither
- exact transition timing
- mobile static polish

---

## Phase 7 — About navigation

기존 `홈 / 전략 개요` 정보 성격을 `오픽온미란?`로 정리.

Landing 구현과 별도 route responsibility를 유지.

---

## Phase 8 — final QA

- all viewport
- light/dark for app routes
- landing visual system if landing is dark-only by design, verify OS/theme behavior
- reduced motion
- keyboard
- route cleanup
- performance
- static page generation
- docs

---

## Commit strategy

추천:

1. `feat: add standalone OOM landing shell`
2. `feat: add landing motion foundation`
3. `feat: add OOM voice universe scene`
4. `feat: choreograph landing product story`
5. `perf: tune landing motion fallbacks`

하나의 giant commit 피하기.
