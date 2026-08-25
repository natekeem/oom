# OOM Landing A++ — Competition Edition

이 패키지는 OOM의 `/` 홈을 **기존 앱 화면이 아닌 독립형 브랜드 랜딩 페이지**로 재설계하기 위한 구현 핸드오프입니다.

현재 선택된 방향은:

> **A · Signal → Speech**를 기반으로  
> **Kinetic Typography + 3D Voice Object + Pointer-reactive Signal Field**를 결합한  
> **A++ Competition Edition**

입니다.

핵심은 "효과를 많이 붙이는 것"이 아니라 **하나의 Voice / Signal 세계관이 섹션을 통과하면서 계속 변형되는 것**입니다.

---

## 먼저 볼 것

1. `docs/PRD.md`
2. `docs/MOTION_CHOREOGRAPHY.md`
3. `docs/TECH_ARCHITECTURE.md`
4. `docs/CODEX_IMPLEMENTATION_PROMPT.md`
5. `reference/a-plus-prototype.html`
6. `reference-react/`

---

## 제품 결정 — 확정

- `/`는 기존 AppShell을 사용하지 않는 독립형 landing route.
- 왼쪽 Sidebar 없음.
- Training sticky header 없음.
- 기존 앱 footer 없음.
- landing 전용 최소 nav만 사용.
- Hero CTA는 기본적으로 2개:
  - `실전 훈련 둘러보기`
  - `OPIc 수험 가이드`
- `추천 시작점`, `STEP 1 시작`, `스크립트 보기`는 Home hero에서 제거.
- Magazine은 nav 또는 후반 editorial section에서 노출.
- 앱 내부의 기존 `홈 / 전략 개요` 성격 페이지는 별도 `오픽온미란?` 정보 페이지로 정리.
- STEP 4 / STEP 6 등 이미 안정화한 기능을 landing 작업 때문에 재설계하지 않음.

---

## Brand motion thesis

모션의 모든 요소는 OOM 학습 모델을 설명해야 합니다.

| Visual | Product meaning |
|---|---|
| O | OOM / On Me / 나의 이야기 |
| Wave | Voice / Speaking |
| Branch | 같은 story → 여러 질문 |
| 3 bands | 같은 story → 3개 Level |
| 6 pulses | STEP 1 → STEP 6 |
| Record dot | 실전 답변 |
| Noise → clean signal | 반복 훈련으로 말하기가 정리됨 |
| Transcript line | 복기 / STT |
| Returning pulse | 같은 질문 재도전 |

---

## 권장 기술

기존 프로젝트의 실제 package versions를 Codex가 먼저 확인한 뒤 호환 버전을 설치합니다.

필수 후보:

```bash
npm install gsap @gsap/react lenis three @react-three/fiber@8 @react-three/drei
```

`@react-three/fiber@8`은 **프로젝트가 React 18일 때만** 사용합니다.

선택:

```bash
npm install @react-three/postprocessing
```

Postprocessing은 실제로 bloom 등의 효과가 디자인에 필요한 경우에만 추가합니다.

GSAP 3.13+에서는 SplitText, MorphSVG, Flip 등의 플러그인을 npm에서 사용할 수 있으므로 별도 legacy private registry를 사용하지 않습니다.

---

## 구현 우선순위

**P0**
- route/AppShell 분리
- static landing semantic HTML
- mobile/reduced-motion fallback
- Hero
- continuous signature object
- core CTA routing

**P1**
- scroll choreography
- 3D O → waveform → level bands → 6-step pulse → REC transition
- pointer reactive field
- kinetic typography
- OOM product section

**P2**
- fine-grained magnetic interaction
- subtle audio-reactive illusion
- advanced shader polish
- optional postprocessing

---

## 절대 금지

- generic AI purple gradient
- glass card spam
- 의미 없는 particle
- 섹션마다 다른 animation language
- 모든 텍스트 fade-up
- spinning cube / random 3D asset
- UI를 가리는 cursor
- 강한 scroll hijacking
- mobile에 desktop WebGL 그대로 강제
- reduced-motion 무시
- Home 때문에 STEP 1~6 app architecture 변경

---

## 완료 기준

이 랜딩은 첫 10초 안에 다음 세 문장을 시각적으로 전달해야 합니다.

1. **내 이야기로 말한다.**
2. **하나의 이야기를 여러 질문과 레벨에 재사용한다.**
3. **듣고 → 말하고 → 복기하고 → 다시 말한다.**

그리고 심사/포트폴리오 관점에서는:

> "예쁜 랜딩"이 아니라  
> **제품 구조를 motion design으로 설명한 landing**

으로 보여야 합니다.
