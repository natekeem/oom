import { forwardRef } from "react";

export const ExamSection = forwardRef<HTMLElement>(function ExamSection(_, ref) {
  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center px-6 py-28"
    >
      <div
        className="relative z-10 w-full max-w-6xl rounded-[2rem] border border-white/10 bg-zinc-950/70 p-5 backdrop-blur-xl"
        data-landing-reveal
      >
        <div className="flex items-center justify-between px-1 pb-5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          <span>OOM Practice Console</span>
          <span>Listen 0 / 2 · Ready</span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[0.9fr_1.2fr_0.85fr]">
          <div className="min-h-64 rounded-3xl border border-white/10 bg-white/[0.025]" />

          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-white/20 text-2xl text-white">
              ▶
            </div>
          </div>

          <div className="min-h-64 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
              Speak · Review · Retry
            </p>
            <h3 className="mt-5 text-2xl font-semibold text-white">
              듣고, 말하고,
              <br />
              바로 복기합니다.
            </h3>
            <p className="mt-4 leading-relaxed text-zinc-400">
              녹음 → STT → KEEP / FIX / RETRY → 같은 질문 재도전.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
