# OOM Training Course Reference Pack — 2026-08

이 폴더는 `natekeem/oom`의 현재 OPIc 실전 훈련을 **목표 구간(Level) × 훈련 코스(Course)** 구조로 개편하기 위한 설계·콘텐츠·reference code 묶음입니다.

## Codex/Code Agent에게 가장 먼저 시킬 일

저장소 루트에 이 폴더를 그대로 넣은 뒤 다음처럼 지시하세요.

> `oom-training-course-reference-2026-08/docs/08_CODEX_MASTER_PROMPT.md`를 먼저 읽고, 그 문서에서 요구하는 저장소 문서와 reference pack의 나머지 문서를 순서대로 읽은 다음 전체 작업을 수행해. 중간에 구조를 임의로 단순화하지 말고 acceptance criteria와 검증 명령까지 완료해.

## 읽는 순서

1. `docs/00_EXECUTIVE_SUMMARY.md`
2. `docs/01_FINAL_PRODUCT_MODEL.md`
3. `docs/02_CURRENT_REPO_ANALYSIS.md`
4. `docs/03_TARGET_ARCHITECTURE.md`
5. `docs/04_CONTENT_AUTHORING_RULES.md`
6. `docs/05_COURSE_CONTENT_SPEC.md`
7. `docs/06_UI_UX_FLOW.md`
8. `docs/07_MIGRATION_PLAN.md`
9. `docs/08_CODEX_MASTER_PROMPT.md`
10. `docs/09_ACCEPTANCE_CRITERIA.md`
11. `docs/10_SOURCE_NOTES.md`
12. `docs/11_P1_P2_IDEAS.md`
13. `docs/12_CONTENT_AUDIT.md`

## 핵심 결정

- 현재 `scripts.ts`의 4개 main script = **Course 1 · Everyday & Getaway / 1구간(advanced, AL 목표)** 기준 콘텐츠.
- Story Set A/B 선택 UI는 제거.
- 질문별 pivot/variation 훈련은 **유지**.
- 사용자가 고르는 것은 딱 두 가지:
  1. 목표 구간
  2. 훈련 코스
- Course = 서베이 + 이야기 세계.
- Level = 난이도 + 답변 밀도/기능.
- `Course × Level`이 STEP 1~5 전체 컨텍스트를 결정.
- 서버/DB는 추가하지 않고 현재 static app 철학 유지.

## 콘텐츠

`content/`에는 Course 1, Course 2, Course 3의:
- Survey preset
- 4 master storylines × 3 levels
- Roleplay × 3 levels
- Practice questions (각 course 36개)
가 들어 있습니다.

## 주의

이 자료는 특정 OPIc 등급을 보장하지 않습니다. 스크립트는 통암기용 정답지가 아니라 **하나의 장면을 여러 질문에 맞게 변형하는 연습용 scaffold**입니다.


## Initial launch courses

1. **Everyday & Getaway** — 현재 OOM 기반 균형형
2. **Culture & City** — 공개 2025~2026 전략과 가장 가까운 준비 효율 추천형
3. **Nature & Weekend** — 공원/하이킹/캠핑/사진 중심 아웃도어형

`docs/13_COURSE_STRATEGY_REVIEW.md`에서 세 코스의 OPIc 적합성을 재점검했고, `docs/14_ADDING_FUTURE_COURSES.md`에 Course 4+ 추가 방식을 정리했다.
