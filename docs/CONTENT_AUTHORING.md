# OOM Content Authoring

This guide is the canonical procedure for adding a Course or changing a script, roleplay, practice question, or TTS-covered preview.

## Data Ownership

Each active Course is one directory:

```text
src/data/training/courses/course-N/
├─ manifest.ts
├─ survey.ts
├─ storylines.ts
├─ variants.ts
├─ replacementGuides.ts
├─ roleplays.ts
├─ questions.ts
└─ index.ts
```

`index.ts` exports one `CourseBundle`. `src/training/courseRegistry.ts` discovers it automatically; do not add a manual central Course list.

Other owners:

- Level definitions: `src/training/levels.ts`
- survey form structure and rehearsal scoring: `src/data/fixedSurvey.ts`
- Course 1 Advanced regression reference: `src/data/scripts.ts`
- voice preview phrases: `src/lib/tts/voiceConfig.ts`
- shared self-introduction guide and warm-up: `src/data/training/selfIntroduction.ts`

Do not place Course-specific copy in general route components or SEO metadata.

## Add a New Course

### 1. Choose the Course identity

Create the next `course-N` directory. `TrainingCourseId` accepts `course-${number}`. IDs must be stable once released because selection storage, content references, and generated TTS sources use them.

In `manifest.ts` define:

- ID, version, title, subtitle, descriptions, recommended-for copy;
- `surveyPresetId` matching `survey.ts`;
- four ordered `storylineIds` matching `storylines.ts`;
- the current three ordered `roleplayIds` matching `roleplays.ts`;
- `practiceQuestionPoolId`;
- `status: "ready"` only when the complete bundle passes validation.

The architecture does not assume there will always be three Courses. Do not change general UI copy to “three Courses.”

### 2. Author the survey preset

In `survey.ts`, connect the Course to existing full-survey option IDs:

- profile/residence IDs;
- at least the current tested activity coverage;
- a learner-facing display summary and strategy note.

`src/data/fixedSurvey.ts` remains the owner of the full survey-like list and rehearsal scoring. A Course preset selects/recommends from it; it does not redefine the form.

### 3. Author four canonical storylines

The current generic slot UI expects four ordered storylines. Every storyline needs:

- unique ID and matching Course ID;
- group/title and bilingual `baseQuestion`;
- relevant survey option IDs;
- one stable `core.anchorScene` and reusable `core.facts`;
- `advanced`, `intermediate`, and `foundation` content.

All three Levels describe the same people/place/event/object world. Change density and language complexity, not the underlying story. Preserve the Level target-duration intent from `src/training/levels.ts` without treating editorial word counts as official proficiency criteria.

Course 1 Advanced is protected. If it changes intentionally, review the regression reference in `src/data/scripts.ts` and obtain explicit scope approval.

### 4. Add variants

In `variants.ts`, create a `ScriptVariantSet` for every storyline. Current regression checks require at least four variants and a complete blueprint.

Each variant needs:

- stable ID and learner-facing label;
- bilingual question;
- prompt function/type;
- pivot explanation and facts to keep;
- explicit `newFacts` array, with no more than the minimal two facts;
- consistent `requiredFacts` and `optionalFacts` when used.

Variants redirect one canonical story. They do not store a second full canonical script. An `englishExample` is not the active full-answer source.

### 5. Add replacement guides

In `replacementGuides.ts`, key each guide as `storylineId:variantId`. Use `defineReplacementGuides` so legacy block names are normalized to the current function blocks.

Every replacement owns:

- instruction and function cue;
- facts to keep/change/drop;
- Foundation, Intermediate, and Advanced micro-examples.

Do not let Foundation fall back to Advanced content. An empty replacement list is acceptable only when the canonical answer already fits the prompt and the guide explains why.

### 6. Add roleplays

In `roleplays.ts`, provide the current three Course-owned scenarios declared by the manifest. Each scenario needs:

- distinct ID, group, title, situation, and learning function;
- fixed prompt and answer structure;
- Level-specific `englishExample` and focus for all three Levels.

Use the shared CORE/OPTIONAL function model. Do not force all six functions into every answer, and do not derive roleplay count from the four storylines.

### 7. Add practice questions

In `questions.ts`, current structural tests require at least 12 questions for each Level. Every question needs:

- unique ID;
- matching Course and Level IDs;
- an existing storyline ID and group;
- communicative type matching the actual prompt;
- English prompt.

Question pools must be isolated by Course and Level. Avoid using one Course as a silent fallback for another.

### 8. Assemble and resolve

In `index.ts`, assemble all eight data owners into one `CourseBundle`. Then use `resolveTrainingContext(newCourseId, levelId)` in a focused test or dev check for each Level.

Verify:

- manifest IDs equal actual ordered records;
- all Level keys exist;
- sidebar slot labels use the new groups;
- STEP 2~6 render after selecting the new Course;
- unselected routes still go to STEP 1 instead of defaulting to the new Course.

Add course-specific regression expectations where needed. General structural tests should iterate `discoveredCourses` so future Courses are covered automatically.

## TTS Inventory and Asset Workflow

Fixed playable English content is content-addressed. Changing punctuation, spacing after normalization, or wording may change a SHA-256 text hash and therefore the required audio directory.

Start by regenerating the inventory:

```bash
npm run tts:audit
```

This updates tracked `artifacts/tts-inventory.json` and creates an ignored local Markdown report at `docs/generated/tts-inventory.md`. Inspect the new unique-text and category counts. When a new Course changes total coverage, intentionally update `STATIC_TTS_EXPECTED_TEXTS`, `STATIC_TTS_EXPECTED_TARGETS`, and the category count contract in `scripts/static-tts-assets.mjs`; these are release coverage assertions, not a three-Course architecture assumption.

Then run:

```bash
npm run tts:generate
```

The command starts a local generator server and prints a dev-only URL. Open it, choose `생성 시작`, and wait for completion. FFmpeg and ffprobe must be available through `PATH` or `OOM_FFMPEG_PATH` / `OOM_FFPROBE_PATH`.

The generator scans current assets first. Unchanged valid hash/voice pairs are skipped; only missing or invalid targets are synthesized and encoded. Do not delete or regenerate the entire corpus merely because one text changed. Do not run the validator against knowingly incomplete coverage merely to discover missing files: incomplete validation removes the production manifest by design, while the generator already reports its hit/missing plan.

After generation:

```bash
npm run tts:validate -- --prune-dry-run
```

Review the dry-run list. Do not perform an actual prune without explicit authorization. Commit a content change only with its updated inventory, new/changed audio and peaks, and production manifest.

See [TTS_AUDIO_PIPELINE.md](TTS_AUDIO_PIPELINE.md) for the runtime and generated-file contract.

## Full Validation

After content and TTS coverage are complete:

```bash
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
git diff --check
```

`npm run tts:generate` is intentionally not part of CI or a convenience chain: it may be long-running, needs browser interaction and local FFmpeg, and should run only when the audit identifies missing content hashes.

Before handoff, inspect `git status`, the exact diff, and all generated binary changes. Do not commit or push unless explicitly requested.
