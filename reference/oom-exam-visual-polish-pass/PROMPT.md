# OOM Exam Experience Visual Polish Pass

현재 OOM의 Exam Experience / STEP 6 / STT architecture는 완료된 상태다.

이번 작업은 새로운 기능 개발이나 architecture 변경이 아니라
실제 화면을 사용해 본 뒤 발견한 UX polish 문제를 정리하는
"Exam Experience Visual Polish Pass"다.

현재 안정화된 다음 기능을 절대 회귀시키지 마라.

- Course × Level
- STEP 1~6 architecture
- STEP 2 추천 서베이 익히기
- ExamScreenShell shared architecture
- /exam-guide/screen/
- Recorder discardOnStopRef
- RecorderHandle.start(): Promise<boolean>
- microphone failure fallback
- AbortController + attemptIdRef STT guard
- STT manual/auto transcription
- AI feedback
- same-question retry
- 0/2 question listening
- question text accessibility
- static GitHub Pages architecture

대규모 redesign을 하지 말고 아래 사항만 실제 화면 기준으로 정교하게 수정한다.

---

## 1. STEP 6 "① 내 녹음" 카드의 과도한 빈 공간 제거

현재 PracticeReviewPanel의 desktop grid에서
STT 카드가 길어지면 "내 녹음" 카드도 같은 row height로 stretch되어
오디오 아래에 큰 빈 공간이 생긴다.

현재 구조를 확인하고 이 문제를 실제 layout 레벨에서 해결한다.

권장:

```tsx
<div className="grid gap-4 xl:grid-cols-[0.85fr_1.25fr_1.1fr] xl:items-start">
```

즉 row child가 무조건 같은 높이로 늘어나지 않도록 한다.

"내 녹음" Card 역시 단순히:

```text
flex flex-col justify-between
```

으로 STT 카드 높이에 맞추지 않는다.

목표 화면:

```text
① 내 녹음                 48초

실제로 말한 답변을 먼저 들어보세요.

        [ Audio Player ]
        ← 적당한 중앙 배치 →

─────────────────────────

* 녹음은 서버로 전송되지 않고
  브라우저 메모리에만 유지됩니다.
```

audio control은 카드의 핵심 콘텐츠이므로
가로/세로상 어색하게 위에 붙지 않도록 적절히 가운데 배치한다.

privacy 문구:

```text
* 녹음은 서버로 전송되지 않고 브라우저 메모리에만 유지됩니다.
```

는 카드 footer처럼 아래로 분리한다.

예:

```tsx
<div className="mt-auto border-t ... pt-3">
  ...
</div>
```

다만 artificial하게 거대한 고정 height를 만들지 마라.

카드는 콘텐츠에 맞는 자연스러운 높이를 사용한다.

---

## 2. PracticeReviewPanel Phase B의 left accent border 제거

현재:

```tsx
border-l-4 border-indigo-500 pl-3.5
```

스타일이 다시 들어가 있다.

OOM의 다른 화면에서 이미 제거했던 장식이고
현재 복기 화면에서도 생뚱맞게 보이므로 제거한다.

대신:

```text
Phase B · 답변 복기
방금 말한 내용을 듣고, 받아쓰고, 한 가지만 고쳐보세요.
```

일반 heading hierarchy만 사용한다.

새로운 다른 accent border로 교체하지 않는다.

---

## 3. AI 카드 copy 미세 조정

현재:

```text
Transcript를 확인한 다음 목표 등급 기준 피드백을 요청하세요.
```

가 있다면:

```text
Transcript를 확인한 다음 선택한 목표 구간에 맞춰 피드백을 받아보세요.
```

또는 동등한 표현으로 수정한다.

제품의 기존 원칙인:

```text
공식 등급 예측/보장 X
목표 구간 적합도 중심
```

과 일치시킨다.

---

## 4. 시험 화면 · 조작법의 numbered callout을 실제 interactive하게 만들기

현재 guide copy에는:

```text
①~⑥ 번호 배지를 클릭하거나 아래 설명 카드를 확인하세요.
```

라는 의미의 안내가 있지만 실제 번호 badge에는 click behavior가 없다.

문구만 삭제해서 해결하지 말고,
이번에는 실제 clickable callout interaction을 구현한다.

Guide page state 예:

```ts
const [activeCallout, setActiveCallout] = useState<number>(1);
```

ExamScreenShell demo mode에 최소한:

```ts
activeAnnotation?: number;
onAnnotationSelect?: (id: number) => void;
```

또는 동등한 prop을 추가한다.

interactive STEP 6에서는 이 기능을 사용하지 않는다.

demo/annotated mode에서만:

```text
①
②
③
④
⑤
⑥
```

