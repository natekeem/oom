import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { insertActivity, type StudyUnit } from "./activityRepository";

export function useStudyCompletion(unit: StudyUnit) {
  const auth = useAuth();
  const userId = auth.status === "authenticated" ? auth.user?.id : null;
  const key = JSON.stringify([userId, unit]);
  const current = useRef({ key, id: "", busy: false, done: false });
  const [state, setState] = useState({ key, status: "idle" });
  if (state.key !== key) setState({ key, status: "idle" });
  useEffect(() => {
    current.current = { key, id: "", busy: false, done: false };
    return () => { current.current = { key: "", id: "", busy: false, done: false }; };
  }, [key]);
  const status = state.key === key ? state.status : "idle";

  async function complete() {
    const attempt = current.current;
    if (attempt.busy || attempt.done || auth.status === "loading") return;
    if (!userId) {
      attempt.done = true;
      setState({ key, status: "local" });
      return;
    }
    attempt.busy = true;
    attempt.id ||= crypto.randomUUID();
    setState({ key, status: "saving" });
    let saved = false;
    try { saved = await insertActivity(userId, attempt.id, unit); } catch { /* Learning stays available. */ }
    attempt.busy = false;
    attempt.done = saved;
    if (current.current === attempt) setState({ key, status: saved ? "saved" : "error" });
  }

  return { complete, status, disabled: auth.status === "loading" || status === "saving" || status === "saved" || status === "local" };
}
