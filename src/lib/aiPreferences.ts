import { useSyncExternalStore } from "react";

export type AiFeedbackMode = "managed" | "custom";
export const FEEDBACK_MODE_KEY = "oom-ai-feedback-mode";
const event = "oom-feedback-mode-changed";
export function getFeedbackMode(): AiFeedbackMode {
  try { return localStorage.getItem(FEEDBACK_MODE_KEY) === "custom" ? "custom" : "managed"; }
  catch { return "managed"; }
}
export function setFeedbackMode(mode: AiFeedbackMode) {
  localStorage.setItem(FEEDBACK_MODE_KEY, mode);
  window.dispatchEvent(new Event(event));
}
function subscribe(listener: () => void) {
  window.addEventListener(event, listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener(event, listener); window.removeEventListener("storage", listener); };
}
export function useFeedbackMode() {
  return useSyncExternalStore(subscribe, getFeedbackMode);
}
