import { RefObject, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { setLandingMotion } from "../landingMotionStore";

gsap.registerPlugin(ScrollTrigger);

type Refs = {
  rootRef: RefObject<HTMLElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  storyRef: RefObject<HTMLElement | null>;
  levelsRef: RefObject<HTMLElement | null>;
  journeyRef: RefObject<HTMLElement | null>;
  examRef: RefObject<HTMLElement | null>;
};

export function useLandingScrollTimeline(
  refs: Refs,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || !refs.rootRef.current) return;

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: refs.rootRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          setLandingMotion({
            pageProgress: self.progress,
          });
        },
      });

      const sections = [
        refs.heroRef.current,
        refs.storyRef.current,
        refs.levelsRef.current,
        refs.journeyRef.current,
        refs.examRef.current,
      ].filter(Boolean) as HTMLElement[];

      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onUpdate(self) {
            setLandingMotion({
              sceneProgress: self.progress,
            });
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-landing-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: 18, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: "power3.out",
            duration: 0.9,
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          },
        );
      });
    }, refs.rootRef);

    return () => {
      context.revert();
    };
  }, [enabled, refs]);
}
