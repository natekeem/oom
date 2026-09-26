import {
  feedbackJsonSchema,
  parseFeedback,
  type ManagedAiFeedbackV1,
  uuidPattern,
} from "../managed-ai/feedback.ts";

export const AI_FEATURES = [
  "answer_feedback",
  "script_rewrite",
  "roleplay_question",
] as const;

export type AiFeature = (typeof AI_FEATURES)[number];
export type AiProviderSource = "managed" | "custom";
export type AnswerFeedbackSource = "quick_practice" | "full_mock_review";

export interface AnswerFeedbackInput {
  question: string;
  answer: string;
  context: string;
  source: AnswerFeedbackSource;
  durationSeconds?: number;
  learningAttemptId?: string;
}

export interface ScriptRewriteInput {
  scriptId: string;
  title: string;
  originalScript: string;
  keywords: string[];
  targetSeconds: [number, number];
  courseId: string;
  levelId: "advanced" | "intermediate" | "foundation";
}

export interface RoleplayQuestionInput {
  scenarioId: string;
  group: string;
  situation: string;
  courseId: string;
  levelId: "advanced" | "intermediate" | "foundation";
}

export interface ScriptRewriteResultV1 {
  schemaVersion: 1;
  rewrittenScript: string;
  changes: string[];
}

export interface RoleplayQuestionResultV1 {
  schemaVersion: 1;
  prompt: string;
}

export type AnswerFeedbackResultV1 =
  | { schemaVersion: 1; format: "structured"; feedback: ManagedAiFeedbackV1 }
  | { schemaVersion: 1; format: "text"; text: string };

export interface AiFeatureInputMap {
  answer_feedback: AnswerFeedbackInput;
  script_rewrite: ScriptRewriteInput;
  roleplay_question: RoleplayQuestionInput;
}

export interface AiFeatureResultMap {
  answer_feedback: AnswerFeedbackResultV1;
  script_rewrite: ScriptRewriteResultV1;
  roleplay_question: RoleplayQuestionResultV1;
}

export interface AiExecuteRequest<F extends AiFeature = AiFeature> {
  feature: F;
  requestId: string;
  input: AiFeatureInputMap[F];
}

const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
const only = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));
const level = (value: unknown): value is ScriptRewriteInput["levelId"] =>
  value === "advanced" || value === "intermediate" || value === "foundation";
const course = (value: unknown) =>
  typeof value === "string" && /^course-\d+$/.test(value);

export function isAiFeature(value: unknown): value is AiFeature {
  return typeof value === "string" && (AI_FEATURES as readonly string[]).includes(value);
}

export function parseAiFeatureInput<F extends AiFeature>(
  feature: F,
  value: unknown,
): AiFeatureInputMap[F] {
  if (!object(value)) throw new Error("INVALID_REQUEST");
  if (feature === "answer_feedback") {
    if (
      !only(value, ["question", "answer", "context", "source", "durationSeconds", "learningAttemptId"]) ||
      !text(value.question, 2000) ||
      !text(value.answer, 8000) ||
      !text(value.context, 600) ||
      (value.source !== "quick_practice" && value.source !== "full_mock_review") ||
      (value.durationSeconds !== undefined &&
        (typeof value.durationSeconds !== "number" ||
          !Number.isFinite(value.durationSeconds) ||
          value.durationSeconds < 0 ||
          value.durationSeconds > 3600)) ||
      (value.learningAttemptId !== undefined &&
        (typeof value.learningAttemptId !== "string" ||
          !uuidPattern.test(value.learningAttemptId)))
    )
      throw new Error("INVALID_REQUEST");
  } else if (feature === "script_rewrite") {
    if (
      !only(value, ["scriptId", "title", "originalScript", "keywords", "targetSeconds", "courseId", "levelId"]) ||
      !text(value.scriptId, 120) ||
      !text(value.title, 200) ||
      !text(value.originalScript, 12000) ||
      !Array.isArray(value.keywords) ||
      value.keywords.length > 20 ||
      !value.keywords.every((item) => text(item, 100)) ||
      !Array.isArray(value.targetSeconds) ||
      value.targetSeconds.length !== 2 ||
      !value.targetSeconds.every((item) => Number.isInteger(item) && item >= 1 && item <= 300) ||
      value.targetSeconds[0] > value.targetSeconds[1] ||
      !course(value.courseId) ||
      !level(value.levelId)
    )
      throw new Error("INVALID_REQUEST");
  } else if (feature === "roleplay_question") {
    if (
      !only(value, ["scenarioId", "group", "situation", "courseId", "levelId"]) ||
      !text(value.scenarioId, 120) ||
      !text(value.group, 200) ||
      !text(value.situation, 2000) ||
      !course(value.courseId) ||
      !level(value.levelId)
    )
      throw new Error("INVALID_REQUEST");
  } else {
    throw new Error("INVALID_REQUEST");
  }
  return value as unknown as AiFeatureInputMap[F];
}

