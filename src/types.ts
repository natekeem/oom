export type GoalLevel = "IM3" | "IH" | "AL" | "IM3-IH-AL";

export type ScriptItem = {
  id: string;
  group: string;
  title: string;
  goalLevel: GoalLevel;
  surveyBadges: string[];
  covers: string[];
  expectedQuestions: string[];
  strategy: string;
  keywords: string[];
  fillerPhrases: string[];
  koreanSummary: string;
  englishScript: string;
  pointNotes: string[];
};

export type ScriptVariant = {
  id: string;
  label: string;
  questionType: string;
  question: string;
  pivot: string;
  keep: string[];
  englishExample?: string;
};

export type ScriptBlockId = "opening" | "details" | "closing";

export type ScriptReplacement = {
  block: ScriptBlockId;
  instruction: string;
  replacement: string;
};

export type ScriptReplacementGuide = {
  summary: string;
  replacements: ScriptReplacement[];
  keepBlocks: ScriptBlockId[];
};

export type ScriptBlueprintStep = {
  id: string;
  label: string;
  koreanGuide: string;
  cue: string;
};

export type ScriptVariantSet = {
  title: string;
  description: string;
  variants: ScriptVariant[];
  blueprint: ScriptBlueprintStep[];
};

export type SurveyItem = {
  id: string;
  name: string;
  category: string;
  reason: string;
  scriptGroup: string;
  covers: string[];
  recommended: boolean;
};

export type RoleplayScenario = {
  id: string;
  title: string;
  group: string;
  situation: string;
  evaQuestion: string;
  answerStructure: string[];
  englishExample: string;
  alternatives: string[];
  levelDifferences: Record<"IM3" | "IH" | "AL", string>;
};

export type PracticeQuestion = {
  id: string;
  group: string;
  prompt: string;
  scriptId: string;
  type: string;
};

export type LlmMode = "openai-compatible" | "generic" | "custom";
export type LlmAuthType = "bearer" | "x-api-key" | "none";

export type LlmSettings = {
  endpoint: string;
  apiKey?: string;
  model?: string;
  mode: LlmMode;
  authType: LlmAuthType;
  customBodyTemplate?: string;
};

export type SttSettings = {
  endpoint: string;
  apiKey?: string;
  model?: string;
  authType: LlmAuthType;
  autoTranscribe: boolean;
};

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ToastMessage = {
  id: number;
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
};
