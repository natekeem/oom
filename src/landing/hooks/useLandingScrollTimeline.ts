import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { resetLandingMotion, setLandingMotion, type LandingCursorMode, type LandingScene } from "../landingMotionStore";

gsap.registerPlugin(ScrollTrigger);

const cursorModes: Record<LandingScene, LandingCursorMode> = {
  hero: "fluid",
  story: "attract",
  levels: "parallax",
  journey: "activate",
  pivot: "attract",
  exam: "tilt",
  ecosystem: "magnetic",
  final: "magnetic",
};

export function useLandingScrollTimeline(rootRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setLandingMotion({ pageProgress: self.progress }),
      });

      root.querySelectorAll<HTMLElement>("[data-landing-scene]").forEach((section) => {
        const scene = section.dataset.landingScene as LandingScene;
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => setLandingMotion({ activeScene: scene, cursorMode: cursorModes[scene] }, true),
          onEnterBack: () => setLandingMotion({ activeScene: scene, cursorMode: cursorModes[scene] }, true),
          onUpdate: (self) => setLandingMotion({ sceneProgress: self.progress }),
        });
      });

      gsap.fromTo(".landing-hero-copy > *", { y: 32, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 1.05,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      });

      root.querySelectorAll<HTMLElement>(".landing-copy").forEach((copy) => {
        const kicker = copy.querySelector<HTMLElement>(".landing-kicker");
        const heading = copy.querySelector<HTMLElement>("h2");
        const description = copy.querySelector<HTMLElement>(".landing-description");
        const items = [kicker, heading, description].filter(Boolean) as HTMLElement[];
        if (!items.length) return;
        gsap.fromTo(items, { yPercent: 16, autoAlpha: 0 }, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.09,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: copy, start: "top 82%", once: true },
        });
      });

      gsap.to("[data-landing-nav]", {
        backgroundColor: "rgba(7, 9, 13, 0.82)",
        borderBottomColor: "rgba(255, 255, 255, 0.08)",
        scrollTrigger: { trigger: root, start: "top -80", end: "top -240", scrub: true },
      });

      gsap.fromTo(".landing-story-branch", { x: -38, autoAlpha: 0 }, {
        x: 0,
        autoAlpha: 1,
        duration: 0.75,
        stagger: 0.11,
        ease: "power2.out",
        scrollTrigger: { trigger: ".landing-story-map", start: "top 76%", once: true },
      });

      gsap.utils.toArray<HTMLElement>(".landing-level").forEach((level, index) => {
        gsap.fromTo(level, { xPercent: index % 2 === 0 ? -5 : 5, autoAlpha: 0.35 }, {
          xPercent: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: level, start: "top 90%", end: "top 64%", scrub: 0.65 },
        });
      });

      const pivotTimeline = gsap.timeline({
        scrollTrigger: { trigger: ".landing-pivot-demo", start: "top 76%", once: true },
      });
      pivotTimeline
        .fromTo(".landing-question-base", { xPercent: -8, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" })
        .fromTo(".landing-pivot-arrow", { scaleX: 0, transformOrigin: "left", autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, "-=0.18")
        .fromTo(".landing-question-pivot", { xPercent: 8, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }, "-=0.12")
        .fromTo(".landing-fact", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.18");

      const examTimeline = gsap.timeline({
        scrollTrigger: { trigger: ".landing-exam", start: "top 72%", end: "center 42%", scrub: 0.65 },
      });
      examTimeline
        .fromTo(".landing-rec-handoff", { y: -120, scale: 0.25, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: "power3.out" })
        .to(".landing-rec-handoff", { y: 170, xPercent: 260, scale: 0.16, autoAlpha: 0, duration: 0.38, ease: "power2.in" })
        .fromTo(".landing-exam-console", { y: 72, autoAlpha: 0.35 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, "-=0.18")
        .fromTo(".landing-mini-wave i", { scaleY: 0.14, transformOrigin: "center" }, { scaleY: 1, stagger: 0.025, duration: 0.28, ease: "power2.out" }, "-=0.18")
        .fromTo(".landing-review-panel > p, .landing-review-panel li", { x: 14, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.06, duration: 0.28 }, "-=0.08");

      gsap.fromTo(".landing-editorial-links a", { xPercent: -4, autoAlpha: 0.45 }, {
        xPercent: 0,
        autoAlpha: 1,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: ".landing-editorial-links", start: "top 84%", end: "center 58%", scrub: 0.6 },
      });

      gsap.fromTo(".landing-final-ring", { scale: 0.72, autoAlpha: 0.2 }, {
        scale: 1,
        autoAlpha: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".landing-final", start: "top 76%", end: "center center", scrub: 0.7 },
      });

      media.add("(min-width: 901px) and (pointer: fine)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".landing-step-list li");
        const journeyTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".landing-journey",
            start: "top top",
            end: "+=1300",
            pin: true,
            scrub: 0.75,
            anticipatePin: 1,
          },
        });
        journeyTimeline.fromTo(steps, { autoAlpha: 0.28 }, { autoAlpha: 1, stagger: 0.16, duration: 1 });
      });
    }, root);

    return () => {
      media.revert();
      context.revert();
      resetLandingMotion();
    };
  }, [enabled, rootRef]);
}
