import { useCallback, useState } from "react";
import { readTtsPreferences, writeTtsPreferences } from "./preferences";
import type { OomVoiceId, TtsPreferences } from "./types";

export function useTtsPreferences() {
  const [preferences, setPreferences] = useState<TtsPreferences>(readTtsPreferences);

  const setExamVoice = useCallback((voice: OomVoiceId) => {
    setPreferences((current) => {
      const next = { ...current, examVoice: voice };
      writeTtsPreferences(next);
      return next;
    });
  }, []);

  const setScriptVoice = useCallback((voice: OomVoiceId) => {
    setPreferences((current) => {
      const next = { ...current, scriptVoice: voice };
      writeTtsPreferences(next);
      return next;
    });
  }, []);

  return {
    preferences,
    setExamVoice,
    setScriptVoice,
  };
}
