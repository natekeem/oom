# CODEX IMPLEMENTATION PROMPT — OOM Landing A++ Competition Edition

현재 최신 `main`의 clean checkpoint에서 작업한다.

이 작업은 OOM의 `/` Home을 **독립형 high-end brand landing**으로 교체하는 implementation project다.

먼저 이 패키지의 문서를 읽는다.

순서:

1. `README_START_HERE.md`
2. `docs/PRD.md`
3. `docs/MOTION_CHOREOGRAPHY.md`
4. `docs/TECH_ARCHITECTURE.md`
5. `docs/PERFORMANCE_ACCESSIBILITY.md`
6. `docs/QA_ACCEPTANCE.md`
7. `reference-react/`
8. `reference/a-plus-prototype.html`

샘플 코드는 architecture/reference이며 현재 repo structure에 맞게 통합한다.
샘플을 무조건 copy-paste하지 않는다.

==================================================
A. 핵심 제품 결정 — 변경 금지
==================================================

Landing `/`:

- existing AppShell을 사용하지 않는다.
- Sidebar 없음.
- Training sticky header 없음.
- 기존 app footer 없음.
- full-bleed landing.
- landing-only minimal navigation.
- animated / interactive.
- static semantic DOM content는 유지.

다른 app routes:

- 기존 AppShell
- Sidebar
- routing
- Training
- STEP 1~6

모두 유지.

==================================================
B. Landing의 역할
==================================================

기존 Home의 과거 단일 script/level 시대 잔재를 제거한다.

Home은 현재 OOM 전체를 설명해야 한다.

Hero에서 제거:
- 추천 시작점
- STEP 1 시작
- 스크립트 보기

Hero CTA:

Primary:
`실전 훈련 둘러보기`

Secondary:
`OPIc 수험 가이드`

Magazine은 top nav 또는 후반 editorial entry.

==================================================
C. Visual direction
==================================================

선택된 방향:

A Signal → Speech
+
Kinetic Typography
+
3D Voice Object
+
Pointer-reactive Signal Field

Working name:

`A++ Competition Edition`

generic AI SaaS처럼 만들지 않는다.

Visual vocabulary:

- O
- voice
- waveform
- frequency
- signal
- recording
- rhythm
- noise → clean
- transcript

==================================================
D. Signature concept
==================================================

Hero의 3D O를 고정 decorative object로 만들면 실패다.

O는 scroll에 따라 계속 변한다.

필수 conceptual sequence:

O
→ vibrating O
→ waveform
→ question branches
→ 3 Level bands
→ single signal
→ 6 STEP pulses
→ REC ring
→ STEP 6 exam signal
→ final O

모든 shape를 매번 새로 spawn하는 방식보다
continuous identity를 우선한다.

reference implementation의 point morph 방식을 우선 검토.

==================================================
E. Technology
==================================================

먼저 실제:

- package.json
- React version
- Vite
- Tailwind
- existing motion package
- Router
- static page generator

확인.

React 18인 경우 기본 후보:

```bash
npm install gsap @gsap/react lenis three @react-three/fiber@8 @react-three/drei
```

React version이 다르면 compatible R3F major를 공식 requirement에 맞춘다.

`@react-three/postprocessing`은 처음에 설치하지 않는다.

GSAP 3.13+ 사용.

필요 plugin:
- ScrollTrigger
- SplitText
- Flip
- MorphSVG only if actual SVG morph is used

Landing의 large scroll choreography는 GSAP이 소유한다.

기존 Framer Motion이 있더라도
동일 요소의 같은 transform을 GSAP과 동시에 제어하지 않는다.

==================================================
F. Architecture
==================================================

권장 concept:

```text
/
LandingPage
  LandingNav
  LandingMotionProvider/store
  Fixed VoiceUniverseCanvas
  semantic DOM sections
```

other routes:
existing AppShell.

high-frequency scroll/pointer value를 React state로 every-frame set하지 않는다.

mutable store/ref를 사용.

R3F `useFrame()`에서 snapshot 읽기.

==================================================
G. Phase implementation
==================================================

한 번에 giant rewrite 금지.

PHASE 1:
landing shell + route split

PHASE 2:
GSAP/Lenis + reduced motion

PHASE 3:
R3F signature O + point morph

PHASE 4:
pointer field

PHASE 5:
product section choreography

PHASE 6:
competition polish

각 phase 후 build/test.

==================================================
H. Section content
==================================================

S0 Hero

`OPIc, ON ME.`

지원 copy:
내 이야기를 여러 질문에 맞게 바꾸어 말하는 훈련.

S1

`ONE STORY. MANY QUESTIONS.`

