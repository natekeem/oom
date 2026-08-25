import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Options = {
  enabled: boolean;
};

export function useLandingLenis({ enabled }: Options) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
    });

    const onScroll = () => ScrollTrigger.update();
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", onScroll);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [enabled]);
}
