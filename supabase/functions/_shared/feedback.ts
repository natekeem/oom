// Public contract only. Prompts and provider credentials never enter this module.
export const PROMPT_VERSION = "opic_answer_feedback_v1";
export const dimensionKeys = [
  "relevance",
  "organization",
  "specificity",
  "naturalness",
  "languageControl",
] as const;
export interface ManagedAiFeedbackV1 {
  schemaVersion: 1;
  overallSummary: string;
  strengths: string[];
  improvements: { issue: string; whyItMatters: string; suggestion: string }[];
  retryTip: string;
  dimensions: Record<(typeof dimensionKeys)[number], number>;
  improvedAnswer: string;
}
export interface FeedbackInput {
  requestId: string;
  question: string;
  context: string;
  answer: string;
  learningAttemptId?: string;
}
export interface AiQuota {
  feature: string;
  plan: string;
  limit: number;
  used: number;
  reserved: number;
  remaining: number;
  resetsAt: string;
  enabled: boolean;
}
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const string = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const exact = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).every((k) => keys.includes(k)) && keys.every((k) => k in v);
export function parseFeedbackInput(v: unknown): FeedbackInput {
  if (
    !object(v) ||
    Object.keys(v).some(
      (k) =>
        ![
          "requestId",
          "question",
          "context",
          "answer",
          "learningAttemptId",
        ].includes(k),
    ) ||
    typeof v.requestId !== "string" ||
    !uuidPattern.test(v.requestId) ||
    !string(v.question, 2000) ||
    !string(v.context, 600) ||
    !string(v.answer, 8000) ||
    (v.learningAttemptId !== undefined &&
      (typeof v.learningAttemptId !== "string" ||
        !uuidPattern.test(v.learningAttemptId)))
  )
    throw new Error("INVALID_REQUEST");
  return v as unknown as FeedbackInput;
}
export function parseFeedback(v: unknown): ManagedAiFeedbackV1 {
  if (
    !object(v) ||
    !exact(v, [
      "schemaVersion",
      "overallSummary",
      "strengths",
      "improvements",
      "retryTip",
      "dimensions",
      "improvedAnswer",
    ]) ||
    v.schemaVersion !== 1 ||
    !string(v.overallSummary, 500) ||
    !string(v.retryTip, 500) ||
    !string(v.improvedAnswer, 4000) ||
    !Array.isArray(v.strengths) ||
    v.strengths.length < 1 ||
    v.strengths.length > 3 ||
    !v.strengths.every((s) => string(s, 400)) ||
    !Array.isArray(v.improvements) ||
    v.improvements.length < 1 ||
    v.improvements.length > 3 ||
    !v.improvements.every(
      (i) =>
        object(i) &&
        exact(i, ["issue", "whyItMatters", "suggestion"]) &&
        Object.values(i).every((s) => string(s, 500)),
    ) ||
    !object(v.dimensions) ||
    !exact(v.dimensions, [...dimensionKeys]) ||
    !Object.values(v.dimensions).every(
      (n) => typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5,
    )
  )
    throw new Error("INVALID_AI_RESPONSE");
  return v as unknown as ManagedAiFeedbackV1;
}
const textSchema = (maxLength: number) => ({
  type: "string",
  minLength: 1,
  maxLength,
});
export const feedbackJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "overallSummary",
    "strengths",
    "improvements",
    "retryTip",
    "dimensions",
    "improvedAnswer",
  ],
  properties: {
    schemaVersion: { type: "integer", enum: [1] },
    overallSummary: textSchema(500),
    retryTip: textSchema(500),
    improvedAnswer: textSchema(4000),
    strengths: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: textSchema(400),
    },
    improvements: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["issue", "whyItMatters", "suggestion"],
        properties: {
          issue: textSchema(500),
          whyItMatters: textSchema(500),
          suggestion: textSchema(500),
        },
      },
    },
    dimensions: {
      type: "object",
      additionalProperties: false,
      required: [...dimensionKeys],
      properties: Object.fromEntries(
        dimensionKeys.map((k) => [
          k,
          { type: "integer", minimum: 1, maximum: 5 },
        ]),
      ),
    },
  },
};
