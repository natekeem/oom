# Integrated Audit Resolution

> **Status: HISTORICAL RESOLUTION RECORD (2026-08-22).** This maps two audit snapshots to their implementation pass; it is not a current backlog or architecture document.

이 문서는 `AUDIT_UI_UX_PRODUCT.md`와 `AUDIT_OPIC_INSTRUCTOR.md`의 findings를 2026-08-22 implementation pass에 연결합니다. 두 원본 audit 문서는 수정하거나 삭제하지 않습니다.

| Finding | Action | Status | Regression / evidence |
| --- | --- | --- | --- |
| STEP 6가 1024px에서 겹침 | Exam console의 바깥 2열 전환을 `xl`로 늦추고 1024~1279px는 단일 열로 유지 | Resolved | `PracticeView.test.tsx`; 1024/1100/1280/1440 visual QA |
| Mobile drawer가 modal keyboard contract를 충족하지 않음 | dialog/aria-modal, trigger 상태, focus 진입·trap, Escape, inert background, focus 복원, route close 구현 | Resolved | `App.test.tsx`; mobile visual QA |
| 숨겨진 Recorder에 focus 가능한 중복 control 존재 | `Recorder`에 `engine` mode를 추가해 lifecycle만 렌더 | Resolved | `PracticeView.test.tsx`; `TrainingCourse.test.tsx` recorder contracts |
| prompt가 screen reader에 중복 노출 | 한 prompt node의 visible/sr-only 상태만 전환 | Resolved | `PracticeView.test.tsx` |
| 모바일 annotation/touch target 충돌 | guide annotation을 모바일에서 흐름 안에 배치하고 실제 action 높이를 44px 이상으로 보강 | Resolved | 390px guide visual QA |
| Level label/time이 화면별로 다름 | `TRAINING_LEVELS`와 `formatTrainingPreset`을 단일 display source로 사용 | Resolved | `TrainingCourse.test.tsx` preset assertions |
| STEP 1에 제작자 용어가 노출됨 | Level 추천 대상과 course별 learner summary/recommended-for 필드로 교체 | Resolved | STEP 1 component + visual QA |
| STEP 3 slider가 실제 설정처럼 보임 | `시험 난이도 선택 시뮬레이션`으로 명명하고 selection 비변경 안내 및 선택 Level 강조 | Resolved | STEP 3 component + visual QA |
| replacement가 Level 공용 긴 문단 | function cue, KEEP/CHANGE/DROP, 세 Level micro-example로 정규화 | Resolved | `TrainingCourse.test.tsx` replacement completeness |
| variant가 anchor와 다른 새 story를 만듦 | 7개 충돌 pivot의 장소·사람·행동·object를 원 anchor로 복원하고 모든 variant의 `newFacts` 계약을 명시 | Resolved | explicit NEW-fact + canonical continuity regressions |
| blueprint가 paragraph index에 묶임 | raw 문단과 분리한 OPEN/SCENE/CLOSE 학습 구간을 복원하고 ANSWER·ACTION·RESULT를 내부 기능 badge로 유지 | Resolved | `scriptLearningSections.test.ts`; `ScriptTrainingTabs.test.tsx` |
| Foundation recent-experience 문법/주제 병렬 나열 | 3개 코스 12문항을 자연스러운 과거 시제와 단일 topic family로 교정 | Resolved | `TrainingCourse.test.tsx` grammar/count/distribution |
| Advanced에 문제/교훈 type이 기계적으로 강제됨 | anchor가 자연스럽게 지원하는 preference/comparison/change/opinion으로 9개 type 재분배 | Resolved | question source review + allowed type regression |
| Course 3 Intermediate type metadata 불일치 | reason/change를 요구하는 8개 문항의 metadata를 실제 기능과 정렬 | Resolved | question source review |
| 롤플레이 6단계가 필수 순서처럼 보임 | CORE 3기능과 OPTIONAL 메뉴로 표시하고 6개 전부 불필요 안내 | Resolved | `TrainingCourse.test.tsx`; STEP 5 visual QA |
| manifest roleplay ID와 실제 데이터 불일치 | course-1 manifest를 포함한 모든 manifest를 실제 3개 ID와 일치시킴; 학습 기능 표시 | Resolved | `TrainingCourse.test.tsx` manifest/data equality |
| STEP 4/5 모바일에서 연습 CTA가 늦음 | STEP 4 compact story select·학습 순서, STEP 5 최상단 scenario CTA·접는 reference 적용 | Resolved | mobile visual QA |
| 미설정 overview의 활성 CTA 모순 | STEP 2~6을 모두 STEP 1 setup action으로 연결 | Resolved | `TrainingCourse.test.tsx` |
| Home CTA label/destination 불일치 및 긴 본문 | overview와 STEP 1 CTA를 분리하고 editorial guide를 crawler-visible `<details>`로 정돈 | Resolved | `App.test.tsx`; static artifact verification |
| STEP 6 coaching이 상세 진단부터 강조 | KEEP/FIX/RETRY를 최상단 카드로 만들고 상세 진단을 접음 | Resolved | `PracticeView.test.tsx` |
| AI fallback이 story hint를 자동 확장 | fallback을 review에만 표시하고 story hint는 사용자 action으로 유지 | Resolved | `PracticeView.test.tsx` |
| Advanced 답변이 길고 filler가 필수처럼 보임 | 원문과 3문단 rhythm은 보존하고, 본론 안의 최대 2문장만 muted 선택 확장으로 표시하며 결론은 CORE에 유지 | Resolved | `scriptLearningSections.test.ts`; `ScriptDetail.tsx`; visual QA |
| Course 1 survey의 cooking/overseas 간접 coverage가 불투명 | STEP 2 coverage에 직접 대응이 아닌 활용 범위를 짧게 명시 | Resolved | survey source + visual QA |
| 초기 main chunk가 약 800KB | route-level `React.lazy`/`Suspense` 적용, 새 dependency 없이 initial chunk를 500KB 아래로 축소 | Resolved | production build measurement |

## Preserved contracts

- Course × Level, auto registry, TrainingSelection/SelectionGuard, six STEP flow
- STEP 2의 추천/연습과 파트별/전체 보기 두 축
- 12개 핵심 이야기와 세 Level continuity; Course 1 Advanced source text
- STEP 4의 메인 스토리·질문별 변형·답변 설계 개념
- EVA, 0/2 listen count, Recorder, optional STT, editable transcript, AI fallback, same-question retry
- Browser-only static GitHub Pages architecture와 기존 Button/Card/semantic color system

## Required validation

최종 판정은 `npm run lint`, `npm run test`, `npm run build`, `npm run verify:pages`, `npm run docs:generate`, `npm run docs:check`와 light/dark viewport visual QA가 모두 통과한 상태를 기준으로 합니다.