badge를 button처럼 클릭 가능하게 만든다.

click:

```text
number badge
→ activeCallout 변경
→ 대응하는 설명 card 강조
```

설명 카드 click:

```text
description card
→ 동일 activeCallout 변경
→ 대응하는 screen badge 강조
```

필요하면 desktop에서는 설명 카드로 smooth scroll/focus해도 된다.

과도한 animation은 사용하지 않는다.

활성 상태:

```text
ring / border / subtle indigo background
```

정도의 restrained highlight만 사용한다.

접근성:

```tsx
<button
  aria-pressed={activeCallout === id}
  aria-label={`${id}번 영역 설명 보기`}
>
```

또는 동등한 semantics를 적용한다.

---

## 5. Guide 설명 문구도 interaction과 일치시킬 것

interactive callout 구현 후 안내를 자연스럽게 수정한다.

예:

```text
①~⑥ 번호를 선택하면 해당 영역의 설명을 바로 확인할 수 있습니다.
아래 설명 카드를 눌러도 같은 영역이 강조됩니다.
```

click 동작이 실제 존재해야 한다.

---

## 6. Callout ③ 위치 수정

현재 demo mode에서 ③ badge가 질문 청취 카드 우측 상단에 있어
실제:

```text
0 / 2
```

청취 횟수 UI를 과하게 가린다.

③의 의미는:

```text
Replay / 청취 횟수
```

이므로 해당 UI 근처에는 있어야 하지만 내용을 덮으면 안 된다.

현재 position을 검토하여
청취 횟수 pill의 살짝 오른쪽 바깥으로 이동한다.

예시 방향:

```tsx
absolute -right-3 top-10
```

또는 count pill 자체를 relative wrapper로 만들고:

```tsx
absolute -right-4 -top-3
```

등 실제 화면에서 가장 자연스러운 위치를 선택한다.

Desktop과 mobile 모두 확인한다.

중요:

```text
③ badge가 0/2 텍스트를 가리지 않아야 함
Play button을 가리지 않아야 함
card overflow 때문에 badge가 잘리지 않아야 함
```

---

## 7. EVA 이미지 교체 및 frame fit 수정

새 asset이 함께 제공된다:

```text
eva-interviewer-clean.png
```

현재 public asset:

```text
public/assets/exam/eva-interviewer.png
```

을 이 clean asset으로 교체한다.

새 이미지에는 기존 이미지에 있던:

```text
Eva
AI Interviewer
```

baked-in UI label이 없다.

따라서 ExamInterviewer component가 렌더하는:

```text
EVA
Virtual Interviewer
```

footer만 남는다.

중복 텍스트가 없어야 한다.

---

## 8. EVA image positioning

ExamInterviewer image 영역은 4:3 box를 꽉 채워야 한다.

현재:

```tsx
object-cover object-top
```

만으로 위쪽 또는 내부 background edge가 보이면 수정한다.

권장 시작점:

```tsx
className="h-full w-full object-cover object-center"
```

또는 asset에 맞춰:

```tsx
object-[center_20%]
```

등을 사용한다.

필요하면 매우 작은:

```text
scale 1.02 ~ 1.04
```

까지는 허용한다.

목표:

- 상단 흰 strip 없음
- 내부 baked frame 없음
- 얼굴/머리 잘림 최소화
- 좌우 균형
- desktop/mobile 동일하게 자연스러움

CSS로 문제를 숨기기 위해 과도하게 확대하지 않는다.

---

## 9. Question Text toggle 중복 제거 — 중요

현재 ExamScreenShell에는 같은 state를 바꾸는 control이 2개 존재한다.

A:

```text
질문 청취 영역
[문제 텍스트 보기 / 숨기기]
```

B:

```text
Question Prompt
[텍스트 보기]
```

둘 다:

```ts
onToggleQuestionText
```

를 호출한다.

이 중복을 제거한다.

---

## 10. 단일 Question Text control 위치

최종적으로 toggle은:

```text
Question Prompt
```

영역 하나에만 둔다.

질문 청취 panel 하단에 있는
"문제 텍스트 보기 / 숨기기" control은 제거한다.

Question Prompt header 예:

```text
Question Prompt                 [👁 텍스트 보기]
```

showQuestionText === true:

```text
Question Prompt                 [🙈 텍스트 숨기기]

Tell me about...
```

showQuestionText === false:

```text
Question Prompt                 [👁 텍스트 보기]

질문 텍스트는 숨겨져 있습니다.
음성에 집중해 보세요.
```

중요:

버튼은 text가 보인 뒤 사라지면 안 된다.

항상 같은 위치에 존재하며 label만:

```text
텍스트 보기
↔
텍스트 숨기기
```

로 전환한다.

`aria-expanded` 유지.

