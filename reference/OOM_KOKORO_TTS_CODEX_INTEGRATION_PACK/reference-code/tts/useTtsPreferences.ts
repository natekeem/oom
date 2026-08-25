import { useCallback, useState } from "react";
import { readTtsPreferences, writeTtsPreferences } from "./TtsPreferences";
import type { OomVoiceId, TtsPreferences } from "./types";

export function useTtsPreferences() {
  const [preferences, setPreferences] =
    useState<TtsPreferences>(readTtsPreferences);

  const setExamVoice = useCallback((voice: OomVoiceId) => {
    setPreferences((prev) => {
      const next = { ...prev, examVoice: voice };
      writeTtsPreferences(next);
      return next;
    });
  }, []);

  const setScriptVoice = useCallback((voice: OomVoiceId) => {
    setPreferences((prev) => {
      const next = { ...prev, scriptVoice: voice };
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
