import type { TrainingLevelId } from "../../training/types";

export const SCRIPT_RATE_PREFERENCES_STORAGE_KEY = "oom.tts.scriptRates";

export const EXAM_TTS_RATE = 1;
export const MIN_SCRIPT_RATE = 0.85;
export const MAX_SCRIPT_RATE = 1.1;
export const SCRIPT_RATE_STEP = 0.05;

export const DEFAULT_SCRIPT_RATE_BY_LEVEL: Readonly<Record<TrainingLevelId, number>> = {
  advanced: 1,
  intermediate: 0.95,
  foundation: 0.9,
};

export type ScriptRatePreferences = Partial<Record<TrainingLevelId, number>>;

const SCRIPT_RATE_OPTIONS = [0.85, 0.9, 0.95, 1, 1.05, 1.1] as const;

function isScriptRate(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    SCRIPT_RATE_OPTIONS.some((option) => Math.abs(option - value) < Number.EPSILON)
  );
}

export function readScriptRatePreferences(): ScriptRatePreferences {
  if (typeof window === "undefined") return {};

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(SCRIPT_RATE_PREFERENCES_STORAGE_KEY) ?? "{}",
    ) as Partial<Record<TrainingLevelId, unknown>>;

    return (Object.keys(DEFAULT_SCRIPT_RATE_BY_LEVEL) as TrainingLevelId[]).reduce<ScriptRatePreferences>(
      (preferences, levelId) => {
        if (isScriptRate(parsed[levelId])) preferences[levelId] = parsed[levelId];
        return preferences;
      },
      {},
    );
  } catch {
    return {};
  }
}

export function readScriptRate(levelId: TrainingLevelId) {
  return readScriptRatePreferences()[levelId] ?? DEFAULT_SCRIPT_RATE_BY_LEVEL[levelId];
}

export function writeScriptRate(levelId: TrainingLevelId, rate: number) {
  if (typeof window === "undefined" || !isScriptRate(rate)) return;

  const next = {
    ...readScriptRatePreferences(),
    [levelId]: rate,
  } satisfies ScriptRatePreferences;

  window.localStorage.setItem(
    SCRIPT_RATE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(next),
  );
}
