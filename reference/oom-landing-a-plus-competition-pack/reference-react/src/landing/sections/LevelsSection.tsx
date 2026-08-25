import { forwardRef } from "react";

const levels = [
  ["3구간", "Foundation", "30–45초"],
  ["2구간", "Intermediate", "45–65초"],
  ["1구간", "Advanced", "60–90초"],
];

export const LevelsSection = forwardRef<HTMLElement>(function LevelsSection(_, ref) {
  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center px-6 py-28 md:px-[8vw]"
    >
      <div className="relative z-10 w-full max-w-6xl" data-landing-reveal>
        <p className="mb-5 text-xs uppercase tracking-[0.25em] text-zinc-500">
          Same scene · three levels
        </p>

        <h2 className="text-[clamp(3rem,7.2vw,7rem)] font-black leading-[0.9] tracking-[-0.06em] text-white">
          YOUR STORY
          <br />
          GROWS WITH YOU.
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {levels.map(([name, label, time]) => (
            <div key={name} className="border-t border-white/15 pt-5">
              <strong className="block text-3xl text-white">{name}</strong>
              <span className="mt-2 block text-sm text-zinc-400">
                {label} · {time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
