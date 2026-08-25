import { useMemo, useRef } from "react";
import { PointerSignalTrail } from "./components/PointerSignalTrail";
import { useLandingCapabilities } from "./hooks/useLandingCapabilities";
import { useLandingLenis } from "./hooks/useLandingLenis";
import { useLandingScrollTimeline } from "./hooks/useLandingScrollTimeline";
import { HeroSection } from "./sections/HeroSection";
import { StorySection } from "./sections/StorySection";
import { LevelsSection } from "./sections/LevelsSection";
import { JourneySection } from "./sections/JourneySection";
import { ExamSection } from "./sections/ExamSection";
import { VoiceUniverseCanvas } from "./three/VoiceUniverseCanvas";

export function LandingPage() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const levelsRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const examRef = useRef<HTMLElement>(null);

  const { quality, reducedMotion, coarsePointer } =
    useLandingCapabilities();

  const smoothScrollEnabled = !reducedMotion && !coarsePointer;
  const motionEnabled = !reducedMotion;

  useLandingLenis({ enabled: smoothScrollEnabled });

  const refs = useMemo(
    () => ({
      rootRef,
      heroRef,
      storyRef,
      levelsRef,
      journeyRef,
      examRef,
    }),
    [],
  );

  useLandingScrollTimeline(refs, motionEnabled);

  return (
    <main
      ref={rootRef}
      className="relative min-h-screen overflow-x-clip bg-[#07090d] text-white"
    >
      <VoiceUniverseCanvas
        quality={quality}
        reducedMotion={reducedMotion}
      />

      <PointerSignalTrail
        enabled={!reducedMotion && !coarsePointer && quality !== "low"}
      />

      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,9,13,0.22)_55%,rgba(7,9,13,0.78)_100%)]" />

      <div className="relative z-10">
        <HeroSection ref={heroRef} />
        <StorySection ref={storyRef} />
        <LevelsSection ref={levelsRef} />
        <JourneySection ref={journeyRef} />
        <ExamSection ref={examRef} />

        <section className="flex min-h-[100svh] items-center justify-center px-6 py-28 text-center">
          <div data-landing-reveal>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Start with your voice
            </p>
            <h2 className="mt-5 text-[clamp(4rem,10vw,9rem)] font-black leading-[0.84] tracking-[-0.07em]">
              MAKE IT
              <br />
              YOURS.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-lg text-zinc-400">
              남의 모범답안이 아니라, 내 이야기로 시작하세요.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
