export type LandingQuality = "high" | "medium" | "low";
export type LandingScene = "hero" | "story" | "levels" | "journey" | "pivot" | "exam" | "ecosystem" | "final";
export type LandingCursorMode = "fluid" | "attract" | "parallax" | "activate" | "tilt" | "magnetic" | "none";

export type LandingMotionSnapshot = {
  pageProgress: number;
  sceneProgress: number;
  pointerX: number;
  pointerY: number;
  pointerSpeed: number;
  quality: LandingQuality;
  reducedMotion: boolean;
  activeScene: LandingScene;
  cursorMode: LandingCursorMode;
};

const initialSnapshot: LandingMotionSnapshot = {
  pageProgress: 0,
  sceneProgress: 0,
  pointerX: 0,
  pointerY: 0,
  pointerSpeed: 0,
  quality: "low",
  reducedMotion: false,
  activeScene: "hero",
  cursorMode: "none",
};

let snapshot = { ...initialSnapshot };
const listeners = new Set<() => void>();

export function getLandingMotionSnapshot() {
  return snapshot;
}

export function setLandingMotion(patch: Partial<LandingMotionSnapshot>, notify = false) {
  snapshot = { ...snapshot, ...patch };
  if (notify) listeners.forEach((listener) => listener());
}

export function resetLandingMotion() {
  snapshot = { ...initialSnapshot };
  listeners.forEach((listener) => listener());
}

export function subscribeLandingMotion(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
