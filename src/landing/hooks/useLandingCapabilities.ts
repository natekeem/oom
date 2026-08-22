import { useEffect, useState } from "react";
import { setLandingMotion, type LandingQuality } from "../landingMotionStore";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

type LandingCapabilities = {
  coarsePointer: boolean;
  finePointer: boolean;
  quality: LandingQuality;
  reducedMotion: boolean;
  webglSupported: boolean;
};

const initialCapabilities: LandingCapabilities = {
  coarsePointer: true,
  finePointer: false,
  quality: "low",
  reducedMotion: false,
  webglSupported: false,
};

function detectWebGlSupport() {
  if (!("WebGLRenderingContext" in window)) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useLandingCapabilities() {
  const [capabilities, setCapabilities] = useState(initialCapabilities);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const fineQuery = window.matchMedia("(pointer: fine)");
    const webglSupported = detectWebGlSupport();

    const update = () => {
      const reducedMotion = reducedQuery.matches;
      const coarsePointer = coarseQuery.matches;
      const finePointer = fineQuery.matches;
      const navigatorWithMemory = navigator as NavigatorWithMemory;
      const cores = navigator.hardwareConcurrency ?? 4;
      const memory = navigatorWithMemory.deviceMemory ?? 4;
      const desktopWidth = window.innerWidth >= 1024;

      let quality: LandingQuality = "medium";
      if (reducedMotion || coarsePointer || !finePointer || !desktopWidth || !webglSupported) quality = "low";
      else if (cores >= 8 && memory >= 8 && window.innerWidth >= 1280) quality = "high";

      const next = { coarsePointer, finePointer, quality, reducedMotion, webglSupported };
      setCapabilities(next);
      setLandingMotion({ quality, reducedMotion }, true);
    };

    update();
    reducedQuery.addEventListener("change", update);
    coarseQuery.addEventListener("change", update);
    fineQuery.addEventListener("change", update);
    window.addEventListener("resize", update, { passive: true });

    return () => {
      reducedQuery.removeEventListener("change", update);
      coarseQuery.removeEventListener("change", update);
      fineQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return capabilities;
}
