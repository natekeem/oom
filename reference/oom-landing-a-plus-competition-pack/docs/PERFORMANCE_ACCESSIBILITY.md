# Performance & Accessibility Gates

## 왜 별도 gate가 필요한가

Competition landing은 강해야 하지만 OOM은 실제 사용자 제품입니다.

그래서 "고사양 데스크톱에서만 멋진 페이지"가 되면 실패입니다.

---

## Capability detection

참고 가능한 signal:

- `prefers-reduced-motion`
- pointer coarse/fine
- viewport
- `navigator.hardwareConcurrency`
- `navigator.deviceMemory` if available
- WebGL2 support
- DPR

정확한 GPU benchmark를 page load에서 무리하게 돌리지 않습니다.

---

## Tier example

### High

- desktop
- fine pointer
- no reduced motion
- WebGL supported
- reasonable concurrency
- DPR capped

Features:
- 3D point morph
- pointer field
- signal shader
- full scrub
- light bloom if measured safe

### Medium

- 3D point morph
- no expensive post FX
- lower points
- lightweight cursor glow
- shorter pins

### Low / touch

- no custom cursor
- minimal R3F or SVG
- no long pin
- no smoke simulation

### Reduced motion

- Lenis disabled
- static hero object
- normal document flow
- no scrub motion
- no animated text split

---

## Input safety

Custom pointer effect:

```css
pointer-events: none;
```

Native cursor를 완전히 숨기지 않습니다.

Magnetic button:
- visual transform only
- clickable hitbox / DOM layout는 움직이지 않음
- keyboard focus 상태에서는 transform 강제하지 않음

---

## Text

SplitText 사용 시:
- main semantic text 유지
- aria behavior 확인
- font load/re-split issue 확인
- character split은 signature lines에만 사용

---

## Mobile visual QA

최소:
- 390×844
- 430×932

확인:
- content order
- CTA
- top nav
- no sideways scroll
- canvas does not steal touch
- no blank space from disabled pin
- no fixed layer covering content

---

## Desktop QA

- 1024×900
- 1280×900
- 1440×1000
- 1920×1080 if available

특히 laptop GPU에서 particle count 측정.

---

## Runtime QA

DevTools:
- Performance recording during full scroll
- memory snapshot before/after route leave-return
- console warnings
- WebGL context loss
- resize
- tab background/foreground

---

## Route cleanup test

1. `/`
2. `/training/`
3. `/`
4. `/practice/`
5. `/`

반복 후:
- duplicated ScrollTrigger 없음
- duplicated ticker 없음
- pointer handlers 누적 없음
- Lenis instance 하나 이하
- Canvas 하나

---

## Acceptance

Landing enhancement가 실패해도:

- nav works
- CTA works
- copy visible
- page scroll works

하면 graceful degradation PASS.
