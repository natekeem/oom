# OOM `/about/` Final Polish Patch
## Gemini 3.1 Pro 작업 지시서

이번 작업은 `/about/` Interactive System Explorer의 **재구현이 아니다.**

이미 구현된:

- Course registry 연동
- Level source-of-truth 연동
- local-only demo state
- Course / Level focus mode
- Training Context
- 4+ Course internal scroll
- TrainingSelection 비변경
- tests

을 모두 보존하고, **현재 실제 구현 위에 visual/layout polish만 적용**한다.

Reference:
`reference/about-final-polish-v2.html`

Reference는 색상/코드 복붙용이 아니라
**비율, 밀도, 글자 크기, vertical fill, hierarchy** 참고용이다.

==================================================
1. BASELINE
==================================================

먼저:

```bash
git status
git rev-parse HEAD
git rev-parse origin/main
```

현재 working tree가 clean인지 확인.

그 다음 실제 구현 파일을 읽는다.

최소:

- `src/components/home/HomeView.tsx`
- `src/components/home/AboutSystemExplorer.tsx`
- `src/components/home/AboutCourseSelector.tsx`
- `src/components/home/AboutLevelSelector.tsx`
- `src/components/home/AboutTrainingMap.tsx`
- `src/components/home/aboutSystemModel.ts`
- 관련 About CSS/Tailwind
- 관련 tests

기존 interaction/data wiring을 이해한 뒤 수정.

==================================================
2. 절대 보존
==================================================

다음은 변경하지 않는다.

- Course registry 연동 방식
- Course dynamic count
- Level source-of-truth
- target duration source
- `useAboutExplorer` local state contract
- `selectedCourseId`
- `selectedLevelId`
- `focusMode`
- TrainingSelection 비변경
- localStorage 비변경
- 4+ Course internal scroll
- Course selection → Training Context update
- Level selection → duration/context update
- Full system behavior
- CTA routes
- AppShell
- Sidebar
- global content width
- Landing `/`
- STEP1~6 runtime
- Practice
- STT
- AI provider/settings

이번 pass는 **visual polish only**.

==================================================
3. 현재 문제
==================================================

현재 구현은 기능은 맞지만 다음 visual 문제가 있다.

1. 전체 font scale이 너무 작음.
2. Course 제목이 좁은 폭에서 줄바꿈되어 balance가 깨짐.
3. Course 설명이 길어 option 내부가 복잡함.
4. 왼쪽 selector가 너무 좁고, 오른쪽 system이 상대적으로 너무 넓음.
5. OOM Training System 내부 module은 넓게 퍼져 있으나 글자는 작음.
6. 오른쪽 영역 하단이 일찍 끝나서 빈 공간이 생김.
7. 전체 page bottom도 약간 비어 보임.
8. 상단 metrics `3 / 3 / 6 / AI`가 너무 작아 존재감이 약함.
9. 실제 interactive demo인데 관리화면처럼 보이는 경향이 있음.

==================================================
4. Desktop grid ratio 조정
==================================================

현재보다 왼쪽 selector column을 넓힌다.

Target:

```css
grid-template-columns:
  300px~320px minmax(0, 1fr);
```

권장 starting point:
`310px`.

결과:

- Course title 1 line 확보
- Level title/option readability 증가
- right system width 약간 축소
- 전체 visual balance 개선

global content max-width는 변경하지 않는다.

==================================================
5. Course option — 가장 중요
==================================================

Course option은 다음 구조가 기본.

```text
01 · Everyday & Getaway
일상 · 휴가
```

### title

- 반드시 1 line 우선
- `white-space: nowrap`
- `overflow: hidden`
- `text-overflow: ellipsis`

Course가 길어져도 2줄로 깨뜨리지 않는다.

### helper

helper는 최대 1 line.

실제 registry에 compact helper가 이미 있으면 사용.

현재 helper가 긴 description이라면:

- About UI에서만 짧은 existing metadata를 쓸 수 있는지 확인
- 없다면 **helper를 생략하는 쪽을 우선**

금지:
긴 설명 문장을 Course option 안에 2~3줄 넣기.

About는 Course catalog가 아니다.

### future Courses

기존 4+ internal scroll contract 그대로 유지.

==================================================
6. Left selector typography 확대
==================================================

Reference와 비슷한 hierarchy 목표.

