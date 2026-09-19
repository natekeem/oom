import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { TrainingSelection } from './types';
import {
  loadTrainingSelection,
  saveTrainingSelection,
  clearTrainingSelection,
} from './storage';
import { useAuth } from '../auth/useAuth';
import {
  getPreferences,
  upsertPreferences,
  clearPreferences,
} from '../features/preferences/preferenceRepository';

export type TrainingSelectionContextValue = {
  selection: TrainingSelection | null;
  select: (next: Omit<TrainingSelection, 'selectedAt'>) => Promise<void> | void;
  clear: () => Promise<void> | void;
  isAccountSynced: boolean;
  isLoadingPreferences: boolean;
};

const defaultContextValue: TrainingSelectionContextValue = {
  selection: null,
  select: () => {},
  clear: () => {},
  isAccountSynced: false,
  isLoadingPreferences: false,
};

const Context = createContext<TrainingSelectionContextValue>(defaultContextValue);

export function TrainingSelectionProvider({ children }: PropsWithChildren) {
  const { user, status } = useAuth();
  const [selection, setSelection] = useState<TrainingSelection | null>(() => loadTrainingSelection());
  const [isAccountSynced, setIsAccountSynced] = useState<boolean>(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(false);
  const lastUserIdRef = useRef<string | null>(null);
  const prefFetchVersionRef = useRef<number>(0);

  // Sync preferences with Supabase when authenticated user changes
  useEffect(() => {
    let active = true;
    if (status === 'loading') {
      return;
    }

    if (status === 'authenticated' && user?.id) {
      const currentUserId = user.id;
      const isNewUser = lastUserIdRef.current !== currentUserId;
      if (isNewUser) {
        if (lastUserIdRef.current !== null) {
          clearTrainingSelection();
          setSelection(null);
          setIsAccountSynced(false);
        }
        lastUserIdRef.current = currentUserId;
      }

      const version = ++prefFetchVersionRef.current;

      void Promise.resolve().then(() => {
        if (!active) return;
        setIsLoadingPreferences(true);

        void getPreferences(currentUserId)
          .then((prefs) => {
            if (!active || version !== prefFetchVersionRef.current) return;
            if (prefs && prefs.targetLevel && prefs.courseId) {
              const serverSelection: TrainingSelection = {
                levelId: prefs.targetLevel,
                courseId: prefs.courseId,
                selectedAt: prefs.updatedAt || new Date().toISOString(),
              };
              saveTrainingSelection(serverSelection);
              setSelection(serverSelection);
              setIsAccountSynced(true);
            } else {
              // Server has no preferences: preserve local selection without auto-uploading
              setIsAccountSynced(false);
            }
            setIsLoadingPreferences(false);
          })
          .catch(() => {
            if (!active || version !== prefFetchVersionRef.current) return;
            setIsAccountSynced(false);
            setIsLoadingPreferences(false);
          });
      });

      return () => {
        active = false;
      };
    }

    // Anonymous or unconfigured
    if (lastUserIdRef.current !== null) {
      // User just logged out: clear selection to isolate accounts
      lastUserIdRef.current = null;
      prefFetchVersionRef.current++;
      void Promise.resolve().then(() => {
        if (!active) return;
        clearTrainingSelection();
        setSelection(null);
        setIsAccountSynced(false);
        setIsLoadingPreferences(false);
      });
    } else {
      void Promise.resolve().then(() => {
        if (!active) return;
        setIsLoadingPreferences(false);
        setIsAccountSynced(false);
      });
    }

    return () => {
      active = false;
    };
  }, [status, user]);

  const select = useCallback(
    async (next: Omit<TrainingSelection, 'selectedAt'>) => {
      const saved = saveTrainingSelection(next);
      setSelection(saved);

      if (status === 'authenticated' && user?.id) {
        try {
          const res = await upsertPreferences(user.id, {
            targetLevel: next.levelId,
            courseId: next.courseId,
          });
          if (res) {
            setIsAccountSynced(true);
          }
        } catch {
          // Keep local selection intact even if server sync fails
        }
      } else {
        setIsAccountSynced(false);
      }
    },
    [status, user]
  );

  const clear = useCallback(async () => {
    clearTrainingSelection();
    setSelection(null);
    setIsAccountSynced(false);

    if (status === 'authenticated' && user?.id) {
      try {
        await clearPreferences(user.id);
      } catch {
        // ignore
      }
    }
  }, [status, user]);

  const value = useMemo<TrainingSelectionContextValue>(
    () => ({
      selection,
      select,
      clear,
      isAccountSynced,
      isLoadingPreferences,
    }),
    [selection, select, clear, isAccountSynced, isLoadingPreferences]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTrainingSelection() {
  return useContext(Context);
}

