# PRD — OOM Brand Landing A++ Competition Edition

## 1. 목적

현재 Home에는 OOM이 단일 script set 중심이던 과거 구조의 흔적이 남아 있습니다.

현재 제품은 이미:

- Course × Level
- 추천 서베이
- 난이도 preset
- canonical story
- 질문별 variation
- 답변 설계
- roleplay
- exam-style practice
- STT
- AI feedback
- same-question retry

를 가진 학습 시스템입니다.

따라서 Home의 목적도 "어디부터 누를지 추천"이 아니라:

> **OOM이 어떤 학습 방식인지 한 번에 이해시키고, 제품 경험으로 진입시키는 것**

으로 변경합니다.

---

## 2. Landing route 역할

### `/`

Brand / product landing.

- 독립형 layout
- Sidebar 없음
- app sticky header 없음
- app footer 없음
- full bleed
- cinematic scroll story
- motion-heavy
- product overview
- primary conversion

### 앱 route

기존 AppShell 유지.

예:

- `/training/`
- `/training/setup/`
- `/training/scripts/...`
- `/roleplay/`
- `/practice/`
- `/exam-guide/...`
- `/magazine/...`

---

## 3. Navigation

Landing top nav는 최소화합니다.

추천:

- OOM logo
- `오픽온미란?`
- `훈련`
- `수험 가이드`
- `Magazine`
- optional compact CTA `훈련 시작`

Desktop에서는 transparent / blend nav.

Mobile에서는 가벼운 overlay menu만 허용.

기존 ExpandableSidebar를 landing에 재사용하지 않습니다.

---

## 4. Hero

### Main copy

```text
OPIc,
ON ME.
```

### Support

```text
많이 외우는 대신,
내 이야기를 여러 질문에 맞게 바꾸어 말하는 훈련.
```

또는 final copy review에서 다음 계열을 비교할 수 있음:

```text
남의 모범답안이 아니라,
내 이야기로 말합니다.
```

### CTA

Primary:
`실전 훈련 둘러보기`

Secondary:
`OPIc 수험 가이드`

Magazine은 Hero primary CTA로 올리지 않습니다.

---

## 5. Section sequence

### S0 Hero — "Voice begins"

사용자의 pointer에 반응하는 3D `O`.

목표:
브랜드 첫인상.

### S1 One Story → Many Questions

카피:

```text
ONE STORY.
MANY QUESTIONS.
```

OOM의 핵심:
질문마다 새 script를 만들지 않음.

Visual:
O가 풀려 waveform이 되고 여러 방향으로 branch.

### S2 Same Story → Three Levels

```text
YOUR STORY
GROWS WITH YOU.
```

Visual:
waveform이 3개 band로 분리.

Foundation / Intermediate / Advanced.

### S3 Six-step training

```text
SIX STEPS.
ONE VOICE.
```

Visual:
3개 band가 하나의 signal line으로 다시 합쳐지고 6개 checkpoint를 통과.

### S4 STEP 4 — Pivot

목표:
OOM 차별성 시각화.

`기본 질문 → 변형 질문`

그리고 same story의 fact가 KEEP / CHANGE / REQUIRED / DROP 되는 것을 짧게 보여줌.

실제 앱 screenshot/card를 무작위 floating dashboard처럼 띄우지 말고 signal visual 안에서 등장시킴.

### S5 STEP 6 — Speak / Review / Retry

Visual transition:

6번째 checkpoint
→ record dot
→ exam console

Copy:

```text
LISTEN.
SPEAK.
REVIEW.
RETRY.
```

실제 EVA/Exam mental model을 간소화한 DOM mock 또는 실제 공용 presentation component를 사용.

Landing에서 Recorder를 작동시키지 않음.

### S6 OOM ecosystem

세 entry를 보여줄 수 있음:

- 수험 가이드
- 실전 훈련
- Magazine

여기는 "카드 3개 SaaS grid"가 되지 않도록 editorial links / giant text treatment 추천.

### S7 Final CTA

```text
MAKE IT YOURS.
```

Primary:
`실전 훈련 둘러보기`

Secondary:
`수험 가이드 보기`

---

## 6. Visual identity

### Core keywords

- Voice
- Signal
- Frequency
- Wave
- Breath
- Rhythm
- Recording
- Speaking
- Confidence

### Palette

현재 OOM semantic colors를 app에서는 유지.

Landing은 dark cinematic base.

추천:
- near black
- white / cool gray typography
- limited electric periwinkle
- limited mint signal accent

주의:
색 자체보다 light / depth / signal로 고급감을 만듭니다.

### Texture

- subtle film/noise
- fine line frequency field
- volumetric-looking gradient without heavy blur spam
- point cloud
- sparse bloom

---

## 7. Motion principles

### One continuous object

Hero의 `O`가 site signature object입니다.

단순히 section마다 사라지고 새 object가 생기면 실패.

scroll progress에 따라:

1. O
2. unstable O / voice vibration
3. waveform
4. branching waveform
5. 3 level bands
6. single signal line
7. 6 pulses
8. REC ring
9. exam UI signal

로 연결됩니다.

### Pointer

Pointer motion 역시 section별 의미를 갖습니다.

- Hero: fluid signal wake
- Story: waveform attraction
- Level: depth parallax
- Journey: checkpoint activation
- Exam: subtle console tilt / listening pulse
- CTA: magnetic pull

---

## 8. Desktop / Mobile

### Desktop

고사양 desktop에서 full signature experience.

### Mid desktop/laptop

3D 유지하되 particle count / DPR 낮춤.

### Mobile

- fluid cursor off
- heavy shader off
- touch parallax 최소화
- signature object는 lightweight R3F 또는 static SVG/canvas fallback
- pin duration 단축
- content ordering은 normal scroll

### Reduced motion

- Lenis off
- scrub/pin 최소화 또는 off
- WebGL off 또는 static first frame
- SplitText character motion off
- semantics와 CTA는 그대로 유지

---

## 9. SEO / static constraints

GitHub Pages static architecture를 유지합니다.

Landing의 중요 copy는 Canvas 안이 아니라 **HTML DOM에 존재**해야 합니다.

Canvas/WebGL은 decoration / enhancement입니다.

H1은 한 개.

Meaningful sections는 semantic headings 사용.

---

## 10. Success criteria

### Product

처음 보는 사용자가 Home만 보고 다음을 설명할 수 있어야 함.

- OOM은 OPIc 준비 서비스다.
- script를 많이 외우는 것보다 story를 재사용한다.
- Course와 Level을 선택한다.
- 질문 variation을 훈련한다.
- 실제 말하기/복기/재시도를 한다.

### Visual

심사위원에게 5~10초 안에 signature interaction을 보여줌.

### Performance

Hero가 시각적으로 화려하더라도 기본 navigation/CTA가 빠르게 usable해야 함.

### Accessibility

`prefers-reduced-motion`에서 제품 설명이 손실되지 않음.
