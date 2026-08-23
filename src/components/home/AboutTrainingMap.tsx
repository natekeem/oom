import type { AboutFocusMode } from "./types";

type Props = {
  courseLabel: string;
  levelSectionLabel: string;
  levelLabel: string;
  targetSecondsLabel: string;
  focusMode: AboutFocusMode;
};

export function AboutTrainingMap({
  courseLabel,
  levelSectionLabel,
  levelLabel,
  targetSecondsLabel,
  focusMode,
}: Props) {
  const isCourseActive = focusMode === "all" || focusMode === "course";
  const isLevelActive = focusMode === "all" || focusMode === "level";

  const moduleBase = "relative flex min-h-0 flex-col overflow-hidden rounded-xl border p-2.5 transition-all duration-200 opacity-50";
  const moduleActive = "opacity-100 translate-x-[2px]";
  const courseClass = `${moduleBase} border-zinc-700 bg-[#15171e] dark:border-[#292d36] ${isCourseActive ? `!border-indigo-500 !bg-indigo-950/40 dark:!border-[#5e61d8] dark:!bg-[#181925] ${moduleActive}` : ""}`;
  const levelClass = `${moduleBase} border-zinc-700 bg-[#15171e] dark:border-[#292d36] ${isLevelActive ? `!border-emerald-500 !bg-emerald-950/40 dark:!border-[#43b98f] dark:!bg-[#14201c] ${moduleActive}` : ""}`;
  const bothClass = `${moduleBase} border-zinc-700 bg-[#15171e] dark:border-[#292d36] ${isCourseActive || isLevelActive ? `!border-indigo-400 !bg-[#181a24] dark:!border-[#6a6f94] ${moduleActive}` : ""}`;

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[19px] border border-zinc-200 bg-gradient-to-br from-zinc-100 to-white p-3.5 dark:border-[#292c36] dark:from-[#101118] dark:to-[#0b0c10]" aria-label="OOM 훈련 시스템">
      <div className="pointer-events-none absolute left-1/2 top-[45%] h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,94,255,0.06),transparent_68%)] transition duration-300 dark:bg-[radial-gradient(circle,rgba(103,94,255,0.1),transparent_68%)]" />
      
      <header className="relative z-10 flex items-center justify-between mb-2.5">
        <b className="text-[10px] tracking-[0.16em] text-zinc-500 dark:text-[#a4aab8]">OOM TRAINING SYSTEM</b>
        <span className="rounded-full border border-zinc-200 px-2 py-1 text-[8px] text-zinc-500 dark:border-[#303440] dark:text-[#8a91a1]">{focusMode.toUpperCase()} FOCUS</span>
      </header>

      <div className="relative z-10 mb-2.5 flex items-center justify-between gap-2.5 overflow-hidden rounded-xl border border-zinc-200 bg-white py-2 pl-3 pr-2.5 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.5 before:bg-indigo-500 transition duration-200 dark:border-[#323649] dark:bg-[#141723] dark:before:bg-[#7771ff]">
        <div className="flex items-center gap-2">
          <b className="text-[9px] tracking-[0.12em] text-indigo-600 dark:text-[#aab2ff]">TRAINING CONTEXT</b>
          <strong className="text-[11px] text-zinc-900 dark:text-white">
            {courseLabel} &times; {levelSectionLabel}
          </strong>
        </div>
        <span className="text-[8px] text-zinc-500 dark:text-[#9299a8]">
          {levelLabel} &middot; {targetSecondsLabel}
        </span>
      </div>

      <div className="relative z-10 mb-2.5 grid min-h-0 grid-cols-1 gap-2 md:grid-cols-[1fr_36px_1fr]">
        <div className="flex min-h-0 flex-col gap-1.5">
          <article className={courseClass}>
            <b className="text-[8px] tracking-[0.12em] text-zinc-500 dark:text-[#9ca3b1]">STEP 2</b>
            <strong className="mt-0.5 text-[10px] text-zinc-900 dark:text-white">추천 서베이</strong>
            <small className="mt-0.5 text-[8px] leading-snug text-zinc-500 dark:text-[#858c9b]">Course가 준비할 범위를 정합니다.</small>
          </article>

          <article className={courseClass}>
            <b className="text-[8px] tracking-[0.12em] text-zinc-500 dark:text-[#9ca3b1]">STORY POOL</b>
            <strong className="mt-0.5 text-[10px] text-zinc-900 dark:text-white">핵심 장면</strong>
            <small className="mt-0.5 text-[8px] leading-snug text-zinc-500 dark:text-[#858c9b]">같은 story를 여러 질문에 재사용.</small>
          </article>

          <article className={levelClass}>
            <b className="text-[8px] tracking-[0.12em] text-zinc-500 dark:text-[#9ca3b1]">STEP 3</b>
            <strong className="mt-0.5 text-[10px] text-zinc-900 dark:text-white">난이도</strong>
            <small className="mt-0.5 text-[8px] leading-snug text-zinc-500 dark:text-[#858c9b]">Level이 질문 복잡도를 조절합니다.</small>
          </article>
        </div>

        <div className="hidden items-center justify-center relative md:flex before:absolute before:bottom-0 before:top-0 before:w-px before:bg-[linear-gradient(transparent,#e4e4e7_15%,#e4e4e7_85%,transparent)] dark:before:bg-[linear-gradient(transparent,#343847_15%,#343847_85%,transparent)]">
          <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs text-zinc-400 transition duration-200 dark:border-[#63697d] dark:bg-[#11131a] dark:text-[#b0b5c3] ${isCourseActive || isLevelActive ? "border-indigo-400 shadow-[0_0_20px_rgba(103,94,255,0.18)] dark:border-[#7d78ff]" : ""}`}>
            O
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-1.5">
          <article className={bothClass}>
            <b className="text-[8px] tracking-[0.12em] text-zinc-500 dark:text-[#9ca3b1]">STEP 4</b>
            <strong className="mt-0.5 text-[10px] text-zinc-900 dark:text-white">스크립트 &middot; 질문 변형</strong>
            <small className="mt-0.5 text-[8px] leading-snug text-zinc-500 dark:text-[#858c9b]">Course의 사실을 Level 밀도로 말합니다.</small>
          </article>

          <article className={levelClass}>
            <b className="text-[8px] tracking-[0.12em] text-zinc-500 dark:text-[#9ca3b1]">ANSWER DENSITY</b>
            <strong className="mt-0.5 text-[10px] text-zinc-900 dark:text-white">길이 &middot; 구체성</strong>
            <small className="mt-0.5 text-[8px] leading-snug text-zinc-500 dark:text-[#858c9b]">
              {levelSectionLabel} &middot; {targetSecondsLabel}
            </small>
          </article>

          <article className={`relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 transition duration-200 opacity-70 dark:border-[#31354a] dark:bg-[#141621] ${isCourseActive || isLevelActive ? "!opacity-100 !border-indigo-500 !bg-indigo-50/50 dark:!border-[#6560d8] dark:!bg-[#181a29]" : ""}`}>
            <b className="text-[8px] tracking-[0.12em] text-indigo-500 dark:text-[#aab1ff]">STEP 6</b>
            <strong className="mt-0.5 text-[10px] text-zinc-900 dark:text-white">실전 연습</strong>
            <small className="mt-0.5 text-[8px] leading-snug text-zinc-500 dark:text-[#858c9c]">Listen &rarr; Speak &rarr; Review &rarr; Retry</small>
          </article>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-2 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 transition duration-200 dark:border-[#2c303a] dark:bg-[#12141a]">
          <b className="text-[8px] tracking-[0.12em] text-zinc-500 dark:text-[#a0a7b5]">6 STEP TRAINING PATH</b>
          <div className="mt-1.5 grid grid-cols-6 gap-1">
            {["목표·코스", "서베이", "난이도", "스크립트", "롤플레이", "실전"].map((label, index) => {
              let isActive = false;
              if (focusMode === "all") isActive = true;
              else if (focusMode === "course" && [1, 3, 5].includes(index)) isActive = true;
              else if (focusMode === "level" && [2, 3, 5].includes(index)) isActive = true;

              return (
                <div key={label} className={`rounded-md border p-1 text-center text-[7px] transition duration-150 ${isActive ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-[#5e61d8] dark:bg-[#191b26] dark:text-[#e7e8ed]" : "border-zinc-200 text-zinc-500 dark:border-[#292d37] dark:text-[#7f8797]"}`}>
                  {index + 1}<br/>{label}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 p-2.5 transition duration-200 dark:border-[#2c303a] dark:from-[#17182a] dark:to-[#11131a] ${isLevelActive ? "" : "opacity-70"}`}>
          <b className="text-[8px] tracking-[0.12em] text-indigo-600 dark:text-[#aab2ff]">AI COACH</b>
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {["KEEP", "FIX", "RETRY"].map((label) => (
              <div key={label} className={`rounded-md border p-1 text-center text-[7px] transition duration-150 ${isLevelActive ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-[#6267dc] dark:bg-[#1a1c2b] dark:text-[#f0f1f4]" : "border-zinc-200 text-zinc-500 dark:border-[#2d3140] dark:text-[#9299a9]"}`}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