export function parseAiExecuteRequest(value: unknown): AiExecuteRequest {
  if (
    !object(value) ||
    !only(value, ["feature", "requestId", "input"]) ||
    !isAiFeature(value.feature) ||
    typeof value.requestId !== "string" ||
    !uuidPattern.test(value.requestId)
  )
    throw new Error("INVALID_REQUEST");
  return {
    feature: value.feature,
    requestId: value.requestId,
    input: parseAiFeatureInput(value.feature, value.input),
  } as AiExecuteRequest;
}

export function parseScriptRewriteResult(value: unknown): ScriptRewriteResultV1 {
  if (
    !object(value) ||
    !only(value, ["schemaVersion", "rewrittenScript", "changes"]) ||
    value.schemaVersion !== 1 ||
    !text(value.rewrittenScript, 12000) ||
    !Array.isArray(value.changes) ||
    value.changes.length > 3 ||
    !value.changes.every((item) => text(item, 300))
  )
    throw new Error("INVALID_AI_RESPONSE");
  return value as unknown as ScriptRewriteResultV1;
}

export function parseRoleplayQuestionResult(value: unknown): RoleplayQuestionResultV1 {
  if (
    !object(value) ||
    !only(value, ["schemaVersion", "prompt"]) ||
    value.schemaVersion !== 1 ||
    !text(value.prompt, 1500)
  )
    throw new Error("INVALID_AI_RESPONSE");
  return value as unknown as RoleplayQuestionResultV1;
}

export function parseManagedFeatureResult<F extends AiFeature>(
  feature: F,
  value: unknown,
): AiFeatureResultMap[F] {
  if (feature === "answer_feedback") {
    return {
      schemaVersion: 1,
      format: "structured",
      feedback: parseFeedback(value),
    } as AiFeatureResultMap[F];
  }
  if (feature === "script_rewrite")
    return parseScriptRewriteResult(value) as AiFeatureResultMap[F];
  return parseRoleplayQuestionResult(value) as AiFeatureResultMap[F];
}

const stringSchema = (maxLength: number) => ({
  type: "string",
  minLength: 1,
  maxLength,
});

export const scriptRewriteJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "rewrittenScript", "changes"],
  properties: {
    schemaVersion: { type: "integer", enum: [1] },
    rewrittenScript: stringSchema(12000),
    changes: {
      type: "array",
      maxItems: 3,
      items: stringSchema(300),
    },
  },
};

export const roleplayQuestionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "prompt"],
  properties: {
    schemaVersion: { type: "integer", enum: [1] },
    prompt: stringSchema(1500),
  },
};

export const aiResultSchemas = {
  answer_feedback: feedbackJsonSchema,
  script_rewrite: scriptRewriteJsonSchema,
  roleplay_question: roleplayQuestionJsonSchema,
} as const;
