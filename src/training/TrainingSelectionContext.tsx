import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { TrainingSelection } from './types';
import { loadTrainingSelection, saveTrainingSelection, clearTrainingSelection } from './storage';

type Value = {
  selection: TrainingSelection | null;
  select: (next: Omit<TrainingSelection, 'selectedAt'>) => void;
  clear: () => void;
};

const defaultContextValue: Value = {
  selection: null,
  select: () => {},
  clear: () => {},
};

const Context = createContext<Value>(defaultContextValue);

export function TrainingSelectionProvider({ children }: PropsWithChildren) {
  const [selection, setSelection] = useState<TrainingSelection | null>(() => loadTrainingSelection());
  const value = useMemo<Value>(() => ({
    selection,
    select(next) { setSelection(saveTrainingSelection(next)); },
    clear() { clearTrainingSelection(); setSelection(null); },
  }), [selection]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTrainingSelection() {
  return useContext(Context);
}

