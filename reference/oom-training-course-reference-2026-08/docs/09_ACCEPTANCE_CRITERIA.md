# 09. Acceptance Criteria

## Product
- [ ] 목표 구간 정확히 3개
- [ ] Course와 Level 별도 선택
- [ ] user-facing Training Set 없음
- [ ] Story A/B selector 없음
- [ ] question variation은 유지
- [ ] Course1 current scripts = advanced 기준
- [ ] Course1 intermediate/foundation 존재
- [ ] Course2 세 level 존재

## Survey
- [ ] full survey tree 단일 source
- [ ] Course에 따라 추천값 달라짐
- [ ] Course1 family residence
- [ ] Course2 alone residence
- [ ] Course2 activity preset 12
- [ ] course switch가 다른 데이터 mutate하지 않음

## Difficulty
- [ ] advanced 5-5
- [ ] intermediate 4-4
- [ ] foundation 3-3
- [ ] 등급 보장 아님 안내

## Script
- [ ] one canonical storyline per group/course
- [ ] each storyline has 3 levels
- [ ] same anchorScene/core facts
- [ ] blind/keyword/TTS 유지
- [ ] pivot/variation 유지

## Roleplay
- [ ] Course-specific scenarios
- [ ] same scenario 3 level variants
- [ ] foundation simple request
- [ ] intermediate alternatives
- [ ] advanced conditions/negotiation

## Practice
- [ ] courseId
- [ ] levelId
- [ ] storylineId
- [ ] pool filtered by course AND level
- [ ] question complexity differs by level

## Navigation
- [ ] no selection → setup
- [ ] selected → STEP flow
- [ ] current course/level visible
- [ ] change action
- [ ] mobile/keyboard usable

## Persistence
- [ ] `oom-training-selection-v1`
- [ ] invalid JSON fallback

## AI
- [ ] no new-path IM3/IH/AL-only assumption
- [ ] level/context passed
- [ ] exact script matching not grading target

## Docs
- [ ] AGENTS updated
- [ ] ARCHITECTURE updated
- [ ] ROUTING updated
- [ ] generated snapshot updated by tool if applicable

## Validation
- [ ] lint
- [ ] tests
- [ ] build
- [ ] pages verification
- [ ] docs generate/check


## Initial 3-course launch

- [ ] Course 1 display name = Everyday & Getaway
- [ ] Course 2 display name = Culture & City
- [ ] Course 3 display name = Nature & Weekend
- [ ] Course 3 survey/storylines/roleplays/questions all resolve
- [ ] each course has exactly one canonical storyline per group and three level variants
- [ ] adding a future course does not require editing a hardcoded course-id union
- [ ] if auto discovery is implemented, CourseSelector is data-driven
