import { forwardRef } from "react";

export const StorySection = forwardRef<HTMLElement>(function StorySection(_, ref) {
  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center px-6 py-28 md:px-[8vw]"
    >
      <div className="relative z-10 max-w-6xl" data-landing-reveal>
        <p className="mb-5 text-xs uppercase tracking-[0.25em] text-zinc-500">
          One story · many directions
        </p>

        <h2 className="text-[clamp(3.2rem,8vw,7.5rem)] font-black leading-[0.88] tracking-[-0.065em] text-white">
          ONE STORY.
          <br />
          MANY QUESTIONS.
        </h2>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-2xl">
          질문마다 새 답안을 외우지 않습니다. 같은 장면에서 필요한 fact를
          꺼내고, 질문의 방향만 바꿉니다.
        </p>
      </div>
    </section>
  );
});
