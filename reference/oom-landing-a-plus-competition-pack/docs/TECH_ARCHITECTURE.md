# Technical Architecture

## 1. 원칙

Landing은 기존 앱과 **route/layout level에서 분리**합니다.

```text
/
└── LandingPage
    ├── LandingNav
    ├── LandingMotionProvider
    ├── Fixed WebGL/Canvas layer
    └── semantic DOM sections

other routes
└── existing AppShell
```

기존 `AppShell` 안에 landing용 예외 CSS를 계속 추가하는 구조를 피합니다.

---

## 2. Suggested folders

```text
src/
  landing/
    LandingPage.tsx
    landing.css
    landingMotionStore.ts

    hooks/
      useLandingCapabilities.ts
      useLandingLenis.ts
      useLandingScrollTimeline.ts

    components/
      LandingNav.tsx
      PointerSignalTrail.tsx
      MagneticLink.tsx
      ReducedMotionFallback.tsx

    three/
      VoiceUniverseCanvas.tsx
      MorphingSignalPoints.tsx
      shaders/
        signal.vert.glsl
        signal.frag.glsl

    sections/
      HeroSection.tsx
      StorySection.tsx
      LevelsSection.tsx
      JourneySection.tsx
      PivotSection.tsx
      ExamSection.tsx
      EcosystemSection.tsx
      FinalSection.tsx
```

---

## 3. Package policy

Codex는 현재 `package.json`과 React version을 먼저 읽습니다.

React 18이면:

```bash
npm install gsap @gsap/react lenis three @react-three/fiber@8 @react-three/drei
```

React 19이면 R3F version policy를 다시 확인합니다.

Optional:

```bash
npm install @react-three/postprocessing
```

처음부터 설치하지 않음.

---

## 4. GSAP ownership

GSAP이 다음을 담당:

- ScrollTrigger
- pinned/scrub section
- SplitText
- Flip
- MorphSVG where actually used
- cross-section DOM choreography

Framer Motion / existing motion dependency는 기존 앱 microinteraction에 남겨둠.

Landing의 큰 scroll timeline에 두 animation engines를 섞지 않습니다.

---

## 5. Lenis

Lenis는 desktop/fine-pointer에서만 기본 활성화 권장.

GSAP ScrollTrigger와 ticker를 동기화.

Cleanup 필수.

Route unmount 뒤 ticker가 살아있으면 실패.

---

## 6. R3F

Canvas는 fixed decorative layer.

Semantic text를 Canvas에 넣지 않습니다.

권장:

```tsx
<Canvas
  dpr={[1, quality === "high" ? 1.75 : 1.25]}
  gl={{
    antialias: quality === "high",
    alpha: true,
    powerPreference: "high-performance",
  }}
>
```

Mobile/low에서는 DPR 1~1.25.

---

## 7. 3D morph strategy

실제 mesh topology를 매번 바꾸는 것보다 **point morph**를 추천.

N개의 point에 대해 미리 target layout 생성:

```text
circle
wave
threeBands
sixPulse
recordRing
```

useFrame에서 scroll progress로 target A/B를 선택하여 lerp.

장점:

- 동일 particle identity
- section continuity
- geometry dispose 문제 적음
- mobile에서 N을 쉽게 줄일 수 있음

---

## 8. Motion store

React state를 매 pointermove / every-frame에 set하지 않습니다.

고주파 데이터는 mutable external store/ref에 둡니다.

React render는 scene change나 capability change처럼 낮은 빈도에서만 발생.

R3F `useFrame()`은 mutable snapshot을 직접 읽음.

---

## 9. Pointer field

1차 구현은:

- 2D Canvas additive trail
또는
- lightweight fragment shader

로 충분.

Navier-Stokes full fluid simulation은 competition polish 단계에서 측정 후 판단.

필수 조건:
pointer field가 content interaction을 막지 않아야 함.

```css
pointer-events: none;
```

---

## 10. App routing

예상 패턴:

```tsx
const isLanding = pathname === "/";

return isLanding
  ? <LandingPage />
  : <AppShell>...</AppShell>;
```

실제 프로젝트 router structure에 맞게 구현.

Home route에서 기존 HomeView를 바로 지우기 전에 static generation / route metadata / SEO dependencies를 확인.

---

## 11. Static generation

기존 GitHub Pages generator가 `/`를 생성하는 방식을 반드시 확인.

`verify:pages` 유지.

Landing의 CSS/JS가 static build에서 정상 asset path를 사용해야 함.

---

## 12. Asset policy

- 외부 remote image dependency 최소화
- final hero object는 procedural 3D 권장
- logo SVG는 local
- EVA를 landing에서 쓴다면 기존 local asset 재사용
- font file을 repo에 무작정 추가하지 않음

---

## 13. Cleanup

다음 모두 route unmount 시 cleanup:

- ScrollTrigger
- GSAP contexts
- ticker callbacks
- Lenis
- pointer listeners
- ResizeObserver
- requestAnimationFrame
- WebGL resources if manual

---

## 14. Error boundary / fallback

WebGL initialization 실패 시:

- blank page 금지
- static SVG O + CSS signal background fallback

Canvas는 enhancement.

---

## 15. Accessibility

- Canvas: `aria-hidden`
- meaningful copy: DOM
- H1 exactly once
- focus visible
- magnetic effect가 keyboard position 변경하지 않음
- cursor visual이 native cursor를 숨기지 않는 방향 권장
- reduced motion full support

---

## 16. Performance budget

가이드 목표:

- WebGL DPR cap
- particle high 800~1500 정도에서 시작해 측정
- medium 400~800
- low/static 0~250
- postprocessing 최소
- texture 최소
- huge transparent PNG 금지

숫자는 법칙이 아니라 starting budget이며 실제 profiler로 측정.

---

## 17. Quality tier

```ts
high:
  desktop + fine pointer + adequate CPU/GPU hint
  full point morph
  pointer trail
  shader displacement

medium:
  reduced particles
  lighter pointer field
  no expensive post FX

low:
  static/slow SVG or points
  no cursor simulation

reduced:
  semantic static experience
```

`deviceMemory`만으로 결정하지 말고 복수 signal + safe fallback 사용.
