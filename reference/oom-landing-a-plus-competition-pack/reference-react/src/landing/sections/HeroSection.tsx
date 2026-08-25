import { forwardRef } from "react";

export const HeroSection = forwardRef<HTMLElement>(function HeroSection(_, ref) {
  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center px-6 py-24 text-center"
    >
      <div className="relative z-10 max-w-6xl">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
          Voice · Story · Practice
        </p>

        <h1 className="text-[clamp(4rem,11vw,10rem)] font-black leading-[0.82] tracking-[-0.075em] text-white">
          OPIc,
          <br />
          ON ME.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-2xl">
          많이 외우는 대신, 내 이야기를 여러 질문에 맞게 바꾸어 말하는 훈련.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="/training/"
            className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950"
          >
            실전 훈련 둘러보기
          </a>
          <a
            href="/exam-guide/"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur"
          >
            OPIc 수험 가이드
          </a>
        </div>
      </div>
    </section>
  );
});
