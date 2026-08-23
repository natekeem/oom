export type LandingQuality = "high" | "medium" | "low";
export type LandingScene = "hero" | "story" | "levels" | "journey" | "pivot" | "practice" | "ai" | "final";
export type LandingCursorMode = "fluid" | "attract" | "parallax" | "activate" | "tilt" | "ambient" | "reconverge" | "none";
export type SignaturePhase = "heroO" | "ejected" | "finalO";
export type TraceMode = "underline" | "branch" | "parallel" | "checkpoints" | "bend" | "scan";

export const LANDING_SCENE_SIGNATURE_PHASES: Record<LandingScene, SignaturePhase> = {
  hero: "heroO",
  story: "ejected",
  levels: "ejected",
  journey: "ejected",
  pivot: "ejected",
  practice: "ejected",
  ai: "ejected",
  final: "finalO",
};

export const LANDING_SCENE_TRACE_MODES: Partial<Record<LandingScene, TraceMode>> = {
  story: "branch",
  levels: "parallel",
  journey: "checkpoints",
  pivot: "bend",
  ai: "scan",
};

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
  story: 0.55,
  levels: 0.5,
  journey: 0.45,
  pivot: 0.4,
  practice: 0.3,
  ai: 0.4,
  final: 1,
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
  hero: { anchorX: 0, anchorY: 0, scale: 1.06, opacity: 0.94, pointSize: 1, depth: 0 },
  story: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.16, pointSize: 0.72, depth: 0 },
  levels: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.16, pointSize: 0.7, depth: 0 },
  journey: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.16, pointSize: 0.7, depth: 0 },
  pivot: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.16, pointSize: 0.68, depth: 0 },
  practice: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.16, pointSize: 0.62, depth: 0 },
  ai: { anchorX: 0, anchorY: 0, scale: 1, opacity: 0.16, pointSize: 0.7, depth: 0 },
  final: { anchorX: 0, anchorY: 0, scale: 1.06, opacity: 0.94, pointSize: 1, depth: 0 },
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
