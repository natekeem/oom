import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SELF_INTRODUCTION_PROMPT } from "../../../data/training/selfIntroduction";
import { normalizeTtsText } from "../../../lib/tts/cacheKey";
import { OOM_VOICE_IDS } from "../../../lib/tts/types";
import { discoveredCourses, resolveTrainingContext } from "../../../training/courseRegistry";
import { TRAINING_LEVELS } from "../../../training/levels";
import {
  completeMockPlanAfterAdjustment,
  createInitialMockPlan,
  resolveAdjustedPromptLevel,
} from "./mockSessionPlanner";
import type { MockAdjustment, MockQuestion } from "./mockSessionTypes";
import { createInitialMockSurveySelection } from "./mockSurvey";

type InventoryRecord = {
  category: string;
  currentTtsConsumer: boolean;
  textHash: string;
};

type StaticManifest = {
  coverage: {
    expectedTexts: number;
    expectedVoiceAssets: number;
    completedTexts: number;
    completedVoiceAssets: number;
    complete: boolean;
  };
  entries: Record<string, { audio: Record<string, unknown> }>;
};

const inventory = JSON.parse(
  readFileSync(join(process.cwd(), "artifacts", "tts-inventory.json"), "utf8"),
) as { records: InventoryRecord[] };
const manifest = JSON.parse(
  readFileSync(join(process.cwd(), "public", "generated-tts", "tts-manifest.json"), "utf8"),
) as StaticManifest;
const playableHashes = new Set(
  inventory.records.filter((record) => record.currentTtsConsumer).map((record) => record.textHash),
);

function hashPrompt(prompt: string) {
  return createHash("sha256").update(normalizeTtsText(prompt), "utf8").digest("hex");
}

function expectStaticCoverage(prompt: string) {
  const hash = hashPrompt(prompt);
  expect(playableHashes, `playable inventory missing ${hash}`).toContain(hash);
  expect(manifest.entries, `production manifest missing ${hash}`).toHaveProperty(hash);
  for (const voice of OOM_VOICE_IDS) {
    expect(manifest.entries[hash].audio, `${hash} missing ${voice}`).toHaveProperty(voice);
  }
}

describe("Full Mock static TTS coverage", () => {
  it("covers every fixed question, roleplay, and self-introduction prompt for all Course x Level contexts", () => {
    const prompts = new Set([SELF_INTRODUCTION_PROMPT]);
    const roleplayHashes = new Set<string>();

    for (const course of discoveredCourses) {
      for (const level of TRAINING_LEVELS) {
        const resolved = resolveTrainingContext(course.id, level.id);
        resolved.questions.forEach((question) => prompts.add(question.prompt));
        resolved.roleplays.forEach((roleplay) => {
          prompts.add(roleplay.prompt);
          roleplayHashes.add(hashPrompt(roleplay.prompt));
        });
      }
    }

    expect(prompts).toHaveLength(118);
    expect(roleplayHashes).toHaveLength(9);
    expect(
      new Set(
        inventory.records
          .filter((record) => record.currentTtsConsumer && record.category === "step5-roleplay")
          .map((record) => record.textHash),
      ),
    ).toEqual(roleplayHashes);
    prompts.forEach(expectStaticCoverage);
    expect(manifest.coverage).toEqual({
      expectedTexts: 186,
      expectedVoiceAssets: 744,
      completedTexts: 186,
      completedVoiceAssets: 744,
      complete: true,
    });
  });

  it("keeps every prompt returned by seeded Session 1 and Session 2 plans inside static coverage", () => {
    const adjustments: MockAdjustment[] = ["easier", "similar", "harder"];
    const seeds = ["tts-coverage-a", "tts-coverage-b", "tts-coverage-c"];
    const plannedRoleplays = new Set<string>();
    const assertQuestion = (question: MockQuestion) => {
      expectStaticCoverage(question.prompt);
      if (question.kind === "roleplay") plannedRoleplays.add(hashPrompt(question.prompt));
    };

    for (const course of discoveredCourses) {
      for (const level of TRAINING_LEVELS) {
        const resolved = resolveTrainingContext(course.id, level.id);
        for (const seed of seeds) {
          const initial = createInitialMockPlan({
            resolved,
            initialLevelId: level.id,
            surveySelection: createInitialMockSurveySelection(resolved),
          }, `${course.id}:${level.id}:${seed}`);
          initial.session1.forEach(assertQuestion);

          for (const adjustment of adjustments) {
            const effectiveLevelId = resolveAdjustedPromptLevel(level.id, adjustment);
            const secondResolved = resolveTrainingContext(course.id, effectiveLevelId);
            completeMockPlanAfterAdjustment(initial, adjustment, secondResolved).session2.forEach(assertQuestion);
          }
        }
      }
    }

    expect(plannedRoleplays).toHaveLength(9);
  });
});
