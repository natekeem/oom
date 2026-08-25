# PROMPT_GEMINI_36_FLASH.md

## Task

You are modifying the existing OOM repository:

- https://github.com/natekeem/oom
- production: https://opic-on-me.com/

This package contains **visual reference images and reference React/Tailwind code** because the requested UX is visual and the available model is Gemini 3.6 Flash.

Do not redesign the architecture. Use this pack as a highly concrete implementation reference.

---

# 0. Read these files first

1. `README_START_HERE.md`
2. `VISUAL_DIRECTION.md`
3. `assets/generated/exam-screen-wireframe.png`
4. `assets/generated/review-screen-wireframe.png`
5. `assets/generated/eva-interviewer-reference.png`
6. `reference-code/ExamScreenShell.reference.tsx`
7. `reference-code/PracticeReviewPanel.reference.tsx`
8. `reference-code/ExamGuideScreen.reference.tsx`
9. `reference-code/ROUTE_AND_COPY_PATCH.reference.md`
10. `reference-code/STEP2_COPY.reference.md`

The `.reference.*` files are **implementation guides**, not blind drop-in patches.
Adapt imports and existing OOM component APIs to the current repo.

---

# 1. Final user-facing STEP names

Use exactly:

```text
STEP 1. 목표 구간 · 코스 설정
STEP 2. 추천 서베이 익히기
STEP 3. 난이도 설정
STEP 4. 만능 스크립트
STEP 5. 롤플레이 공식
STEP 6. 실전 연습
```

Replace the user-facing current name:

```text
STEP 2. 서베이 고정
```

with:

```text
STEP 2. 추천 서베이 익히기
```

Update:
- Sidebar / ExpandableSidebar
- TrainingHub
- BackgroundSurveySheet
- AppShell titles / next labels
- static SEO
- README
- docs
- tests

Internal explanatory copy may still say that the survey strategy "고정한다" 학습 범위를.

---

# 2. Add OPIc guide page: 시험 화면 · 조작법

Add:

```text
/exam-guide/screen/
ViewId: exam-screen
Title: OPIc 수험 가이드 · 시험 화면 · 조작법
```

Guide menu order:

```text
소개 · 등급
시험 화면 · 조작법
신청 · 응시료
당일 진행
성적 · 쿠폰
Q&A
```

Use the existing guide architecture.

Important current repo facts:
- `ExamGuideSection` currently lives in `src/data/examGuideContent.ts`
- guide tabs and hub map icons by array index
- ViewId and titles live in `src/components/layout/Sidebar.tsx`
- path mapping lives in `src/lib/routes.ts`
- React routes live in `src/App.tsx`

When adding a new guide section, preferably change icon selection from positional arrays to a keyed lookup so adding one section cannot shift all icons.

---

# 3. What the guide page must show

Create an original OOM exam-screen schematic.

Use the visual reference:

```text
assets/generated/exam-screen-wireframe.png
```

The guide needs numbered explanation blocks for:

1. 인터뷰어 영역
2. 질문 청취 / Play
3. 질문 청취 횟수 / Replay
4. 마이크 · Recording 상태
5. 문항 진행
6. 답변 완료 / Next

Also explain the simple flow:

```text
질문 듣기
→ 핵심 파악
→ 답변하기
→ 답변 완료
→ 다음 문제
```

Add CTA:

```text
시험 화면으로 직접 연습해 보기
```

→ STEP 6.

Add a small STEP 6 link back:

```text
시험 화면이 처음인가요? 화면 구성 알아보기
```

→ `/exam-guide/screen/`.

---

# 4. Use exam-like interaction cues

Public examples of OPIc test UI show a distinctive mental model:
- interviewer avatar is a major visual anchor
- Play/Replay is obvious
- Recording state is obvious
- progress is visible
- Next is a clear action

Create an OOM implementation with these cues.

Do not preserve the current "many separate dashboard cards during speaking" look.

Use a dark exam-console frame similar to:

```text
assets/generated/exam-screen-wireframe.png
```

while the rest of the OOM site remains unchanged.

---

# 5. STEP 6 must have two visual phases

## Phase A — 시험 화면

When a question is ready or the user is speaking:

