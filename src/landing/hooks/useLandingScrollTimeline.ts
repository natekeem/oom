import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { LANDING_SCENE_CURSOR_MODES, resetLandingMotion, setLandingMotion, type LandingScene } from "../landingMotionStore";

gsap.registerPlugin(ScrollTrigger);

export function useLandingScrollTimeline(rootRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let activeScene: LandingScene | null = null;
    const activateScene = (scene: LandingScene, sceneProgress = 0) => {
      const sceneChanged = activeScene !== scene;
      activeScene = scene;
      const cursorMode = LANDING_SCENE_CURSOR_MODES[scene];
      root.dataset.landingActiveScene = scene;
      root.dataset.landingPointerMode = cursorMode;
      setLandingMotion({ activeScene: scene, cursorMode, sceneProgress }, sceneChanged);
    };
    activateScene("hero", 0);

    const sceneSections = Array.from(root.querySelectorAll<HTMLElement>("[data-landing-scene]"));
    let sceneSyncFrame = 0;
    const syncActiveScene = () => {
      sceneSyncFrame = 0;
      const viewportCenter = window.innerHeight / 2;
      let closestSection = sceneSections[0];
      let closestRect = closestSection?.getBoundingClientRect();
      let closestDistance = Number.POSITIVE_INFINITY;

      sceneSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = rect.top <= viewportCenter && rect.bottom >= viewportCenter
          ? 0
          : Math.min(Math.abs(rect.top - viewportCenter), Math.abs(rect.bottom - viewportCenter));
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = section;
          closestRect = rect;
        }
      });

      const scene = closestSection?.dataset.landingScene as LandingScene | undefined;
      if (scene && closestRect) {
        const rawProgress = (viewportCenter - closestRect.top) / Math.max(1, closestRect.height);
        let sceneProgress = rawProgress;
        if (scene === "hero") {
          const heroTravel = Math.max(1, Math.min(closestRect.height, window.innerHeight * 0.52));
          sceneProgress = Math.max(0, -closestRect.top) / heroTravel;
        } else if (scene === "final") {
          const finalTravel = Math.max(0, closestRect.height - window.innerHeight);
          const finalMaximum = (viewportCenter + finalTravel) / Math.max(1, closestRect.height);
          sceneProgress = rawProgress / Math.max(0.0001, finalMaximum);
        }
        sceneProgress = Math.max(0, Math.min(1, sceneProgress));
        activateScene(scene, sceneProgress);
      }
    };
    const requestSceneSync = () => {
      if (sceneSyncFrame) return;
      sceneSyncFrame = window.requestAnimationFrame(syncActiveScene);
    };
    window.addEventListener("scroll", requestSceneSync, { passive: true });
    window.addEventListener("resize", requestSceneSync, { passive: true });
    requestSceneSync();

    const context = enabled ? gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setLandingMotion({ pageProgress: self.progress }),
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

      root.querySelectorAll<HTMLElement>(".landing-signal-trace").forEach((trace) => {
        const core = trace.querySelector<HTMLElement>(".landing-trace-core");
        const particles = trace.querySelectorAll<HTMLElement>(".landing-trace-points span");
        if (core) {
          gsap.fromTo(core, { scaleX: 0, transformOrigin: "left center" }, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: trace, start: "top 88%", end: "bottom 48%", scrub: 0.55 },
          });
        }
        if (particles.length) {
          gsap.fromTo(particles, { autoAlpha: 0.16, scale: 0.55 }, {
            autoAlpha: 1,
            scale: 1,
            stagger: 0.045,
            ease: "power2.out",
            scrollTrigger: { trigger: trace, start: "top 84%", end: "bottom 54%", scrub: 0.45 },
          });
        }
      });

      gsap.utils.toArray<HTMLElement>(".landing-level").forEach((level, index) => {
        gsap.fromTo(level, { xPercent: index % 2 === 0 ? -5 : 5, autoAlpha: 0.35 }, {
          xPercent: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: level, start: "top 90%", end: "top 64%", scrub: 0.65 },
        });
      });

      const steps = gsap.utils.toArray<HTMLElement>(".landing-step-list li");
      gsap.fromTo(".landing-step-list", { "--journey-trace-progress": "0%" }, {
        "--journey-trace-progress": "100%",
        ease: "none",
        scrollTrigger: {
          trigger: ".landing-step-list",
          start: "top 84%",
          end: "bottom 58%",
          scrub: 0.7,
        },
      });
      const journeyTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".landing-journey",
          start: "top 80%",
          end: "bottom 20%",
          pin: false,
          scrub: 0.75,
        },
      });
      journeyTimeline.fromTo(steps, { autoAlpha: 0.28 }, { autoAlpha: 1, stagger: 0.16, duration: 1 });

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
        .fromTo(".landing-rec-handoff", { scale: 0.35, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.42, ease: "power3.out" })
        .fromTo(".landing-practice-frame", { y: 72, autoAlpha: 0.35 }, { y: 0, autoAlpha: 1, duration: 0.58, ease: "power3.out" }, "-=0.2");

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

    }, root) : undefined;

    return () => {
      context?.revert();
      window.cancelAnimationFrame(sceneSyncFrame);
      window.removeEventListener("scroll", requestSceneSync);
      window.removeEventListener("resize", requestSceneSync);
      delete root.dataset.landingActiveScene;
      delete root.dataset.landingPointerMode;
      resetLandingMotion();
    };
  }, [enabled, rootRef]);
}
