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

  const moduleBase = "relative flex flex-col justify-center overflow-hidden rounded-[12px] border p-3.5 transition-all duration-200 opacity-[0.55]";
  const moduleActive = "!opacity-100 translate-x-[2px]";
  const courseClass = `${moduleBase} border-zinc-700 bg-[#15171e] dark:border-[#2a2e38] ${isCourseActive ? `!border-indigo-500 !bg-indigo-950/40 dark:!border-[#5f62d8] dark:!bg-[#181a26] dark:shadow-[inset_0_0_0_1px_rgba(95,98,216,0.08)] ${moduleActive}` : ""}`;
  const levelClass = `${moduleBase} border-zinc-700 bg-[#15171e] dark:border-[#2a2e38] ${isLevelActive ? `!border-emerald-500 !bg-emerald-950/40 dark:!border-[#44bc90] dark:!bg-[#14201c] ${moduleActive}` : ""}`;
  const bothClass = `${moduleBase} border-zinc-700 bg-[#15171e] dark:border-[#2a2e38] ${isCourseActive || isLevelActive ? `!border-indigo-400 !bg-[#181a24] dark:!border-[#6a6f94] ${moduleActive}` : ""}`;

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-gradient-to-br from-zinc-100 to-white p-4 dark:border-[#292c36] dark:from-[#101118] dark:to-[#0b0c10]" aria-label="OOM 훈련 시스템">
      <div className="pointer-events-none absolute left-1/2 top-[45%] h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,94,255,0.06),transparent_68%)] transition duration-300 dark:bg-[radial-gradient(circle,rgba(103,94,255,0.1),transparent_68%)]" />
      
      <header className="relative z-10 mb-2.5 flex items-center justify-between">
        <b className="text-[12px] tracking-[0.15em] text-zinc-500 dark:text-[#a8aeba]">OOM TRAINING SYSTEM</b>
        <span className="rounded-full border border-zinc-200 px-2 py-1 text-[9px] text-zinc-500 dark:border-[#343846] dark:text-[#8f96a5]">{focusMode.toUpperCase()} FOCUS</span>
      </header>

      <div className="relative z-10 mb-2.5 flex items-center justify-between gap-2.5 overflow-hidden rounded-[11px] border border-zinc-200 bg-white py-2 pl-3 pr-2.5 transition duration-200 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.5 before:bg-indigo-500 dark:border-[#34384b] dark:bg-[#151824] dark:before:bg-[#7771ff]">
        <div className="flex min-w-0 items-center gap-2">
          <b className="shrink-0 text-[9px] tracking-[0.13em] text-indigo-600 dark:text-[#aab2ff]">TRAINING CONTEXT</b>
          <strong className="truncate text-[12px] text-zinc-900 dark:text-white">
            {courseLabel} &times; {levelSectionLabel}
          </strong>
        </div>
        <span className="shrink-0 whitespace-nowrap text-[9px] text-zinc-500 dark:text-[#9097a6]">
          {levelLabel} &middot; {targetSecondsLabel}
        </span>
      </div>

      <div className="relative z-10 mb-2.5 grid min-h-0 flex-1 grid-cols-1 gap-2.5 md:grid-cols-[1fr_38px_1fr]">
        <div className="grid min-h-0 grid-rows-3 gap-2">
          <article className={courseClass}>
            <b className="text-[9.5px] tracking-[0.12em] text-zinc-500 dark:text-[#9da4b2]">STEP 2</b>
            <strong className="mt-1 text-[13px] text-zinc-900 dark:text-white">추천 서베이</strong>
            <small className="mt-1 text-[10px] leading-[1.35] text-zinc-500 dark:text-[#848b99]">Course가 준비할 범위를 정합니다.</small>
          </article>

          <article className={courseClass}>
            <b className="text-[9.5px] tracking-[0.12em] text-zinc-500 dark:text-[#9da4b2]">STORY POOL</b>
            <strong className="mt-1 text-[13px] text-zinc-900 dark:text-white">핵심 장면</strong>
            <small className="mt-1 text-[10px] leading-[1.35] text-zinc-500 dark:text-[#848b99]">같은 story를 여러 질문에 재사용합니다.</small>
          </article>

          <article className={levelClass}>
            <b className="text-[9.5px] tracking-[0.12em] text-zinc-500 dark:text-[#9da4b2]">STEP 3</b>
            <strong className="mt-1 text-[13px] text-zinc-900 dark:text-white">난이도</strong>
            <small className="mt-1 text-[10px] leading-[1.35] text-zinc-500 dark:text-[#848b99]">Level이 질문 복잡도를 조절합니다.</small>
          </article>
        </div>

        <div className="relative hidden items-center justify-center md:flex before:absolute before:bottom-0 before:top-0 before:w-px before:bg-[linear-gradient(transparent,#e4e4e7_15%,#e4e4e7_85%,transparent)] dark:before:bg-[linear-gradient(transparent,#363a47_15%,#363a47_85%,transparent)]">
          <div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-[12px] text-zinc-400 transition duration-200 dark:border-[#7774ff] dark:bg-[#101218] dark:text-[#b0b5c3] ${isCourseActive || isLevelActive ? "border-indigo-400 shadow-[0_0_20px_rgba(103,94,255,0.12)] dark:border-[#7774ff]" : ""}`}>
            O
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-3 gap-2">
          <article className={bothClass}>
            <b className="text-[9.5px] tracking-[0.12em] text-zinc-500 dark:text-[#9da4b2]">STEP 4</b>
            <strong className="mt-1 text-[13px] text-zinc-900 dark:text-white">스크립트 &middot; 질문 변형</strong>
            <small className="mt-1 text-[10px] leading-[1.35] text-zinc-500 dark:text-[#848b99]">Course의 사실을 Level 밀도로 말합니다.</small>
          </article>

          <article className={levelClass}>
            <b className="text-[9.5px] tracking-[0.12em] text-zinc-500 dark:text-[#9da4b2]">ANSWER DENSITY</b>
            <strong className="mt-1 text-[13px] text-zinc-900 dark:text-white">길이 &middot; 구체성</strong>
            <small className="mt-1 text-[10px] leading-[1.35] text-zinc-500 dark:text-[#848b99]">
              {levelSectionLabel} &middot; {targetSecondsLabel}
            </small>
          </article>

          <article className={`relative flex flex-col justify-center overflow-hidden rounded-[12px] border border-zinc-200 bg-zinc-50 p-3.5 transition duration-200 opacity-[0.55] dark:border-[#2a2e38] dark:bg-[#15171e] ${isCourseActive || isLevelActive ? "!opacity-100 !border-indigo-500 !bg-indigo-50/50 dark:!border-[#6064d8] dark:!bg-[#181a26] dark:shadow-[inset_0_0_0_1px_rgba(95,98,216,0.08)]" : ""}`}>
            <b className="text-[9.5px] tracking-[0.12em] text-indigo-500 dark:text-[#aab1ff]">STEP 6</b>
            <strong className="mt-1 text-[13px] text-zinc-900 dark:text-white">실전 연습</strong>
            <small className="mt-1 text-[10px] leading-[1.35] text-zinc-500 dark:text-[#848b99]">Listen &rarr; Speak &rarr; Review &rarr; Retry</small>
          </article>
        </div>
      </div>

      <div className="relative z-10 grid shrink-0 grid-cols-1 gap-2.5 md:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-3 transition duration-200 dark:border-[#2c303a] dark:bg-[#12141a]">
          <b className="text-[9.5px] tracking-[0.13em] text-zinc-500 dark:text-[#a2a9b7]">6 STEP TRAINING PATH</b>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {["목표·코스", "서베이", "난이도", "스크립트", "롤플레이", "실전"].map((label, index) => {
              let isActive = false;
              if (focusMode === "all") isActive = true;
              else if (focusMode === "course" && [1, 3, 5].includes(index)) isActive = true;
              else if (focusMode === "level" && [2, 3, 5].includes(index)) isActive = true;

              return (
                <div key={label} className={`rounded-[7px] border p-1.5 text-center text-[8.5px] transition duration-150 ${isActive ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-[#6064d8] dark:bg-[#191b27] dark:text-[#f2f3f6]" : "border-zinc-200 text-zinc-500 dark:border-[#2a2e38] dark:text-[#7f8695]"}`}>
                  {index + 1}<br/>{label}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`rounded-[12px] border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 p-3 transition duration-200 dark:border-[#2c303a] dark:from-[#17182a] dark:to-[#11131a] ${isLevelActive ? "" : "opacity-[0.65]"}`}>
          <b className="text-[9.5px] tracking-[0.13em] text-indigo-600 dark:text-[#aab2ff]">AI COACH</b>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {["KEEP", "FIX", "RETRY"].map((label) => (
              <div key={label} className={`rounded-[7px] border p-1.5 text-center text-[8.5px] transition duration-150 ${isLevelActive ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-[#6267dc] dark:bg-[#1a1c2b] dark:text-[#fff]" : "border-zinc-200 text-zinc-500 dark:border-[#2e3241] dark:text-[#9198a8]"}`}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
