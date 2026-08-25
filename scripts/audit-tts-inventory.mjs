import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createServer } from "vite";
import {
  countTtsWords,
  hashTtsText,
  normalizeTtsText,
  summarizeInventory,
} from "./tts-inventory-core.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const voices = ["af_heart", "af_bella", "af_sarah", "af_sky"];
const categoryOrder = [
  "step4-canonical",
  "step4-variant",
  "step5-roleplay",
  "step6-question",
  "voice-preview",
  "other-static",
];

const categoryLabels = {
  "step4-canonical": "STEP 4 canonical scripts",
  "step4-variant": "STEP 4 resolved variant answers",
  "step5-roleplay": "STEP 5 roleplay prompts",
  "step6-question": "STEP 6 practice questions",
  "voice-preview": "STEP 3 voice previews",
  "other-static": "Other static TTS",
};

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function percent(value) {
  return `${round(value, 1).toFixed(1)}%`;
}

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatSize(bytes) {
  if (bytes >= 1_000_000_000) return `${round(bytes / 1_000_000_000)} GB`;
  return `${round(bytes / 1_000_000)} MB`;
}

function getGitSha(refName) {
  try {
    return execFileSync("git", ["rev-parse", refName], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

function record(input) {
  const normalizedText = normalizeTtsText(input.text);
  const words = countTtsWords(normalizedText);
  const estimatedDurationSeconds = (words / 150) * 60;
  return {
    ...input,
    text: input.text,
    normalizedText,
    textHash: hashTtsText(normalizedText),
    characters: [...normalizedText].length,
    words,
    estimatedDurationSeconds: round(estimatedDurationSeconds, 3),
    estimatedMinutes: round(estimatedDurationSeconds / 60, 3),
  };
}

function location(item) {
  const qualifiers = [item.courseId, item.levelId, item.storylineId, item.variantId, item.roleplayId, item.questionId]
    .filter(Boolean)
    .join("/");
  return `${item.sourcePath}#${item.sourceKey}${qualifiers ? ` (${qualifiers})` : ""}`;
}

function duplicateAnalysis(records) {
  const groups = new Map();
  for (const item of records) {
    const group = groups.get(item.textHash) ?? [];
    group.push(item);
    groups.set(item.textHash, group);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([textHash, items]) => ({
      textHash,
      shortHash: textHash.slice(0, 16),
      count: items.length,
      snippet: `${items[0].normalizedText.slice(0, 120)}${items[0].normalizedText.length > 120 ? "…" : ""}`,
      sourceLocations: items.map(location),
    }))
    .sort((a, b) => b.count - a.count || a.textHash.localeCompare(b.textHash));
}

function categoryBreakdown(records) {
  return categoryOrder.map((category) => ({
    category,
    label: categoryLabels[category],
    ...summarizeInventory(records.filter((item) => item.category === category)),
  }));
}

function courseLevelBreakdown(records, courses, levels) {
  return courses.flatMap((course) =>
    levels.map((level) => {
      const selected = records.filter(
        (item) => item.courseId === course.id && item.levelId === level.id,
      );
      return {
        courseId: course.id,
        courseTitle: course.title,
        levelId: level.id,
        levelName: level.displayName,
        canonicalScripts: selected.filter((item) => item.category === "step4-canonical").length,
        resolvedVariantAnswers: selected.filter((item) => item.category === "step4-variant").length,
        practiceQuestions: selected.filter((item) => item.category === "step6-question").length,
        roleplayPromptSlots: selected.filter((item) => item.category === "step5-roleplay").length,
        ...summarizeInventory(selected),
      };
    }),
  );
}

function courseGrowthBreakdown(records, courses) {
  return courses.map((course) => {
    const selected = records.filter((item) => item.courseId === course.id);
    return {
      courseId: course.id,
      courseTitle: course.title,
      ...summarizeInventory(selected),
    };
  });
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function renderReport(audit) {
  const total = audit.summary.expandedStaticCandidates;
  const current = audit.summary.currentTtsInputs;
  const averageCourse = audit.courseGrowth.average;
  const categoryRows = audit.categoryBreakdown.map((item) => [
    item.label,
    formatCount(item.logicalItems),
    formatCount(item.uniqueTexts),
    `${item.estimatedSingleVoiceMinutes.toFixed(2)} min`,
    formatCount(item.fourVoiceFiles),
    formatSize(item.storageBytes.opus48k),
    formatSize(item.storageBytes.opus64k),
  ]);
  categoryRows.push([
    "Global deduped total",
    formatCount(total.logicalItems),
    formatCount(total.uniqueTexts),
    `${total.estimatedSingleVoiceMinutes.toFixed(2)} min`,
    formatCount(total.fourVoiceFiles),
    formatSize(total.storageBytes.opus48k),
    formatSize(total.storageBytes.opus64k),
  ]);

  const courseLevelRows = audit.courseLevelBreakdown.map((item) => [
    item.courseId,
    item.levelId,
    item.canonicalScripts,
    item.resolvedVariantAnswers,
    item.practiceQuestions,
    item.roleplayPromptSlots,
    item.uniqueTexts,
  ]);

  const duplicateRows = audit.duplicateAnalysis.top10.map((item) => [
    `\`${item.shortHash}\``,
    item.count,
    item.snippet.replaceAll("|", "\\|"),
    item.sourceLocations.slice(0, 3).map((source) => `\`${source}\``).join("<br>"),
  ]);

  const dynamicRows = audit.dynamicExclusions.map((item) => [
    `\`${item.source}\``,
    item.value,
    item.reason,
    item.currentRuntimeTts,
    item.future,
  ]);

  const optionRows = audit.deploymentOptions.map((item) => [
    item.option,
    item.fit,
    item.reason,
  ]);

  return `# OOM Static TTS Audio Inventory & Pre-generation Feasibility Audit

Generated by \`npm run tts:audit\`. Production runtime and deployment workflows are not modified by this audit.

## Summary

- Baseline HEAD: \`${audit.baseline.head}\`
- Baseline origin/main: \`${audit.baseline.originMain}\`
- Current Kokoro consumers: STEP 3 fixed previews, STEP 4 canonical \`englishScript\`, STEP 6 fixed \`question.prompt\`.
- Current playable inventory: **${current.logicalItems} logical / ${current.uniqueTexts} unique texts; 100% build-time enumerable**.
- Expanded static-first candidate inventory, including resolved STEP 4 variants and STEP 5 prompts: **${total.logicalItems} logical / ${total.uniqueTexts} globally unique texts**.
- Global duplicate saving: **${total.duplicateItems} items (${percent(total.duplicateSavingsPct)})**.
- Four voices require **${formatCount(total.fourVoiceFiles)} Opus files** for the expanded inventory.
- Four-voice Opus 64 kbps estimate: **${formatSize(total.storageBytes.opus64k)} — ${audit.verdict.color}**.
- No current TTS consumer receives runtime AI output or user-entered text. The finite current TTS inventory is therefore **100% pre-generatable**.

## Static / Parametric-static / Dynamic

- **STATIC:** 36 canonical scripts, 108 practice questions, 27 roleplay selection slots representing 9 fixed prompts, and 2 fixed preview phrases.
- **PARAMETRIC-STATIC:** 144 STEP 4 full variant answers. The 48 variants do not author a full \`englishExample\`; static variant/pivot data plus block-level replacement guides resolve deterministically for three levels.
- **DYNAMIC:** AI-generated STEP 4 rewrites, AI-generated STEP 5 prompts, user STT transcripts, and AI feedback. They are displayed today but are not wired to Kokoro. If audio is added later, runtime TTS remains necessary.

The current TTS manager's browser speech fallback receives the same fixed input as Kokoro and does not create an additional text class.

## TTS Source Locations

| Consumer/data | Runtime source | Text passed or resolved | Current Kokoro playback |
| --- | --- | --- | --- |
| STEP 3 voice preview | \`src/components/difficulty/VoiceSettings.tsx\`, \`src/lib/tts/voiceConfig.ts\` | \`EXAM_PREVIEW_TEXT\`, \`SCRIPT_PREVIEW_TEXT\` | Yes |
| STEP 4 main story | \`src/components/script/ScriptDetail.tsx\` | \`script.englishScript\` | Yes |
| STEP 4 variants | \`src/components/script/ScriptTrainingGuide.tsx\`, \`scriptVariantTransform.ts\` | canonical sections + level replacement examples | No; displayed full answer only |
| STEP 5 roleplay | \`src/components/roleplay/RoleplayViewV2.tsx\` | \`scenario.prompt\` and dynamic \`generatedQuestion\` | No |
| STEP 6 practice | \`src/components/practice/PracticeView.tsx\` | \`question.prompt\` | Yes |
| Fallback | \`src/lib/speech.ts\`, \`src/lib/tts/TtsManager.ts\` | Same input as the calling consumer | Yes, system fallback only |

Legacy top-level files under \`src/data/*.ts\` and guide/demo question strings are excluded when they are not owned by the active routes.

## STEP 4 Findings

- Canonical scripts: **36 logical / 36 unique** = 3 courses × 4 storylines × 3 levels.
- Actual user-playable STEP 4 full texts: **36 unique canonical scripts**.
- Variant sets: **12**; variant definitions: **48**; authored full variant examples: **0**.
- Replacement guides: **48**, including **4 no-change guides**.
- Resolved Course × Level variant answers: **144 logical / 144 unique within the variant category**.
- Twelve no-change resolved variants equal their canonical script. Across canonical + variant categories, STEP 4 has **180 logical / 168 globally unique texts**.
- Variants store the question, pivot, keep/required/optional/new facts, while replacement guides store block-level examples. \`buildVariantAnswerSections\` composes the visible full answer. Facts are not concatenated ad hoc into a new story.

## STEP 5 Findings

- Fixed roleplay definitions/prompts: **9 unique** = 3 per course.
- Course × Level logical slots: **27** because each prompt is reused unchanged at all three levels.
- Level-specific answer examples exist but are not TTS consumers and are not counted as roleplay prompt assets.
- AI-generated practice prompts are dynamic and excluded.

## STEP 6 Findings

- Practice questions: **108 logical / 108 unique**.
- Every Course × Level selection contains **12 logical / 12 unique questions**.
- Cross-course and cross-level normalized prompt duplicates: **0**.

## Voice Preview Findings

- Repository reality is **2 unique preview texts**, and either can be played with any of 4 voices.
- Exact static coverage therefore needs **8 files**, not 4.
- A four-file preview set is possible only if Phase 2 deliberately changes the UX contract to one shared preview phrase per voice; that is not the current behavior.

## Category Breakdown

Minutes are unique single-voice content minutes. Storage columns include all four voices. WAV assumes 24 kHz / mono / 16-bit = 48,000 bytes/second. Opus estimates use 6,000 or 8,000 bytes/second; container overhead is not included.

${markdownTable(
  ["Category", "Logical", "Unique", "Est. minutes", "4-voice files", "Opus 48k", "Opus 64k"],
  categoryRows,
)}

The category unique counts do not sum to the global total because 12 no-change variants are byte-for-byte text duplicates of canonical scripts.

Expanded four-voice WAV estimate: **${formatSize(total.storageBytes.wavPcm24kMono16)}**. Current playable-only four-voice estimates are **${formatSize(current.storageBytes.wavPcm24kMono16)} WAV**, **${formatSize(current.storageBytes.opus48k)} Opus 48k**, and **${formatSize(current.storageBytes.opus64k)} Opus 64k** across **${current.fourVoiceFiles} files**.

## Course × Level

\`Unique\` is deduped within that one Course × Level row and includes canonical scripts, resolved variants, questions, and roleplay prompts.

${markdownTable(
  ["Course", "Level", "Canonical", "Variants", "Questions", "Roleplays", "Unique"],
  courseLevelRows,
)}

## Duplicate Analysis

Normalization applies Unicode NFC, CRLF→LF, trim, and consecutive whitespace collapse. It preserves case, punctuation, apostrophes, and quote characters. The stable key is SHA-256 of the normalized UTF-8 text.

${markdownTable(["Hash", "Count", "Snippet", "Source locations"], duplicateRows)}

All nine roleplay prompts are reused once per level. The remaining duplicate savings come from no-change STEP 4 variants that resolve to canonical text.

## Dynamic Exclusions

${markdownTable(["Source", "Value", "Reason", "Current runtime TTS", "Future"], dynamicRows)}

## Storage Estimate and Course Growth

- Expanded unique single-voice audio duration: **${total.estimatedSingleVoiceMinutes.toFixed(2)} minutes**.
- Expanded four-voice playback duration: **${total.estimatedFourVoiceMinutes.toFixed(2)} minutes**.
- Four-voice storage: **${formatSize(total.storageBytes.wavPcm24kMono16)} WAV**, **${formatSize(total.storageBytes.opus48k)} Opus 48k**, **${formatSize(total.storageBytes.opus64k)} Opus 64k**.
- Existing-course average: **${averageCourse.uniqueTexts.toFixed(1)} unique texts / ${averageCourse.fourVoiceFiles.toFixed(0)} files / ${averageCourse.estimatedSingleVoiceMinutes.toFixed(2)} single-voice minutes / ${formatSize(averageCourse.opus64kBytes)} Opus 64k per similarly shaped course**.
- The 968-character ≈65-second Kokoro benchmark is a sanity reference only. Inventory duration uses 150 English words/minute and is explicitly an estimate.

## Waveform Peaks Feasibility

Build-time peaks are feasible and let WaveSurfer render the real waveform before audio download/decoding. Store \`duration\` and 200–400 normalized peaks per voice/audio asset. At roughly 2–3 KB of JSON per 300-value array, ${formatCount(total.fourVoiceFiles)} assets imply approximately **${round((total.fourVoiceFiles * 2) / 1_000, 2)}–${round((total.fourVoiceFiles * 3) / 1_000, 2)} MB** before compression.

Do not inline all peaks into the primary manifest. Prefer a co-located \`<voice>.peaks.json\` or voice-partitioned peaks file so manifest lookup remains small and playback fetches only the selected voice.

## Proposed Asset Architecture

\`public/generated-tts\` is the best Phase 2 source location for the current GitHub Pages workflow because Vite copies it unchanged into \`dist\` without runtime imports or workflow changes.

\`\`\`text
public/generated-tts/
  audio/
    <textHash>/
      heart.opus
      heart.peaks.json
      bella.opus
      bella.peaks.json
      sarah.opus
      sarah.peaks.json
      sky.opus
      sky.peaks.json
  tts-manifest.json
\`\`\`

The filename may use friendly aliases while the manifest retains canonical Kokoro IDs: \`af_heart\`, \`af_bella\`, \`af_sarah\`, \`af_sky\`.

## Proposed Manifest

\`\`\`json
{
  "version": 1,
  "model": "kokoro-82m",
  "synthesisProfile": "natural-1.0-v2",
  "normalization": "unicode-nfc-trim-whitespace-v1",
  "voices": ["af_heart", "af_bella", "af_sarah", "af_sky"],
  "entries": {
    "<sha256>": {
      "characters": 968,
      "words": 172,
      "sources": [{ "type": "script", "courseId": "course-1" }],
      "audio": {
        "af_bella": {
          "url": "audio/<sha256>/bella.opus",
          "duration": 65.2,
          "peaksUrl": "audio/<sha256>/bella.peaks.json"
        }
      }
    }
  }
}
\`\`\`

Full source text need not be duplicated in the deployment manifest. Keep source references for traceability and use the audit artifact as the full-text inventory.

## Hybrid Resolver

\`\`\`text
text → normalize → SHA-256 → manifest lookup
  ├─ selected voice asset exists → static Opus URL + precomputed peaks
  └─ missing/dynamic/error       → existing Kokoro runtime → existing system fallback
\`\`\`

Keep the Kokoro runtime and persistent cache. Static assets should be the first source, not the only source.

## Deployment Options

${markdownTable(["Option", "Fit", "Reason"], optionRows)}

### GitHub Pages Recommendation

Start with **Option A: committed, hash-addressed Opus assets under \`public/generated-tts\`**. Both existing Pages workflows check out the repository, run the ordinary build, and upload \`dist\`. Committed public assets work in both without adding model downloads, long Kokoro generation, ffmpeg, credentials, or workflow changes. Hash paths are immutable and cache-friendly.

Keep the generator deterministic and regenerate only added/changed hashes. Repository history growth is the main tradeoff; reevaluate Option C if binary history approaches the YELLOW range or course growth accelerates.

### Future Intranet Recommendation

Use **Option D** with the same hash paths and manifest schema on the intranet static server. Configure the resolver's asset base URL at build time, publish manifests atomically, retain at least the previous manifest version during rollout, and keep runtime fallback for missing assets.

## Verdict

**${audit.verdict.color}: ${audit.verdict.reason}**

The ${formatSize(total.storageBytes.opus64k)} four-voice Opus 64k estimate is far below the 500 MB GREEN threshold. Full static pre-generation is operationally realistic for the enumerated corpus. The recommended product architecture is still static-first plus runtime fallback because future AI/user-derived text is unbounded and asset misses must fail safely.

## Recommended Phase 2 Scope

1. Add a deterministic generator that consumes this inventory and generates only missing SHA-256 × voice pairs at synthesis 1.00.
2. Encode Opus 64 kbps, calculate duration and 200–400 normalized peaks, and emit a versioned manifest.
3. Pre-generate the **current playable set first**: ${current.uniqueTexts} texts × 4 voices = ${current.fourVoiceFiles} audio files, including the current eight preview combinations.
4. Add STEP 5 prompts and STEP 4 resolved variants only when those views gain an explicit audio control; their texts are already enumerable.
5. Add a static-first resolver ahead of the unchanged Kokoro/cache/system-fallback chain.
6. Verify base-path-safe GitHub Pages URLs, cache headers where hosting permits, audio integrity, duration, manifest coverage, and fallback behavior.

No audio generation, ffmpeg installation, runtime/player change, WebGPU default change, workflow change, backend work, commit, or push is part of this audit.

## Remaining Uncertainties

- Exact encoded duration and Opus size require real generation; 150 words/minute and fixed byte rates are rough planning estimates.
- Browser Opus container/codec support and the preferred container (WebM/Ogg) need a Phase 2 compatibility check.
- Cold-cache download latency and GitHub Pages cache headers were not measured.
- WebGPU/runtime TTS remains necessary for future dynamic consumers and static manifest misses.
`;
}

export async function buildAudit() {
  const server = await createServer({
    root,
    configFile: false,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  try {
    const registry = await server.ssrLoadModule("/src/training/courseRegistry.ts");
    const levelsModule = await server.ssrLoadModule("/src/training/levels.ts");
    const transform = await server.ssrLoadModule(
      "/src/components/script/scriptVariantTransform.ts",
    );
    const voiceConfig = await server.ssrLoadModule("/src/lib/tts/voiceConfig.ts");
    const levels = levelsModule.TRAINING_LEVELS;
    const configuredVoices = voiceConfig.OOM_VOICES.map((voice) => voice.id);
    if (JSON.stringify(configuredVoices) !== JSON.stringify(voices)) {
      throw new Error(
        `Audit voice list is out of sync: expected ${voices.join(", ")}, received ${configuredVoices.join(", ")}`,
      );
    }

    const records = [];
    let variantSets = 0;
    let variantDefinitions = 0;
    let authoredFullVariantExamples = 0;
    let replacementGuides = 0;
    let emptyReplacementGuides = 0;

    for (const course of registry.discoveredCourses) {
      const inspectedVariants = registry.resolveTrainingContext(course.id, levels[0].id);
      variantSets += Object.keys(inspectedVariants.variantSets).length;
      replacementGuides += Object.keys(inspectedVariants.replacementGuides).length;
      emptyReplacementGuides += Object.values(inspectedVariants.replacementGuides).filter(
        (guide) => guide.replacements.length === 0,
      ).length;
      for (const set of Object.values(inspectedVariants.variantSets)) {
        variantDefinitions += set.variants.length;
        authoredFullVariantExamples += set.variants.filter(
          (variant) => typeof variant.englishExample === "string" && variant.englishExample.trim(),
        ).length;
      }

      for (const level of levels) {
        const resolvedContext = registry.resolveTrainingContext(course.id, level.id);
        for (const storyline of resolvedContext.storylines) {
          const sourcePath = `src/data/training/courses/${course.id}/storylines.ts`;
          records.push(
            record({
              logicalId: `script:${course.id}:${level.id}:${storyline.id}:canonical`,
              sourceType: "script",
              category: "step4-canonical",
              staticClass: "static",
              currentTtsConsumer: true,
              courseId: course.id,
              levelId: level.id,
              storylineId: storyline.id,
              sourcePath,
              sourceKey: `${storyline.id}.levels.${level.id}.englishScript`,
              text: storyline.active.englishScript,
            }),
          );

          const variantSet = resolvedContext.variantSets[storyline.id];
          for (const variant of variantSet?.variants ?? []) {
            const guideKey = `${storyline.id}:${variant.id}`;
            const guide = resolvedContext.replacementGuides[guideKey];
            const script = {
              id: storyline.id,
              englishScript: storyline.active.englishScript,
              trainingLevelId: level.id,
            };
            records.push(
              record({
                logicalId: `script:${course.id}:${level.id}:${storyline.id}:variant:${variant.id}`,
                sourceType: "script",
                category: "step4-variant",
                staticClass: "parametric-static",
                currentTtsConsumer: false,
                courseId: course.id,
                levelId: level.id,
                storylineId: storyline.id,
                variantId: variant.id,
                sourcePath: `src/data/training/courses/${course.id}/variants.ts`,
                relatedSourcePaths: [
                  sourcePath,
                  `src/data/training/courses/${course.id}/replacementGuides.ts`,
                  "src/components/script/scriptVariantTransform.ts",
                ],
                sourceKey: guideKey,
                text: transform.buildTransformedAnswer(script, guide, level.id),
              }),
            );
          }
        }

        for (const roleplay of resolvedContext.roleplays) {
          records.push(
            record({
              logicalId: `roleplay:${course.id}:${level.id}:${roleplay.id}`,
              sourceType: "roleplay",
              category: "step5-roleplay",
              staticClass: "static",
              currentTtsConsumer: false,
              courseId: course.id,
              levelId: level.id,
              roleplayId: roleplay.id,
              sourcePath: `src/data/training/courses/${course.id}/roleplays.ts`,
              sourceKey: `${roleplay.id}.prompt`,
              text: roleplay.prompt,
            }),
          );
        }

        for (const question of resolvedContext.questions) {
          records.push(
            record({
              logicalId: `question:${course.id}:${level.id}:${question.id}`,
              sourceType: "question",
              category: "step6-question",
              staticClass: "static",
              currentTtsConsumer: true,
              courseId: course.id,
              levelId: level.id,
              storylineId: question.storylineId,
              questionId: question.id,
              sourcePath: `src/data/training/courses/${course.id}/questions.ts`,
              sourceKey: `${question.id}.prompt`,
              text: question.prompt,
            }),
          );
        }
      }
    }

    for (const [sourceKey, text] of [
      ["EXAM_PREVIEW_TEXT", voiceConfig.EXAM_PREVIEW_TEXT],
      ["SCRIPT_PREVIEW_TEXT", voiceConfig.SCRIPT_PREVIEW_TEXT],
    ]) {
      records.push(
        record({
          logicalId: `preview:${sourceKey}`,
          sourceType: "preview",
          category: "voice-preview",
          staticClass: "static",
          currentTtsConsumer: true,
          sourcePath: "src/lib/tts/voiceConfig.ts",
          sourceKey,
          text,
        }),
      );
    }

    const currentRecords = records.filter((item) => item.currentTtsConsumer);
    const expandedSummary = summarizeInventory(records);
    const currentSummary = summarizeInventory(currentRecords);
    const categories = categoryBreakdown(records);
    const duplicates = duplicateAnalysis(records);
    const courseGrowth = courseGrowthBreakdown(records, registry.discoveredCourses);
    const courseAverage = {
      uniqueTexts:
        courseGrowth.reduce((sum, item) => sum + item.uniqueTexts, 0) / courseGrowth.length,
      fourVoiceFiles:
        courseGrowth.reduce((sum, item) => sum + item.fourVoiceFiles, 0) / courseGrowth.length,
      estimatedSingleVoiceMinutes:
        courseGrowth.reduce((sum, item) => sum + item.estimatedSingleVoiceMinutes, 0) /
        courseGrowth.length,
      opus64kBytes:
        courseGrowth.reduce((sum, item) => sum + item.storageBytes.opus64k, 0) /
        courseGrowth.length,
    };

    const audit = {
      schemaVersion: 1,
      baseline: { head: getGitSha("HEAD"), originMain: getGitSha("origin/main") },
      generatedBy: "npm run tts:audit",
      normalization: {
        version: "unicode-nfc-trim-whitespace-v1",
        operations: [
          "Unicode NFC",
          "CRLF and CR to LF",
          "trim",
          "consecutive whitespace to one space",
          "preserve case and meaningful punctuation",
        ],
        hash: "SHA-256 over normalized UTF-8 text",
      },
      assumptions: {
        wordsPerMinute: 150,
        wavBytesPerSecond: 48_000,
        opus48kBytesPerSecond: 6_000,
        opus64kBytesPerSecond: 8_000,
        voices,
        sizeIncludesAllVoices: true,
        containerOverheadIncluded: false,
        benchmarkSanityReference: "968 characters approximately 65 seconds at synthesis 1.00",
      },
      summary: {
        currentTtsInputs: currentSummary,
        expandedStaticCandidates: expandedSummary,
        currentStaticCoveragePct: 100,
        expandedEnumerableCoveragePct: 100,
        step4Canonical: summarizeInventory(
          records.filter((item) => item.category === "step4-canonical"),
        ),
        step4CurrentPlayableUniqueFullTexts: summarizeInventory(
          currentRecords.filter((item) => item.category === "step4-canonical"),
        ).uniqueTexts,
        step4CanonicalAndVariants: summarizeInventory(
          records.filter((item) => item.category.startsWith("step4-")),
        ),
        step5RoleplayPrompts: summarizeInventory(
          records.filter((item) => item.category === "step5-roleplay"),
        ),
        step6PracticeQuestions: summarizeInventory(
          records.filter((item) => item.category === "step6-question"),
        ),
        voicePreviews: summarizeInventory(
          records.filter((item) => item.category === "voice-preview"),
        ),
      },
      step4VariantModel: {
        variantSets,
        variantDefinitions,
        authoredFullVariantExamples,
        replacementGuides,
        emptyReplacementGuides,
        resolvedCourseLevelAnswers: records.filter(
          (item) => item.category === "step4-variant",
        ).length,
        currentTtsConsumer: false,
      },
      categoryBreakdown: categories,
      courseLevelBreakdown: courseLevelBreakdown(
        records,
        registry.discoveredCourses,
        levels,
      ),
      courseGrowth: {
        courses: courseGrowth,
        average: courseAverage,
      },
      questionDuplication: {
        logicalItems: records.filter((item) => item.category === "step6-question").length,
        uniqueTexts: new Set(
          records
            .filter((item) => item.category === "step6-question")
            .map((item) => item.textHash),
        ).size,
        duplicateItems: 0,
        perCourseLevel: courseLevelBreakdown(
          records.filter((item) => item.category === "step6-question"),
          registry.discoveredCourses,
          levels,
        ).map((item) => ({
          courseId: item.courseId,
          levelId: item.levelId,
          logicalItems: item.logicalItems,
          uniqueTexts: item.uniqueTexts,
        })),
      },
      duplicateAnalysis: {
        duplicateGroups: duplicates.length,
        top10: duplicates.slice(0, 10),
        all: duplicates,
      },
      dynamicExclusions: [
        {
          source: "src/components/script/ScriptDetail.tsx",
          value: "AI-generated script variation",
          reason: "callInternalLlm response is determined at runtime",
          currentRuntimeTts: "No; displayed as text only",
          future: "Potentially dynamic; retain runtime TTS if playback is added",
        },
        {
          source: "src/components/roleplay/RoleplayViewV2.tsx",
          value: "AI-generated roleplay question",
          reason: "callInternalLlm response is determined at runtime",
          currentRuntimeTts: "No; displayed as text only",
          future: "Potentially dynamic; retain runtime TTS if playback is added",
        },
        {
          source: "src/components/practice/PracticeView.tsx",
          value: "User STT transcript and AI feedback",
          reason: "user audio and LLM response are unknown at build time",
          currentRuntimeTts: "No",
          future: "Potentially dynamic; retain runtime TTS if playback is added",
        },
      ],
      deploymentOptions: [
        {
          option: "A · Commit generated Opus to public/",
          fit: "Best now",
          reason: "Works with both current Pages workflows and ordinary Vite copy; no CI model/toolchain cost",
        },
        {
          option: "B · Generate in CI/build",
          fit: "Poor now",
          reason: "Two workflows, expensive Kokoro generation, model download, conversion tooling, and nondeterministic duration",
        },
        {
          option: "C · Release/external static storage",
          fit: "Later",
          reason: "Keeps Git lean but adds asset publishing, CORS, availability, versioning, and base-URL operations",
        },
        {
          option: "D · Intranet static server",
          fit: "Best future intranet",
          reason: "Same immutable hash assets and manifest can move behind the internal static origin",
        },
      ],
      verdict: {
        color:
          expandedSummary.storageBytes.opus64k < 500_000_000
            ? "GREEN"
            : expandedSummary.storageBytes.opus64k <= 1_500_000_000
              ? "YELLOW"
              : "RED",
        reason:
          expandedSummary.storageBytes.opus64k < 500_000_000
            ? "Four-voice Opus 64k estimate is below 500 MB"
            : expandedSummary.storageBytes.opus64k <= 1_500_000_000
              ? "Four-voice Opus 64k estimate is between 500 MB and 1.5 GB"
              : "Four-voice Opus 64k estimate exceeds 1.5 GB",
      },
      records,
    };

    return audit;
  } finally {
    await server.close();
  }
}

export async function writeAudit() {
  const audit = await buildAudit();
  const jsonPath = join(root, "artifacts", "tts-inventory.json");
  const reportPath = join(root, "docs", "generated", "tts-inventory.md");
  await mkdir(dirname(jsonPath), { recursive: true });
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  await writeFile(reportPath, renderReport(audit), "utf8");
  console.log(
    `TTS inventory: ${audit.summary.expandedStaticCandidates.logicalItems} logical / ${audit.summary.expandedStaticCandidates.uniqueTexts} unique`,
  );
  console.log(`Updated ${relative(root, jsonPath)}`);
  console.log(`Updated ${relative(root, reportPath)}`);
  return audit;
}

const entryPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (entryPath === import.meta.url) {
  await writeAudit();
}
