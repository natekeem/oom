export type LandingQuality = "high" | "medium" | "low";
export type LandingScene = "hero" | "story" | "levels" | "journey" | "pivot" | "practice" | "ai" | "final";
export type LandingCursorMode = "fluid" | "attract" | "parallax" | "activate" | "tilt" | "ambient" | "reconverge" | "none";

export const LANDING_SCENE_CURSOR_MODES: Record<LandingScene, Exclude<LandingCursorMode, "none">> = {
  hero: "fluid",
  story: "attract",
  levels: "parallax",
  journey: "activate",
  pivot: "attract",
  practice: "tilt",
  ai: "ambient",
  final: "reconverge",
};

export const LANDING_SCENE_POINTER_STRENGTHS: Record<LandingScene, number> = {
  hero: 1,
  story: 0.7,
  levels: 0.65,
  journey: 0.55,
  pivot: 0.4,
  practice: 0.3,
  ai: 0.45,
  final: 0.8,
};

export type SignalSceneLayout = {
  anchorX: number;
  anchorY: number;
  scale: number;
  opacity: number;
  pointSize: number;
  depth: number;
};

export const LANDING_SIGNAL_SCENE_LAYOUTS: Record<LandingScene, SignalSceneLayout> = {
  hero: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.9, pointSize: 1, depth: 0 },
  story: { anchorX: 3.25, anchorY: 0.05, scale: 0.5, opacity: 0.32, pointSize: 0.78, depth: -1 },
  levels: { anchorX: 2.4, anchorY: 0.55, scale: 0.52, opacity: 0.28, pointSize: 0.74, depth: -1.15 },
  journey: { anchorX: 0, anchorY: -2.3, scale: 0.64, opacity: 0.28, pointSize: 0.74, depth: -1.4 },
  pivot: { anchorX: 2.05, anchorY: 0.25, scale: 0.68, opacity: 0.2, pointSize: 0.72, depth: -1.35 },
  practice: { anchorX: 0, anchorY: -1.55, scale: 0.62, opacity: 0.15, pointSize: 0.58, depth: -1.9 },
  ai: { anchorX: 1.5, anchorY: 0.35, scale: 0.76, opacity: 0.23, pointSize: 0.76, depth: -1.2 },
  final: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.95, pointSize: 1, depth: 0 },
};

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
