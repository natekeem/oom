import type { OomVoiceId, TtsPreferences } from "./types";

export const OOM_VOICES: ReadonlyArray<{
  id: OomVoiceId;
  label: string;
  description: string;
}> = [
  { id: "af_heart", label: "Heart", description: "균형 잡히고 또렷한 톤" },
  { id: "af_bella", label: "Bella", description: "부드럽고 자연스러운 톤" },
  { id: "af_sarah", label: "Sarah", description: "차분하고 담백한 톤" },
  { id: "af_sky", label: "Sky", description: "밝고 가벼운 톤" },
];

export const DEFAULT_TTS_PREFERENCES: TtsPreferences = {
  examVoice: "af_heart",
  scriptVoice: "af_bella",
};

export const EXAM_PREVIEW_TEXT = "Tell me about a place you visit often.";

export const SCRIPT_PREVIEW_TEXT =
  "One place I really enjoy visiting is a quiet beach near my city.";

export function isOomVoiceId(value: unknown): value is OomVoiceId {
  return OOM_VOICES.some((voice) => voice.id === value);
}
