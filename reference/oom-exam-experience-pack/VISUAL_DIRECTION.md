# VISUAL_DIRECTION.md

## Target feeling

The most important change is not a new feature. It is a **mode change**:

### While answering
The screen should feel like a computer speaking test.

Visual anchors:
1. interviewer / EVA
2. Play or Replay
3. recording state
4. elapsed response time
5. question progress
6. Next / answer complete

Do **not** show transcript, blueprint, AI feedback, or large coaching cards while the user is speaking.

### After answering
The screen should visibly switch to OOM coaching mode.

Order:
1. listen to my recording
2. STT / transcript
3. AI feedback
4. retry the same question

## Relationship to known OPIc UI

Publicly visible OPIc UI examples commonly emphasize:
- a large avatar/interviewer panel
- a Replay/Play control
- a Recording state
- visible question progress
- a Next action

This pack uses those interaction cues but the implementation and artwork are original OOM assets.

## OOM design language

Keep:
- current zinc/slate base
- restrained indigo/blue
- rounded-md / rounded-lg rather than huge pills
- strong content hierarchy
- dark exam console only inside STEP 6 exam shell

The rest of OOM remains the existing light/dark design system.

## Desktop
Use a broad landscape "test console":
- interviewer + listen area: ~70%
- progress / state rail: ~30%

## Mobile
Do not squeeze a two-column desktop test:
- interviewer
- question listening
- state/timer
- main CTA
- progress
stack vertically.

## Timer disclaimer
Always label as:

> OOM 연습 목표

and include:

> 실제 OPIc의 문항별 제한시간이 아닙니다.
