import { useEffect, useState } from "react";
import {
  setLandingMotion,
  type LandingQuality,
} from "../landingMotionStore";

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
};

export function useLandingCapabilities() {
  const [quality, setQuality] = useState<LandingQuality>("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");

    const update = () => {
      const reduced = reducedQuery.matches;
      const coarse = coarseQuery.matches;
      const nav = navigator as NavigatorWithMemory;
      const cores = navigator.hardwareConcurrency ?? 4;
      const memory = nav.deviceMemory ?? 4;

      let nextQuality: LandingQuality = "medium";

      if (reduced || coarse) {
        nextQuality = "low";
      } else if (cores >= 8 && memory >= 8 && window.innerWidth >= 1280) {
        nextQuality = "high";
      }

      setReducedMotion(reduced);
      setCoarsePointer(coarse);
      setQuality(nextQuality);

      setLandingMotion(
        {
          reducedMotion: reduced,
          quality: nextQuality,
        },
        true,
      );
    };

    update();
    reducedQuery.addEventListener("change", update);
    coarseQuery.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      reducedQuery.removeEventListener("change", update);
      coarseQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { quality, reducedMotion, coarsePointer };
}
