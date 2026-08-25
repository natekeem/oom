# 06. UI / UX Flow

## Training 첫 진입

기존 STEP 카드보다 먼저 두 선택을 받습니다.

### 1. 목표 구간

카드 3개:
- 1구간 / AL / 5-5
- 2구간 / IH·IM3 / 4-4
- 3구간 / IM2·IM1 / 3-3

추천 학습자 문구는 보여줄 수 있지만 접근 제한으로 사용하지 않습니다.

### 2. 훈련 코스

선택한 Level을 유지한 채 Course 카드 표시.

Course 1:
`Everyday & Getaway`
가족여행 · 카페/휴식 · 테니스 · 집/동네

Course 2:
`Culture & City`
문화생활 · 실용 쇼핑 · 가벼운 운동 · 혼자 사는 집/도시여행

CTA:
`이 구성으로 학습 시작`

## 선택 이후

현재 STEP1~5 구조를 최대한 유지합니다.

상단:
`1구간 AL · 코스 1 Everyday & Getaway`
`구간/코스 변경`

## STEP 1

전체 survey option tree는 유지.

현재 Course의 추천 ID만:
- recommended badge
- default checked
등에 사용.

설명:
`이 코스의 4개 핵심 스토리로 아래 추천 주제를 묶어 연습합니다.`

## STEP 2

Current Level의 난이도 프리셋 강조.

v1에서는 Level이 난이도를 소유하므로 사용자가 별도로 난이도를 바꾸는 기능은 제거하거나 읽기 전용 참고로 두는 것이 일관적입니다.

반드시:
`난이도 설정만으로 등급이 결정되지는 않습니다.`

## STEP 3

Story A/B selector 제거.

각 group에서 canonical storyline 하나를 바로 표시.

같은 Course에서 level-up했다면 상단에:
- 이미 아는 핵심
- 이번 구간에서 추가되는 기능
을 보여주면 좋습니다.

## STEP 4

같은 scenario를 current Level 복잡도로 렌더.

## STEP 5

Random pool:
`questions.filter(q => q.courseId === selected.courseId && q.levelId === selected.levelId)`

다른 course/level 문제를 섞지 않습니다.

## 변경 UX

`구간/코스 변경` 클릭 → setup UI.

사용자가 새 selection을 확정하기 전에는 기존 selection을 버리지 않는 방식이 안전합니다.

## P1 Level Up CTA

최근:
`Course 1 / 2구간`

다음 진입:
`같은 이야기를 유지하고 1구간으로 레벨 업`

이것이 이 구조의 가장 중요한 학습 UX입니다.


## 초기 Course 카드 3개

- Everyday & Getaway — `균형형`
- Culture & City — `준비 효율 추천`
- Nature & Weekend — `아웃도어형`

기본 정렬은 Course 1, 2, 3을 유지하되 Course 2에 추천 badge를 줄 수 있다. 추천은 "점수 보장"이 아니라 준비 효율 기준임을 tooltip/설명에서 명시한다.
