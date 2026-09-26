import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LlmSettings } from "../../../types";
import { resolveAiProvider } from "../providerResolver";
import { runAiFeature } from "../runAiFeature";

const mocks = vi.hoisted(() => ({ managed: vi.fn(), custom: vi.fn() }));
vi.mock("../managedProvider", () => ({ executeManagedAi: mocks.managed }));
vi.mock("../customProvider", () => ({ executeCustomAi: mocks.custom }));

const managed: LlmSettings = { endpoint: "", mode: "openai-compatible", authType: "bearer" };
const custom: LlmSettings = { ...managed, endpoint: "https://example.test/v1/chat/completions" };
const input = { scenarioId: "rp-1", group: "여행", situation: "호텔 예약 문제", courseId: "course-1", levelId: "advanced" as const };
const featureCases = [
  ["answer_feedback", { question: "Describe a park.", answer: "I went there.", context: "course-1", source: "quick_practice" }],
  ["script_rewrite", { scriptId: "script-1", title: "Park", originalScript: "I went there.", keywords: ["park"], targetSeconds: [30, 45], courseId: "course-1", levelId: "foundation" }],
  ["roleplay_question", input],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.managed.mockResolvedValue({ result: { schemaVersion: 1, prompt: "Managed" }, quota: { remaining: 2 } });
  mocks.custom.mockResolvedValue({ schemaVersion: 1, prompt: "Custom" });
});

describe("AI provider precedence", () => {
  it.each(featureCases)("routes %s to managed when no custom endpoint exists", async (feature, featureInput) => {
    await runAiFeature({ feature, input: featureInput, customSettings: managed });
    expect(mocks.managed).toHaveBeenCalledTimes(1);
    expect(mocks.custom).not.toHaveBeenCalled();
  });

  it.each(featureCases)("globally overrides managed for %s when a usable custom endpoint exists", async (feature, featureInput) => {
    await runAiFeature({ feature, input: featureInput, customSettings: custom });
    expect(mocks.custom).toHaveBeenCalledTimes(1);
    expect(mocks.managed).not.toHaveBeenCalled();
  });

  it("never falls back to managed after a custom failure", async () => {
    mocks.custom.mockRejectedValue(new Error("failed"));
    await expect(runAiFeature({ feature: "roleplay_question", input, customSettings: custom })).rejects.toThrow("failed");
    expect(mocks.managed).not.toHaveBeenCalled();
  });

  it("returns to managed after custom settings are cleared", async () => {
    expect(resolveAiProvider(custom)).toBe("custom");
    expect(resolveAiProvider({ ...custom, endpoint: "" })).toBe("managed");
  });

  it("rejects malformed configured endpoints instead of sending content to managed", async () => {
    await expect(runAiFeature({ feature: "roleplay_question", input, customSettings: { ...custom, endpoint: "not-a-url" } })).rejects.toMatchObject({ code: "CUSTOM_CONFIG_INVALID" });
    expect(mocks.managed).not.toHaveBeenCalled();
  });
});

describe("AI architecture guard", () => {
  it.each([
    "../../../components/practice/PracticeView.tsx",
    "../../../components/practice/FullMockPracticeView.tsx",
    "../../../components/script/ScriptDetail.tsx",
    "../../../components/roleplay/RoleplayViewV2.tsx",
  ])("keeps runtime feature %s behind runAiFeature", (path) => {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    expect(source).toMatch(/(?:runAiFeature|ManagedFeedback)/);
    expect(source).not.toMatch(/(?:lib\/llm|callInternalLlm)/);
  });
});