COURSE / LEVEL label:
현재보다 약간 키움.

Heading:
`무엇을 준비할지`
`얼마나 깊게 말할지`

현재보다 확실히 크게.

권장 visual target:
약 `20~22px`.

Helper:
읽을 수 있는 약 `11~12px`.

Option title:
약 `11~12px`.

Option secondary/helper:
약 `9~10px`.

실제 OOM typography token/Tailwind scale에 맞춰 선택.

8px 이하 본문 남발 금지.

==================================================
7. Metrics 확대
==================================================

현재:

```text
3 COURSES
3 LEVELS
6 STEPS
AI COACH
```

구조 유지.

다만 숫자/AI를 확실히 크게.

Target feeling:

- number / AI ≈ 28~32px visual weight
- label ≈ 10px
- metric rail 전체 높이 약 56~64px

Metrics가 단순 divider처럼 보이지 않게 한다.

==================================================
8. Metrics hover preview
==================================================

fine pointer에서만 subtle effect 허용.

예:

- number / AI accent 증가
- bottom accent line 15~25% 정도 나타남
- COURSE hover → Course 관련 map이 잠깐 밝아짐
- LEVEL hover → Level 관련 map이 잠깐 밝아짐
- STEPS hover → Full path preview
- AI hover → AI Coach 강조

중요:

hover preview는 persistent selection을 변경하지 않는다.

mouse leave 후 기존 `focusMode`로 복귀.

이 구현이 state를 복잡하게 만든다면:
**metric 자체 hover visual만 구현하고 system preview는 생략해도 됨.**

기능 안정성이 우선.

==================================================
9. OOM Training System 폭 / density
==================================================

오른쪽 System Map은 현재보다 약간 좁아져도 된다.

대신 내부 density를 높인다.

해야 할 것:

- module padding 증가
- module title 크기 증가
- helper text 크기 증가
- module 간 gap 균형
- 빈 가로 공간 감소

목표:
"넓은 칸 안에 작은 글씨"

가 아니라

"조밀하지만 여유 있는 product map".

==================================================
10. Right system vertical fill
==================================================

현재 right system이 왼쪽 selectors보다 일찍 끝나고 아래에 빈 공간이 생기지 않게 한다.

Desktop에서:

LEFT:
Course
Level
전체 시스템 보기

RIGHT:
System Header
Training Context
Map modules
6 Step Rail + AI Coach

가 거의 같은 bottom line에서 끝나도록 한다.

방법:

- workspace stretch
- system `height: 100%` / grid row fill
- map row에 `minmax(0,1fr)`
- lower row 고정/적정 height
- module rows `repeat(3,1fr)`

중 하나로 해결.

금지:
빈 공간을 arbitrary padding-bottom 80px 같은 방식으로 채우기.

==================================================
11. Right module typography
==================================================

현재보다 한 단계 키운다.

Suggested visual targets:

Module eyebrow:
9~10px

Module title:
12~14px

Module helper:
9.5~11px

`STEP 2`, `STORY POOL`, `STEP 4`, `ANSWER DENSITY`, `STEP 6`
모두 쉽게 읽혀야 함.

Inactive state도 읽을 수 있어야 한다.

opacity가 너무 낮아 text가 사라지는 문제 금지.

inactive opacity:
대략 0.55~0.7 수준에서 QA.

==================================================
12. Training Context 강화
==================================================

Training Context는 오른쪽 시스템의 핵심 결과값.

현재보다 slightly stronger.

예:

`TRAINING CONTEXT`
`Everyday & Getaway × 2구간`
`IH / IM3 · 45–65초`

- 선택 Course/Level 변화가 즉시 보이게
- course/title text overflow 방지
- long Course name ellipsis 허용
- line height 안정

==================================================
13. 6 STEP TRAINING PATH
==================================================

현재 구조 유지.

다만 현재보다 readability 개선.

- step number
- label

모두 너무 작지 않게.

현재 focusMode highlight behavior는 그대로.

No new click navigation.

==================================================
14. AI Coach
==================================================

현재:

KEEP / FIX / RETRY

유지.

다만 전체 높이와 spacing을 step rail과 balance 맞춤.

Level focus / Full focus에서
border/background emphasis가 분명하게 보이게.

새 AI 기능 추가 금지.

==================================================
15. Bottom summary + CTA
==================================================