question prompt는 screen reader가 항상 접근 가능해야 한다.

---

## 11. Question Prompt hidden state 단순화

현재 hidden state 안에도 별도:

```text
[텍스트 보기]
```

버튼이 있다면 제거한다.

toggle은 header의 한 버튼만 source of truth로 사용한다.

hidden body에는:

```text
질문 텍스트는 실제 시험처럼 숨겨져 있습니다.
음성에 집중해 보세요.
```

같은 안내만 표시한다.

한 state에 toggle button이 2개 존재하지 않아야 한다.

---

## 12. Random Question UX — 같은 문제 연속 선택 방지

현재 랜덤 선택은:

```ts
availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
```

이라 현재 질문과 같은 질문이 다시 뽑힐 수 있다.

question pool이 2개 이상이면 현재 question id를 제외한 후보에서 선택한다.

예:

```ts
const candidates =
  availableQuestions.length > 1 && question
    ? availableQuestions.filter((item) => item.id !== question.id)
    : availableQuestions;
```

그 후 candidates에서 random selection.

즉 사용자가:

```text
랜덤 질문 뽑기
```

를 눌렀는데 실제로 같은 문제라서 아무 변화도 없는 경험을 줄인다.

---

## 13. Random Question 변경 acknowledgement 추가

현재 랜덤 질문을 뽑아도:

- group badge
- question type
- hidden prompt

정도만 바뀌어서 사용자가 변화를 쉽게 인지하지 못한다.

과도한 animation은 사용하지 말고
짧고 명확한 visual acknowledgement를 추가한다.

권장 UX:

button click:

```text
🎲 랜덤 질문 뽑기
```

↓

약 1~1.5초 동안:

```text
✓ 새 연습 문항을 불러왔습니다.
질문 듣기 횟수가 0 / 2로 초기화되었습니다.
```

또는:

```text
NEW QUESTION
문화 / 음악 · 최근 경험
```

compact status가 표시된다.

동시에 Question Info panel에
아주 가벼운 indigo ring/background flash를 줄 수 있다.

예:

```text
ring-2 ring-indigo-400/60
```

→ 800~1200ms 후 normal.

금지:

- 큰 bounce
- screen shake
- confetti
- 과도한 pulse
- 페이지 전체 animation

목표는:

```text
"버튼을 눌렀고 새로운 문제가 실제로 선택됐다"
```

를 즉시 인지시키는 것.

---

## 14. Random Question state 구현

가능한 최소 state를 사용한다.

예:

```ts
const [questionChanged, setQuestionChanged] = useState(false);
```

drawQuestion:

```ts
setQuestionChanged(true);

window.setTimeout(() => {
  setQuestionChanged(false);
}, 1200);
```

timeout cleanup을 안전하게 처리한다.

또는 현재 project pattern과 더 잘 맞는 동등한 구조 사용.

ExamScreenShell prop:

```ts
questionChanged?: boolean;
```

정도로 presentation만 전달하면 된다.

대규모 state abstraction을 만들지 않는다.

---

## 15. 랜덤 질문 선택 후 reset behavior 유지

기존 drawQuestion의:

- stopSpeech
- STT abort
- audio revoke
- listenCount = 0
- showQuestionText = false
- showStoryHint = false
- sessionState = ready
- elapsedSeconds = 0
- transcript reset
- feedback reset
- recording reset
- attemptId increment
- Recorder resetKey increment

을 그대로 유지한다.

새 visual feedback 때문에 runtime hardening을 바꾸지 않는다.

---

## 16. Exam Guide numbered callout 위치 전체 점검

③뿐 아니라 ①~⑥ 모두 실제 UI를 가리는지 visually review한다.

원칙:

```text
번호가 설명하려는 영역에 가깝게
하지만 실제 control의 text/icon 자체는 가리지 않게
```

특히 확인:

① EVA face/name을 가리지 않음  
② Play glyph를 가리지 않음  
③ 0/2 count를 가리지 않음  
④ Recording label/time을 가리지 않음  
⑤ Question status text를 가리지 않음  
⑥ Answer button label을 가리지 않음

mobile에서도 잘리지 않아야 한다.

---

## 17. Guide demo mode에서 실제 훈련 action 오작동 방지

Guide page의 ExamScreenShell은 설명용 demo다.

번호 badge interaction은 가능하지만
실제:

- recording
- random question state
- STT
- answer timer

를 실행해서는 안 된다.

필요하면 demo mode에서 Play / Answer controls를:

```text
visual-only / no-op
```

또는 명확한 demo behavior로 유지한다.

Guide의 주요 interaction은 numbered callout이다.

---

## 18. PracticeReviewPanel desktop balance

Review 화면 전체를 실제 desktop에서 다시 점검한다.

