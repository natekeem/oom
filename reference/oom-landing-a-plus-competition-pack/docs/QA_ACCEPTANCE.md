# QA / Acceptance Checklist

## Routing
- [ ] `/`는 AppShell 미사용
- [ ] landing Sidebar 없음
- [ ] landing app footer 없음
- [ ] `/training/*` AppShell 유지
- [ ] `/practice/` 유지
- [ ] direct route 새로고침 정상
- [ ] static Pages 생성 정상

## Hero
- [ ] H1 DOM에 존재
- [ ] O signature visible
- [ ] pointer effect content를 가리지 않음
- [ ] primary CTA `/training/`
- [ ] guide CTA correct route
- [ ] no STEP 1/script legacy CTA

## Motion
- [ ] O → waveform continuity
- [ ] waveform → 3 bands
- [ ] 3 bands → 6-step signal
- [ ] 6-step → REC
- [ ] final O return
- [ ] animation reason tied to product concept

## Pointer
- [ ] high desktop reactive
- [ ] no touch cursor simulation
- [ ] no native pointer suppression
- [ ] `pointer-events:none` decorative layer
- [ ] no click interception

## Mobile
- [ ] 390
- [ ] 430
- [ ] no horizontal overflow
- [ ] normal content order
- [ ] CTA visible
- [ ] no pin blank gaps
- [ ] no WebGL-induced scroll lock

## Reduced motion
- [ ] no Lenis
- [ ] no long scrub
- [ ] no pointer field
- [ ] static hero fallback
- [ ] full copy/CTA preserved

## Performance
- [ ] DPR capped
- [ ] no huge texture
- [ ] particle count tiered
- [ ] route leave cleans GSAP
- [ ] route leave cleans Lenis
- [ ] route leave cleans listeners
- [ ] return `/` does not duplicate Canvas
- [ ] no growing memory after 3 route cycles

## Accessibility
- [ ] one H1
- [ ] logical headings
- [ ] visible focus
- [ ] keyboard nav
- [ ] Canvas aria-hidden
- [ ] contrast
- [ ] motion reduction
- [ ] CTA labels semantic

## Regression
- [ ] STEP 4 untouched functionally
- [ ] STEP 6 untouched functionally
- [ ] training selection untouched
- [ ] survey untouched
- [ ] roleplay untouched
- [ ] AI/STT untouched

## Commands
- [ ] npm run lint
- [ ] npm run test
- [ ] npm run build
- [ ] npm run verify:pages
- [ ] npm run docs:generate
- [ ] npm run docs:check
- [ ] git diff --check
