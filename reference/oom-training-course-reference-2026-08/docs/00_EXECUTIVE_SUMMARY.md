# 00. Executive Summary

## 왜 바꾸는가

현재 OOM은 `서베이 고정 → 난이도 → 만능 스크립트 → 롤플레이 → 실전`이라는 학습 흐름은 좋지만 콘텐츠가 사실상 하나의 전역 코스처럼 동작합니다. STEP 3의 Story Set A/B는 예전에는 다양성을 주는 장점이 있었지만, 상위에 `훈련 코스`가 생기면 같은 목적을 중복 수행합니다.

## 최종 모델

### Level
- 1구간 = AL 목표 = `advanced`
- 2구간 = IH / IM3 목표 = `intermediate`
- 3구간 = IM2 / IM1 목표 = `foundation`

### Course
- Course 1 = Everyday & Getaway (현재 OOM 콘텐츠 기반)
- Course 2 = Culture & City
- Course 3+ = 추후 추가

### Training Context
별도 user-facing Training Set을 만들지 않습니다.

`Course + Level = 완전한 학습 구성`

## 학습 철학

같은 Course의 세 Level은 서로 다른 이야기가 아닙니다.

- Foundation: 장소 + 사람 + 행동 + 이유
- Intermediate: Foundation + 최근 경험 + 구체 이유 + 간단한 변화
- Advanced: Intermediate + 구체 장면 + 문제/예상 밖 상황 + 비교/변화 + 유연한 연결

즉 학습자가 Course 1 / 2구간을 충분히 익힌 뒤 Course 1 / 1구간으로 올라가면 새 스토리를 처음부터 외울 필요가 없습니다.

## Story A/B

Story A/B 선택 UI는 제거합니다.

하지만 기존 `scriptTrainingData`의 질문별 pivot/keep-block/variation 기능은 Story A/B와 다른 기능입니다. 이것은 OOM 핵심 기능이므로 반드시 유지합니다.

## P0 구현

1. Course/Level 데이터 모델
2. Course 1/2/3 콘텐츠 등록
3. Level → Course 선택 UI
4. localStorage 선택 저장
5. STEP 1~5를 Course × Level selector 기반으로 변경
6. Story A/B UI 제거
7. Roleplay/Practice/AI feedback level-aware
8. AGENTS/ARCHITECTURE/ROUTING 문서 갱신
9. 테스트와 빌드 검증


## 초기 서비스 3코스 확정

- Course 1 · Everyday & Getaway — 균형형
- Course 2 · Culture & City — 준비 효율 추천
- Course 3 · Nature & Weekend — 아웃도어형

세 코스의 전략 적합성 평가는 `13_COURSE_STRATEGY_REVIEW.md`를 참고한다.
