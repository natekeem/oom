import { forwardRef } from "react";

const steps = [
  "목표 · 코스",
  "추천 서베이",
  "난이도",
  "만능 스크립트",
  "롤플레이",
  "실전 연습",
];

export const JourneySection = forwardRef<HTMLElement>(function JourneySection(_, ref) {
  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center px-6 py-28 md:px-[8vw]"
    >
      <div className="relative z-10 w-full max-w-7xl" data-landing-reveal>
        <p className="mb-5 text-xs uppercase tracking-[0.25em] text-zinc-500">
          Training journey
        </p>

        <h2 className="text-[clamp(3rem,7.2vw,7rem)] font-black leading-[0.9] tracking-[-0.06em] text-white">
          SIX STEPS.
          <br />
          ONE VOICE.
        </h2>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-6">
          {steps.map((step, index) => (
            <div key={step} className="border-t border-white/15 pt-5">
              <span className="text-xs text-zinc-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong className="mt-2 block text-base text-white">{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