같은 story에서 질문 방향을 바꾸는 OOM 철학.

S2

`YOUR STORY GROWS WITH YOU.`

3구간 / 2구간 / 1구간.

S3

`SIX STEPS. ONE VOICE.`

STEP 1~6.

S4

질문 pivot concept.

Base Question
→ Pivot Question

KEEP / CHANGE / REQUIRED / DROP.

S5

`LISTEN. SPEAK. REVIEW. RETRY.`

STEP 6 mental model.

S6

Guide / Training / Magazine entry.

S7

`MAKE IT YOURS.`

final CTA.

==================================================
I. Pointer modes
==================================================

desktop only.

Hero:
fluid signal wake.

Story:
waveform attraction.

Level:
depth parallax.

Journey:
checkpoint activation.

Exam:
subtle console tilt/listening response.

CTA:
magnetic.

모든 section에 같은 smoke cursor를 깔지 않는다.

native cursor를 완전히 제거하지 않는다.

==================================================
J. 3D implementation target
==================================================

샘플 `MorphingSignalPoints.tsx` 패턴을 참고.

point target sets:

- circle
- waveform
- threeBands
- sixPulse
- recordRing

progress interval에 따라 lerp.

pointer influence:
local displacement only.

quality tier에 따라 particle count 변경.

Canvas는 `aria-hidden`.

Semantic content는 DOM.

==================================================
K. No clone
==================================================

참고 URL:

`https://agency-website-v2.vercel.app/`

참고:
- pointer-reactive atmospheric background
- interaction density
- dark cinematic tone

복제 금지:
- exact layout
- exact colors
- exact smoke implementation
- exact assets

OOM의 Voice / Signal narrative로 재설계한다.

==================================================
L. Performance
==================================================

필수 capability gate.

High:
full 3D / signal field.

Medium:
reduced points / no expensive post FX.

Low/mobile:
light object or static SVG/canvas.

Reduced motion:
no Lenis
no scrub/pin
no pointer field
static semantic landing.

DPR cap.

WebGL failure fallback.

==================================================
M. Do not touch
==================================================

Landing 때문에 다음을 재설계하지 않는다.

- STEP 1
- STEP 2
- STEP 3
- STEP 4
- STEP 5
- STEP 6
- Survey data
- Course registry
- TrainingSelection
- Recorder
- STT
- AI feedback
- roleplay
- canonical scripts
- variation
- blueprint

Landing에서 STEP 6 UI를 보여줄 때는 presentation/demo만 사용한다.
실제 Recorder/STT를 또 만들지 않는다.

==================================================
N. About / strategy navigation
==================================================

현재 app 내부의 `홈 / 전략 개요` 성격은
learner-facing `오픽온미란?`로 바꾸는 방향을 적용한다.

그러나 `/` landing과 같은 역할로 섞지 않는다.

Landing:
brand/product experience.

About:
OOM 학습 철학을 읽는 정보 page.

실제 현재 route 구조를 확인해 최소 변경한다.

==================================================
O. SEO
==================================================

Canvas/WebGL에 중요한 text를 넣지 않는다.

DOM:
- H1
- section H2
- body copy
- CTA

유지.

기존 static SEO를 깨지 않는다.

==================================================
P. Visual QA
==================================================

필수:

390×844
430×932
1024×900
1280×900
1440×1000
가능하면 1920×1080

desktop fine-pointer interaction 실제 확인.

mobile touch 실제 flow 확인.

prefers-reduced-motion 확인.

route leave/return 3회 확인.

==================================================
Q. Runtime QA
==================================================

확인:

- duplicated ScrollTriggers 0
- duplicated Lenis ticker 0
- duplicated pointer event 0
- Canvas duplicate 0
- console error 0
- horizontal overflow 0
- WebGL initialization failure fallback
- resize
- tab background/return

==================================================
R. Validation
==================================================

반드시:

npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
git diff --check

실행.

==================================================
S. Completion report
==================================================

다음 형식:

1. Baseline HEAD / origin
2. React/package inspection
3. Added dependencies
4. Route/AppShell split
5. Landing information architecture
6. Signature 3D implementation
7. O → waveform → Level → STEP → REC morph
8. Pointer interaction modes
9. GSAP/Lenis ownership
10. Performance quality tiers
11. Mobile fallback
12. Reduced-motion fallback
13. About navigation changes
14. Tests
15. Visual QA per viewport
16. Performance QA
17. Full validation
18. Remaining issues
19. intentionally not changed

중요:

새 디자인 방향을 임의로 추가하지 않는다.

이 문서와 PRD/Motion spec이 제품 결정의 source of truth다.
