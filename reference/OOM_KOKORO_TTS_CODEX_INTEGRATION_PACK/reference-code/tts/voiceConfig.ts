import type { OomVoiceId, TtsPreferences } from "./types";

export const OOM_VOICES: Array<{
  id: OomVoiceId;
  label: string;
}> = [
  { id: "af_heart", label: "Heart" },
  { id: "af_bella", label: "Bella" },
  { id: "af_sarah", label: "Sarah" },
  { id: "af_sky", label: "Sky" },
];

export const DEFAULT_TTS_PREFERENCES: TtsPreferences = {
  examVoice: "af_heart",
  scriptVoice: "af_bella",
};

export const EXAM_PREVIEW_TEXT =
  "Tell me about a place you visit often.";

export const SCRIPT_PREVIEW_TEXT =
  "One place I really enjoy visiting is a quiet beach near my city.";

export function isOomVoiceId(value: unknown): value is OomVoiceId {
  return (
    typeof value === "string" &&
    OOM_VOICES.some((voice) => voice.id === value)
  );
}