```text
EVA / interviewer
+ question listening
+ 0/2 listen count
+ recording state
+ OOM practice target time
+ question progress
+ answer start / answer complete
```

Do not display:
- STT transcript
- AI feedback
- large storyline hint
- blueprint
- coaching analytics

while recording is active.

## Phase B — 답변 복기

After recording completes:

```text
① 내 녹음
② 음성 받아쓰기 (STT)
③ AI 맞춤 피드백
```

Use:

```text
assets/generated/review-screen-wireframe.png
reference-code/PracticeReviewPanel.reference.tsx
```

as the concrete visual target.

---

# 6. EVA asset

The package includes:

```text
assets/generated/eva-interviewer-reference.png
```

Copy it into the actual project as e.g.:

```text
public/assets/exam/eva-interviewer.png
```

This is an original generated reference asset.

Use it in:
- `/exam-guide/screen/`
- STEP 6 exam shell

If the crop quality is not good enough, regenerate it using `IMAGE_PROMPTS.md`.

Do not use different interviewer images between guide and practice unless necessary.

---

# 7. Question listen behavior

Use the browser TTS helper already available in the project if one exists.
Do not add a backend or external TTS provider for this task.

State:

```ts
listenCount: 0 | 1 | 2
```

UI:

```text
질문 듣기 0 / 2
질문 듣기 1 / 2
질문 듣기 2 / 2
```

After 2 listens, disable additional playback for the current attempt.

Reset listen count on:
- new question
- same-question retry

If browser TTS is unavailable:
- keep question text accessible
- show a compact fallback message

Keep question text visually hidden by default or strongly de-emphasized.
Provide:

```text
문제 텍스트 보기
```

for training/accessibility.

---

# 8. Important exam-rule copy

Current official OPIc information says:
- sample-question stage explains screen/listening/answer method
- main-test questions can be listened to up to 2 times
- there is no per-question response time limit

Therefore OOM's timer must be labeled:

```text
OOM 연습 목표
30–45초 / 45–65초 / 60–90초
```

and must state:

```text
실제 OPIc의 문항별 제한시간이 아닙니다.
```

Never present the OOM timer as an actual exam countdown rule.

---

# 9. STT visibility — P0 UX requirement

Current STT exists but is invisible when no endpoint is configured.

Fix this in the review area.

The user must always see one state:

```text
STT 미설정
STT 준비됨
자동 변환 ON
자동 변환 OFF
변환 중
변환 완료
변환 실패
```

## No STT endpoint

Show:

```text
음성 받아쓰기

STT가 아직 설정되지 않았습니다.
설정하면 녹음한 영어 답변을 자동으로 텍스트로 바꿀 수 있습니다.

[STT 설정하기]
```

The button navigates to `ai-settings`.

## Endpoint configured + auto ON

Show:

```text
● STT 준비됨
녹음 종료 후 자동으로 받아씁니다.
```

## Endpoint configured + auto OFF

Show:

```text
STT 연결됨
자동 변환은 꺼져 있습니다.

[음성을 텍스트로 변환]
```

---

# 10. Manual transcribe / retry

This is required even if auto-transcription exists.

If a RecordingResult exists and STT is configured, expose:

```text
[음성을 텍스트로 변환]
```

After success:

```text
[다시 변환]
```

After error:

```text
음성 변환에 실패했습니다.
녹음은 그대로 보존되어 있습니다.

[다시 변환]
[직접 입력]
[STT 설정 확인]
```

Reuse the existing `transcribeAudio()` adapter.
Do not write duplicate fetch logic inside the UI.

---

# 11. STT status model

If useful, add:

```ts
type SttUiStatus =
  | "unconfigured"
  | "ready"
  | "transcribing"
  | "success"
  | "error";
```

A reference helper is included:

```text
reference-code/sttUiStatus.reference.ts
```

Do not build a large state-management abstraction.

Existing AbortController + attemptId stale-response guards must remain.

---

# 12. Transcript is an editable draft

Label:

```text
내 답변 Transcript
```

Supporting copy:

```text
STT 결과가 정확하지 않을 수 있으니
AI 피드백 전에 한 번 확인·수정하세요.
```

The textarea remains editable.

Manual input remains available when STT is not configured.

---

# 13. AI feedback belongs after STT

