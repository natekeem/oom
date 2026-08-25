export type LandingQuality = "high" | "medium" | "low";

export type LandingMotionSnapshot = {
  pageProgress: number;
  sceneProgress: number;
  pointerX: number;
  pointerY: number;
  pointerSpeed: number;
  quality: LandingQuality;
  reducedMotion: boolean;
};

let snapshot: LandingMotionSnapshot = {
  pageProgress: 0,
  sceneProgress: 0,
  pointerX: 0,
  pointerY: 0,
  pointerSpeed: 0,
  quality: "medium",
  reducedMotion: false,
};

const listeners = new Set<() => void>();

export function getLandingMotionSnapshot() {
  return snapshot;
}

export function setLandingMotion(
  patch: Partial<LandingMotionSnapshot>,
  notify = false,
) {
  snapshot = { ...snapshot, ...patch };

  // High-frequency pointer/scroll writes usually pass notify=false.
  // React does not need to re-render every frame.
  if (notify) {
    listeners.forEach((listener) => listener());
  }
}

export function subscribeLandingMotion(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
