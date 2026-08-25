# 02. Current Repository Analysis

분석 기준: `github.com/natekeem/oom` main, `opic-on-me.com`, 2026-08-19.

## 현재 기술 구조

- Vite + React + TypeScript static app
- backend 없음
- 브라우저/localStorage 중심
- `ViewId` 기반 화면 이동
- STEP 1~5 학습 흐름
- `src/data/*.ts`가 콘텐츠 source 역할

## 현재 주요 데이터

- `fixedSurvey.ts`: 전체 survey tree와 전역 `recommended`
- `scripts.ts`: 현재 main 4 scripts
- `additionalScripts.ts`: Story SET B
- `scriptTrainingData.ts`: 질문별 pivot/keep-block 훈련
- `additionalScriptTraining.ts`: SET B variation
- `scriptReplacementGuides.ts`: script block 교체
- `roleplays.ts`, `additionalRoleplays.ts`
- `questions.ts`: 전역 practice pool
- `types.ts`

## 새 구조에서 바로 문제가 되는 부분

1. Survey 추천값이 전역 boolean이라 Course별 추천이 불가능.
2. Main scripts가 `goalLevel: "IM3-IH-AL"`로 묶여 level별 분리가 없음.
3. `GoalLevel`에 IM1/IM2가 없음.
4. Roleplay level differences가 IM3/IH/AL만 지원.
5. PracticeQuestion에 courseId/levelId가 없음.
6. STEP5가 global pool이면 선택한 코스/구간과 무관한 문제가 섞일 수 있음.
7. AI feedback에 기존 목표 등급 hardcode가 있을 수 있음.
8. AGENTS.md의 Story A/B 유지 규칙이 새 제품 결정과 충돌.

## 현재 main script를 Course 1 / advanced로 두어도 되는가

예.

현재 4개 스크립트는:
- 60~90초 수준의 충분한 분량
- 구체적 명사와 장면
- 과거 경험
- 감정
- 변화/비교 요소
- 여러 survey topic 재사용
- roleplay 연결 단서

가 이미 있어 1구간 기준점으로 쓰기 좋습니다.

단, 제품 문구는 `AL을 보장하는 스크립트`가 아니라 `AL 목표용 advanced scaffold`여야 합니다.

## AGENTS.md

현재 저장소 규칙이 Story choices를 보존하도록 되어 있다면 이번 제품 결정과 함께 규칙 파일 자체를 수정해야 합니다. 그렇지 않으면 다음 code agent가 새 구조를 '회귀'로 오판할 수 있습니다.