현재 흐름 한 줄과 CTA를 조금 더 위/가까이 붙여
page bottom empty space를 줄인다.

Summary:
약 10~11px 이상.

CTA:
현재보다 작아 보이지 않게.

하지만 footer와 겹치지 않는다.

==================================================
16. Header
==================================================

현재 header 구조는 KEEP.

Copy:

`Course로 준비 범위를 정하고, Level로 답변 밀도를 맞춘 뒤, 6단계 훈련과 AI 재시도로 연결합니다.`

유지.

Desktop 1280+:
1 line 우선.

H1 / support도 현재보다 너무 작아지지 않게.

==================================================
17. One-screen target
==================================================

Desktop QA 핵심:

1440×900

다음이 한 화면에 보여야 함.

- header
- metrics
- Course selector
- Level selector
- full system button
- training system
- step rail
- AI coach
- summary
- CTA

footer는 현재 AppShell 구조에 따라 화면 하단.

No fake solution:

`body { overflow: hidden }`

같은 global hack으로 성공처럼 만들지 않는다.

현재 layout height를 실제로 조정.

==================================================
18. Responsive
==================================================

1024 이하:
기존 stacked behavior 유지.

390 / 430:
normal page scroll.

Mobile에서는 Course option title이 너무 길면 ellipsis.

4+ Course internal scroll은 desktop/tablet 중심.

아주 작은 mobile에서는 nested tiny scroll보다
기존 responsive behavior를 우선.

==================================================
19. Color / style
==================================================

Reference HTML의 raw color를 복사하지 않는다.

현재 OOM의:

- dark/light theme
- border tokens
- accent violet
- green Level accent
- OomBrandMark

를 사용.

이번 작업은 새 visual system 생성이 아님.

==================================================
20. Animation
==================================================

Allowed:

- border color 180~250ms
- background tint
- subtle underline
- 1~2px translate
- short pulse

금지:

- scale bounce
- 3D
- large glow
- flashing
- layout shift

Reduced motion 존중.

==================================================
21. Tests
==================================================

기존 interaction tests를 깨지 않게 한다.

추가/수정 필요 시:

1. Course title line/ellipsis class contract
2. 4+ Course scroll 유지
3. Course selection unchanged
4. Level selection unchanged
5. Full system unchanged
6. dynamic metrics count unchanged
7. metric hover가 selection을 mutate하지 않음 (구현한 경우)
8. TrainingSelection mutation 없음

CSS pixel 값에 과도하게 brittle한 test 금지.

==================================================
22. Visual QA
==================================================

반드시 실제 브라우저에서:

- 1440×900
- 1792×861 또는 유사 widescreen
- 1920×1080
- 1024×900
- 390×844
- 430×932

확인.

### 1440 / widescreen

- Course title all one line
- helper max one line
- left width 충분
- right system 너무 넓지 않음
- right bottom empty gap 최소
- workspace left/right bottom alignment
- metrics 커짐
- module text 읽기 쉬움
- page 전체가 관리 dashboard보다 interactive product explorer 느낌

### Course stress

긴 Course 이름 fixture로:
- no wrap
- ellipsis
- layout 유지

4+ fixture:
- chooser internal scroll
- page height 유지

==================================================
23. Validation
==================================================

실제 존재하는 scripts 확인 후 실행:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
git diff --check
```

repo에 존재하면:

```bash
npm run docs:generate
npm run docs:check
```

없는 script를 만들어내지 않는다.

==================================================
24. DO NOT
==================================================

하지 말 것:

- About architecture 다시 설계
- component 전면 rewrite
- registry adapter rewrite
- 새로운 state management
- TrainingSelection 연동
- actual course data 수정
- Level 데이터 수정
- Landing 수정
- Sidebar 수정
- global max-width 수정
- Course를 3개로 hardcode
- Course helper를 임의 마케팅 문장으로 생성

==================================================
25. Completion report
==================================================

보고:

1. baseline SHA
2. files changed
3. left/right grid before → after
4. Course option line treatment
5. Course helper treatment
6. typography scale changes
7. metric scale/hover
8. system width/density
9. vertical fill fix
10. module readability
11. 6-step / AI balance
12. one-screen 1440×900 result
13. 1792×861 result
14. mobile result
15. 4+ Course result
16. tests
17. validation
18. remaining issue

**Commit / push 하지 않는다.**
