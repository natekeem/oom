# 15. Suggested File Mapping

실제 저장소를 다시 읽은 뒤 경로는 조정하되 다음 의도를 유지하세요.

| 기존 | 새 역할 |
|---|---|
| `src/data/fixedSurvey.ts` | 전체 survey option taxonomy 유지 |
| `src/data/scripts.ts` | Course1 advanced source 또는 training data로 migration |
| `src/data/additionalScripts.ts` | Story B UI 제거 후 legacy/future course 후보 |
| `src/data/scriptTrainingData.ts` | canonical storyline variation 훈련으로 유지 |
| `src/data/additionalScriptTraining.ts` | Story B 제거 후 필요한 것만 migration |
| `src/data/roleplays.ts` | Course1 roleplay source/migration |
| `src/data/additionalRoleplays.ts` | future course 후보 선별 |
| `src/data/questions.ts` | Course×Level question registry로 migration |
| `src/types.ts` | 새 training types 추가/분리 |
| `TrainingHub.tsx` | no-selection setup + selected STEP hub |
| `BackgroundSurveySheet` | current course recommendation 계산 |
| `DifficultyGuide` | current level preset |
| `ScriptHub/Dashboard` | Story A/B 제거, canonical story render |
| `Roleplay` view | resolved roleplay level |
| `PracticeView` | filtered pool + level-aware AI feedback |
| `AppShell` | current course/level summary optional |