The visual order must be:

```text
녹음
→ 녹음 재생
→ STT
→ transcript 확인/수정
→ AI 피드백
→ 같은 질문 재도전
```

Do not show AI feedback as a parallel unrelated card during speaking.

Keep the current structured AI feedback prompt.
Do not rewrite the feedback architecture.

---

# 14. Retry same question

Existing retry behavior stays.

On retry:
- same question remains
- listen count = 0
- recorder reset
- timer reset
- transcript reset
- feedback reset
- STT UI reset
- focus/scroll back to exam shell if reasonable

---

# 15. Practice screen component strategy

Prefer extracting presentation from the current large `PracticeView.tsx`:

```text
ExamInterviewer
ExamScreenShell
PracticeReviewPanel
```

Reference implementations are included.

Do not move the actual:
- question selection
- Recorder / timer orchestration
- STT requests
- AI requests
- attemptId logic

out of `PracticeView` unless a small extraction clearly improves readability.

The presentation components should receive state/actions via props.

---

# 16. Use the reference code carefully

The supplied files use probable imports such as:

```ts
../ui/Button
../ui/Card
```

Adjust paths to the actual destination.

The current OOM `Button` variants may not contain `danger`.
If not, use existing variants/classes rather than modifying the entire button system.

Do not introduce a new design-system library.

---

# 17. Preserve runtime hardening

Do not regress:

- Recorder `discardOnStopRef`
- `RecorderHandle.start(): Promise<boolean>`
- mic failure → no hidden timer start
- timer-only fallback
- `AbortController`
- `attemptIdRef`
- no audio Blob in localStorage
- optional `oom-stt-settings`

---

# 18. Static / docs

Update:

- `scripts/generate-static-routes.mjs`
- README
- AGENTS
- ARCHITECTURE
- ROUTING
- generated snapshot via generator

Add `/exam-guide/screen/`.

Update STEP 2 to `추천 서베이 익히기`.

Update STEP 6 static description to:

```text
시험 화면 스타일로 질문을 듣고 답변한 뒤,
녹음을 다시 듣고 optional STT로 transcript를 확인·수정한 다음,
AI 피드백과 같은 질문 재도전으로 복기합니다.
```

---

# 19. Assets to add to the repo

Recommended:

```text
public/assets/exam/eva-interviewer.png
public/assets/exam/exam-screen-guide.png
```

Use the generated files from this package.

You do not need to commit the large visual-reference boards to the production repo.
Those boards are for the coding agent / reviewer.

---

# 20. Accessibility

Maintain:
- keyboard-accessible buttons
- visible focus
- recording state conveyed by text, not color alone
- question text available to screen readers
- interviewer image alt
- mobile stacking layout

---

# 21. Tests

Add/update tests for:

## STEP 2
- new name in Sidebar/Hub/Survey
- old `STEP 2. 서베이 고정` not present as active UI label

## Exam guide
- `exam-screen` ViewId
- route renders
- guide tab/menu exists
- CTA → practice
- timer disclaimer present

## STEP 6
- question listen count resets
- max 2 listens per attempt
- recording state hides/de-emphasizes review UI
- recording complete enables review section
- STT unconfigured state is visible
- STT settings CTA exists
- STT ready state
- manual transcribe
- success state
- error + retry
- editable transcript
- same-question retry resets listen/STT/review state
- existing stale STT guards remain

---

# 22. Validation

Run all:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
```

---

# 23. Do not do

Do not:
- build a full 12–15 question mock-exam engine
- add a backend
- hardcode API keys
- replace the current STT provider model
- remove manual transcript fallback
- rebuild Course × Level
- bring back Story A/B
- replace the whole OOM visual system
- remove the actual runtime hardening already implemented
- treat OOM practice timer as an official OPIc limit

---

# 24. Completion report

Report only:

1. STEP 2 rename coverage
2. `/exam-guide/screen/` implementation
3. exam-screen component structure
4. image assets added
5. STEP 6 exam phase UI
6. STT visibility states
7. manual transcribe / retry
8. answer review flow
9. tests added
10. lint/test/build/verify/docs results
11. remaining known issues

Implement to completion without asking the user for another design decision unless the current repository makes a requirement impossible.
