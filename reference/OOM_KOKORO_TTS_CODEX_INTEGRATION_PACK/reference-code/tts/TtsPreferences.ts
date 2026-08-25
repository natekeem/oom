import {
  DEFAULT_TTS_PREFERENCES,
  isOomVoiceId,
} from "./voiceConfig";
import type { TtsPreferences } from "./types";

const STORAGE_KEY = "oom.tts.preferences";

export function readTtsPreferences(): TtsPreferences {
  if (typeof window === "undefined") return DEFAULT_TTS_PREFERENCES;

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
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
    return DEFAULT_TTS_PREFERENCES;
  }
}

export function writeTtsPreferences(value: TtsPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
