import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LlmSettings } from "../../../types";
import { executeCustomAi } from "../customProvider";

const mocks = vi.hoisted(() => ({ call: vi.fn() }));
vi.mock("../../../lib/llm", () => ({ callInternalLlm: mocks.call }));

const settings: LlmSettings = {
  endpoint: "https://example.test/v1/chat/completions",
  mode: "openai-compatible",
  authType: "bearer",
};

beforeEach(() => vi.clearAllMocks());

describe("custom provider normalization", () => {
  it("normalizes a valid structured script result", async () => {
    mocks.call.mockResolvedValue(JSON.stringify({
      schemaVersion: 1,
      rewrittenScript: "I visit the park after work.",
      changes: ["현재형으로 정리"],
    }));
    await expect(executeCustomAi("script_rewrite", {
      scriptId: "script-1",
      title: "Park",
      originalScript: "I visited park.",
      keywords: ["park"],
      targetSeconds: [30, 45],
      courseId: "course-1",
      levelId: "foundation",
    }, settings)).resolves.toEqual({
      schemaVersion: 1,
      rewrittenScript: "I visit the park after work.",
      changes: ["현재형으로 정리"],
    });
  });

  it("labels honest plain answer feedback without fabricating a managed schema", async () => {
    mocks.call.mockResolvedValue("질문에 맞지만 과거형을 보완하세요.");
    await expect(executeCustomAi("answer_feedback", {
      question: "Describe a park.",
      answer: "I go yesterday.",
      context: "course-1 foundation",
      source: "quick_practice",
    }, settings)).resolves.toEqual({
      schemaVersion: 1,
      format: "text",
      text: "질문에 맞지만 과거형을 보완하세요.",
    });
  });

  it("rejects oversized output and maps network failures safely", async () => {
    mocks.call.mockResolvedValueOnce("x".repeat(30001));
    await expect(executeCustomAi("roleplay_question", {
      scenarioId: "rp-1",
      group: "여행",
      situation: "호텔 예약 문제",
      courseId: "course-1",
      levelId: "advanced",
    }, settings)).rejects.toMatchObject({ code: "INVALID_AI_RESPONSE", providerSource: "custom" });

    mocks.call.mockRejectedValueOnce(new Error("network down"));
    await expect(executeCustomAi("roleplay_question", {
      scenarioId: "rp-1",
      group: "여행",
      situation: "호텔 예약 문제",
      courseId: "course-1",
      levelId: "advanced",
    }, settings)).rejects.toMatchObject({ code: "CUSTOM_PROVIDER_FAILED", providerSource: "custom" });
  });

  it("applies feature-specific limits to plain custom output", async () => {
    mocks.call.mockResolvedValueOnce("x".repeat(1501));
    await expect(executeCustomAi("roleplay_question", {
      scenarioId: "rp-1",
      group: "여행",
      situation: "호텔 예약 문제",
      courseId: "course-1",
      levelId: "advanced",
    }, settings)).rejects.toMatchObject({ code: "INVALID_AI_RESPONSE", providerSource: "custom" });

    mocks.call.mockResolvedValueOnce("x".repeat(12001));
    await expect(executeCustomAi("script_rewrite", {
      scriptId: "script-1",
      title: "Park",
      originalScript: "I visited park.",
      keywords: ["park"],
      targetSeconds: [30, 45],
      courseId: "course-1",
      levelId: "foundation",
    }, settings)).rejects.toMatchObject({ code: "INVALID_AI_RESPONSE", providerSource: "custom" });
  });
});