목표는 3개 column의 내용량 차이를 인정하는 것이다.

```text
① 내 녹음
짧은 카드

② STT
가장 긴 카드

③ AI feedback
feedback 전에는 중간 높이
feedback 후 길어질 수 있음
```

세 카드의 높이를 강제로 똑같이 맞추지 않는다.

각 기능의 내용에 맞는 자연스러운 높이를 사용한다.

---

## 19. Mobile review layout

mobile에서는:

```text
① 내 녹음
↓
② STT
↓
③ AI 피드백
```

순서 유지.

내 녹음 카드 footer가 audio와 너무 멀어지지 않는지 확인한다.

audio control이 viewport 폭에서 overflow하지 않게 한다.

---

## 20. 기존 STT visibility 기능 유지

이번 UI cleanup 중 다음을 절대 제거하지 않는다.

```text
STT 미설정
STT 준비됨
자동 변환
변환 중
변환 완료
변환 실패
음성을 텍스트로 변환
다시 변환
STT 설정하기
```

사용자가 STT 기능 존재를 항상 알 수 있어야 한다.

---

## 21. Regression tests

기존 tests는 유지하고 다음을 추가/수정한다.

1. PracticeReviewPanel desktop grid에 items-start 또는 동등한 non-stretch layout 적용
2. privacy note 존재
3. Question Text toggle이 한 개만 존재
4. hidden state → "텍스트 보기"
5. visible state → 같은 위치에서 "텍스트 숨기기"
6. 질문 청취 panel에는 duplicate toggle 없음
7. current question이 있을 때 random draw가 가능한 경우 같은 id를 즉시 다시 선택하지 않음
8. random draw 후 listenCount = 0
9. random draw 후 questionChanged 상태 표시
10. questionChanged 상태가 일정 시간 후 해제
11. guide callout badge click → active callout 변경
12. corresponding explanation card highlight
13. explanation card click → corresponding badge highlight
14. callout buttons keyboard accessible
15. demo mode callout interaction이 actual recording을 시작하지 않음
16. EVA image alt 유지
17. 기존 Recorder/STT hardening regression tests 모두 유지

---

## 22. Visual manual QA — 반드시 수행

자동 test만 통과하고 끝내지 마라.

Desktop에서 직접 확인:

```text
STEP 6
/exam-guide/screen/
```

체크:

- 내 녹음 카드 아래 거대한 빈 공간이 사라졌는가
- audio control이 어색하게 위에 붙지 않는가
- privacy note가 footer처럼 안정적으로 보이는가
- EVA 이미지 위에 흰 strip이 보이지 않는가
- EVA 이미지에 중복 "Eva / AI Interviewer" 텍스트가 없는가
- Question Text toggle이 단 하나인가
- 텍스트 표시 후 버튼이 "숨기기"로 남아 있는가
- 랜덤 질문 변경을 즉시 알아볼 수 있는가
- ③ badge가 0/2를 가리지 않는가
- 번호 badge가 실제 clickable한가
- click 시 아래 explanation이 확실히 연결되어 보이는가

Mobile viewport에서도 동일 항목을 확인한다.

---

## 23. Repository search

완료 전:

```bash
rg "문제 텍스트 보기|문제 텍스트 숨기기|텍스트 보기|텍스트 숨기기" src/components/practice
rg "번호 배지를 클릭|번호를 선택" src/components
rg "border-l-4 border-indigo" src/components/practice
rg "Math.random" src/components/practice/PracticeView.tsx
rg "questionChanged|activeCallout|onAnnotationSelect" src
```

검색 결과를 직접 검토한다.

---

## 24. 전체 validation

반드시 실행:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
```

---

## 25. 하지 말 것

금지:

- ExamScreenShell architecture 재설계
- Course × Level 변경
- STT provider 변경
- Recorder runtime 변경
- full mock exam engine 추가
- 새로운 backend
- router 변경
- 전체 디자인 시스템 변경
- 과도한 animation 추가
- 3-column review cards를 다시 강제로 동일 높이로 맞추기
- duplicate Question Text controls 유지

---

## 26. 완료 보고

다음만 보고한다.

1. 내 녹음 card height/layout 수정
2. Phase B left border 제거
3. EVA asset/frame fit 수정
4. Question Text 단일 toggle 구현
5. random question duplicate 방지
6. random question visual acknowledgement
7. guide callout clickable interaction
8. ③ 및 기타 annotation 위치 수정
9. desktop/mobile visual QA 결과
10. 추가 regression tests
11. lint/test/build/verify/docs 결과
12. remaining known issue

현재 runtime architecture는 유지하고
이번 pass는 visual polish와 interaction clarity에만 집중해서 완료하라.
