# ACCEPTANCE_CRITERIA.md

## Must-pass UX

- [ ] STEP 2 is shown as `추천 서베이 익히기`.
- [ ] OPIc guide has `시험 화면 · 조작법`.
- [ ] Guide page uses a recognizable interviewer / replay / recording / progress / Next model.
- [ ] STEP 6 answering phase does not look like an analytics dashboard.
- [ ] EVA/interviewer is a strong visual anchor.
- [ ] Question listening is capped at 2 per attempt.
- [ ] `OOM 연습 목표` is clearly not described as an official per-question limit.
- [ ] Recording state is obvious without finding the Recorder card.
- [ ] Transcript/AI feedback are hidden or visually secondary while speaking.
- [ ] After answer, review order is Recording → STT → AI.
- [ ] STT existence is visible even when unconfigured.
- [ ] STT settings CTA exists when unconfigured.
- [ ] Manual `음성을 텍스트로 변환` exists when configured.
- [ ] STT error remains visible and has retry.
- [ ] Transcript remains editable.
- [ ] Same-question retry resets the attempt but keeps the question.
- [ ] Existing recorder discard and stale-STT guards still work.
- [ ] Mobile layout stacks naturally.
- [ ] Static SEO/docs match the new UI.

## Must-pass engineering

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
```
