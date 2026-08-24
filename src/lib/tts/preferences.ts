import { DEFAULT_TTS_PREFERENCES, isOomVoiceId } from "./voiceConfig";
import type { TtsPreferences } from "./types";

export const TTS_PREFERENCES_STORAGE_KEY = "oom.tts.preferences";

export function readTtsPreferences(): TtsPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_TTS_PREFERENCES };

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(TTS_PREFERENCES_STORAGE_KEY) ?? "{}",
    ) as Partial<TtsPreferences>;

    return {
      examVoice: isOomVoiceId(parsed.examVoice)
        ? parsed.examVoice
        : DEFAULT_TTS_PREFERENCES.examVoice,
      scriptVoice: isOomVoiceId(parsed.scriptVoice)
        ? parsed.scriptVoice
        : DEFAULT_TTS_PREFERENCES.scriptVoice,
    };
  } catch {
    return { ...DEFAULT_TTS_PREFERENCES };
  }
}

export function writeTtsPreferences(value: TtsPreferences) {
  if (typeof window === "undefined") return;

  const guarded: TtsPreferences = {
    examVoice: isOomVoiceId(value.examVoice)
      ? value.examVoice
      : DEFAULT_TTS_PREFERENCES.examVoice,
    scriptVoice: isOomVoiceId(value.scriptVoice)
      ? value.scriptVoice
      : DEFAULT_TTS_PREFERENCES.scriptVoice,
  };

  window.localStorage.setItem(TTS_PREFERENCES_STORAGE_KEY, JSON.stringify(guarded));
}
