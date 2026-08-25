# Motion Choreography — OOM A++

이 문서는 개발자가 임의로 애니메이션을 추가하지 않고 **동일한 motion language**를 유지하기 위한 타임라인 명세입니다.

---

## Global motion state

전체 landing은 normalized progress를 사용합니다.

```ts
type LandingMotionSnapshot = {
  pageProgress: number;  // 0..1
  sceneProgress: number; // current pinned scene 0..1
  pointerX: number;      // -1..1
  pointerY: number;      // -1..1
  pointerSpeed: number;
  quality: "high" | "medium" | "low";
  reducedMotion: boolean;
};
```

DOM animation과 R3F scene이 서로 다른 source of truth를 만들지 않습니다.

---

## Scene 0 — Hero

### First frame

- dark background
- centered 3D O
- OPIc, ON ME.
- O는 breathing 수준의 미세 움직임
- light field는 매우 느리게 움직임

### Pointer

pointer가 O에서 멀면:
- calm

가까우면:
- point cloud가 cursor 방향으로 2~4% attraction
- shader displacement 증가
- subtle halo

빠르게 움직이면:
- signal wake 길이 증가

### Scroll 0 → 25%

- typography y/scale subtle drift
- O rotation / depth 증가
- O 중앙 hole이 약간 넓어짐
- O가 "말하기 시작"하는 듯 frequency ripple

### Exit

O가 화면 밖으로 날아가면 안 됨.

다음 scene waveform의 첫 shape와 위치가 연결되어야 함.

---

## Scene 1 — O → Waveform

### Transformation

권장 기술:
**point morph**

동일 point buffer를:

```text
circlePositions
→ wavePositions
```

로 lerp.

장점:
MorphSVG와 달리 3D point identity가 유지됨.

### Copy

```text
ONE STORY.
MANY QUESTIONS.
```

SplitText는 line/word 중심.

character-by-character 과도 사용 금지.

### Pointer

waveform의 가까운 점들만 pointer에 끌림.

pointer가 지나간 자리는 0.5~1.0초 내 복원.

---

## Scene 2 — Waveform → Branches → Levels

progress에 따라:

```text
single waveform
→ 3 parallel bands
```

세 band는 동일 story를 표현해야 함.

Foundation:
- short / low-density signal

Intermediate:
- medium density

Advanced:
- richer signal

주의:
단순히 세 줄의 색을 다르게 하는 게 아니라 density/amplitude 차이로 "같은 story의 성장"을 표현.

---

## Scene 3 — Three bands → Six-step timeline

3개 band가 가운데로 수렴.

line 하나로 합쳐짐.

scroll scrub:

```text
● ○ ○ ○ ○ ○
● ● ○ ○ ○ ○
● ● ● ○ ○ ○
...
● ● ● ● ● ●
```

각 checkpoint를 통과할 때:
- small pulse
- related label reveal
- background signal에 short echo

pin은 desktop에서만 충분히 길게.

mobile에서는 normal stacked flow.

---

## Scene 4 — Question Pivot

여기서 3D보다 DOM/SVG가 중심.

Visual:

```text
BASE QUESTION
      ↓
PIVOT QUESTION
```

same-story line에서 fact node들이:

```text
KEEP
CHANGE
REQUIRED
DROP
```

상태를 바꿈.

Flip plugin을 사용할 수 있는 좋은 구간.

중요:
실제 STEP 4의 전체 UI를 landing에 복제하지 않음.

학습 concept만 5~8초 안에 이해시킴.

---

## Scene 5 — STEP 6 transition

Six-step의 마지막 checkpoint가 커져 `REC` dot으로 변함.

그 dot이 Exam console의 recording indicator 자리로 이동.

가능하면 Flip/GSAP 또는 DOM overlay handoff 사용.

3D Canvas에서 DOM screen으로 자연스럽게 넘기기.

### Interaction

pointer over Play:
- subtle radial listening wave
- EVA outline pulse

실제 TTS/Recorder 작동 금지.

Landing은 demo presentation only.

---

## Scene 6 — Review signal

Exam console 아래에서:

```text
voice waveform
→ transcript line
→ KEEP / FIX / RETRY
```

으로 변환.

각 요소가 실제 STEP 6 학습 loop를 설명.

---

## Scene 7 — Final

모든 signal이 다시 하나의 O를 만듦.

즉 시작과 끝이 연결.

```text
MAKE IT YOURS.
```

CTA 진입 시 O는 안정된 형태.

훈련 결과 "noise → clear signal"이 완성된다는 의미.

---

## Cursor modes

하나의 cursor effect를 모든 section에 동일하게 사용하지 않습니다.

```ts
type CursorMode =
  | "fluid"
  | "attract"
  | "parallax"
  | "activate"
  | "tilt"
  | "magnetic"
  | "none";
```

Section 진입에 따라 mode 변경.

---

## Transition rule

각 animation은 다음 질문에 답해야 합니다.

> 이 움직임이 OOM의 어떤 학습 개념을 설명하는가?

답이 없으면 제거합니다.

---

## Timing

- 일반 reveal: 0.4~0.9s
- magnetic response: immediate / spring-like
- signal pulse: 0.25~0.5s
- section transition: scrub-based
- pointer recovery: 0.4~1.2s
- hero idle breathing: 4~8s

"모든 것 0.6초 ease-out" 같은 기계적 통일 금지.

---

## Easing

권장:

- power2 / power3
- expo는 hero signature에 제한
- elastic / bounce 남용 금지
- scrub scene은 easing 의미가 적으므로 progress mapping에 집중

---

## Reduced motion

`prefers-reduced-motion: reduce`:

- point morph off
- pinned scene off
- pointer field off
- text split animation off
- O는 static SVG 또는 static Canvas frame
- normal document flow

내용/CTA는 동일.
