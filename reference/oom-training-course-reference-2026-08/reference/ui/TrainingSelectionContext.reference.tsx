import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { TrainingSelection } from "../trainingTypes.reference";
import {
  loadTrainingSelection,
  saveTrainingSelection,
} from "../trainingSelectionStorage.reference";

type Value = {
  selection: TrainingSelection | null;
  select: (next: Omit<TrainingSelection, "selectedAt">) => void;
};

const Context = createContext<Value | null>(null);

export function TrainingSelectionProvider({ children }: PropsWithChildren) {
  const [selection, setSelection] = useState<TrainingSelection | null>(
    () => loadTrainingSelection(),
  );

  const value = useMemo<Value>(
    () => ({
      selection,
      select(next) {
        setSelection(saveTrainingSelection(next));
      },
    }),
    [selection],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTrainingSelection() {
  const value = useContext(Context);
  if (!value) {
    throw new Error(
      "useTrainingSelection must be used inside TrainingSelectionProvider",
    );
  }
  return value;
}
