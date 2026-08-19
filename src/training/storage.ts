import type { TrainingSelection } from "./types";

export const TRAINING_SELECTION_STORAGE_KEY = "oom-training-selection-v1";

export function loadTrainingSelection(): TrainingSelection | null {
  try {
    const raw = localStorage.getItem(TRAINING_SELECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TrainingSelection>;
    if (!parsed.courseId || !parsed.levelId || !parsed.selectedAt) return null;
    return parsed as TrainingSelection;
  } catch {
    return null;
  }
}

export function saveTrainingSelection(
  selection: Omit<TrainingSelection, "selectedAt">,
): TrainingSelection {
  const value: TrainingSelection = {
    ...selection,
    selectedAt: new Date().toISOString(),
  };
  localStorage.setItem(TRAINING_SELECTION_STORAGE_KEY, JSON.stringify(value));
  return value;
}

export function clearTrainingSelection() {
  localStorage.removeItem(TRAINING_SELECTION_STORAGE_KEY);
}
