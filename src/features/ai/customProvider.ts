import {
  parseRoleplayQuestionResult,
  parseScriptRewriteResult,
  type AiFeature,
  type AiFeatureInputMap,
  type AiFeatureResultMap,
} from "../../../shared/ai/features";
import { parseFeedback } from "../../../shared/managed-ai/feedback";
import { callInternalLlm } from "../../lib/llm";
import type { LlmSettings } from "../../types";
import { AiExecutionError } from "./errors";
import { buildCustomPrompt } from "./customPrompts";

const MAX_CUSTOM_OUTPUT = 30000;

function jsonValue(text: string): unknown | null {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export async function executeCustomAi<F extends AiFeature>(
  feature: F,
  input: AiFeatureInputMap[F],
  settings: LlmSettings,
  signal?: AbortSignal,
): Promise<AiFeatureResultMap[F]> {
  let output: string;
  try {
    output = await callInternalLlm(settings, buildCustomPrompt(feature, input), signal);
  } catch (error) {
    if (error instanceof Error && error.message.includes("시간"))
      throw new AiExecutionError("PROVIDER_TIMEOUT", "custom");
    throw new AiExecutionError("CUSTOM_PROVIDER_FAILED", "custom", false);
  }
  if (!output.trim() || output.length > MAX_CUSTOM_OUTPUT)
    throw new AiExecutionError("INVALID_AI_RESPONSE", "custom");
  const parsed = jsonValue(output);
  try {
    if (feature === "answer_feedback") {
      if (parsed) {
        try {
          return {
            schemaVersion: 1,
            format: "structured",
            feedback: parseFeedback(parsed),
          } as AiFeatureResultMap[F];
        } catch {
          // Plain custom feedback is an honest text result, not a fabricated managed schema.
        }
      }
      return { schemaVersion: 1, format: "text", text: output.trim() } as AiFeatureResultMap[F];
    }
    if (feature === "script_rewrite") {
      if (parsed) return parseScriptRewriteResult(parsed) as AiFeatureResultMap[F];
      return parseScriptRewriteResult({
        schemaVersion: 2,
        rewrittenScript: output.trim(),
        changes: [],
      }) as AiFeatureResultMap[F];
    }
    if (parsed) return parseRoleplayQuestionResult(parsed) as AiFeatureResultMap[F];
    return parseRoleplayQuestionResult({
      schemaVersion: 1,
      prompt: output.trim(),
    }) as AiFeatureResultMap[F];
  } catch {
    throw new AiExecutionError("INVALID_AI_RESPONSE", "custom");
  }
}
