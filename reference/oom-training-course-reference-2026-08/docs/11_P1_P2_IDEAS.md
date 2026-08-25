# 11. P1 / P2 발전 아이디어

P0 구현이 안정된 뒤 고려합니다.

## P1 — Level-up Diff

같은 Course에서 상위 구간으로 이동할 때 단순 text diff가 아니라 **기능 diff** 표시.

예:

이미 아는 것:
- place
- routine
- reason

이번에 추가:
- recent episode
- before/now
- unexpected problem
- alternative

## P1 — Continue / Level-up CTA

최근 selection:
`Course 1 / 2구간`

다음 진입:
- `이어서 학습`
- `같은 이야기로 1구간 도전`

두 CTA.

## P1 — Course progress

`oom-training-progress-v1`

처음부터 지나치게 세분화하지 말고:
- storyline seen
- practice count
- roleplay count
정도부터.

## P1 — Survey Coverage Map

각 master storyline 카드에:
`이 이야기 하나로 커버: 공원 · 해변 · 걷기 · 조깅 · 국내여행 · 해외여행`

를 보여줌.

이 기능은 OOM의 효율성을 사용자가 즉시 이해하게 해 줌.

## P2 — Content Validator

빌드/테스트에서:
- 3 level 누락
- invalid survey id
- roleplay level 누락
- question pool 부족
- course reference 오류
를 자동 실패.

`reference/validateTrainingContent.reference.ts` 참고.

## P2 — Internal Course Authoring

정적 앱을 유지하면서 dev-only JSON import/export tool 가능.

일반 사용자 화면에는 노출하지 않음.

## P2 — AI Variation Drill

AI에게:
- core facts 유지
- 질문만 변경
- current level complexity 유지
- 새로운 unique fact 최소화

하도록 요청.

'답변을 새로 생성'하는 AI가 아니라 `내가 가진 한 장면을 다른 문제로 바꾸는 코치`로 포지셔닝.
