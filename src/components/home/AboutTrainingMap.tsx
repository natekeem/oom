import type { AboutFocusMode } from "./types";

type Props = {
  courseLabel: string;
  levelSectionLabel: string;
  levelLabel: string;
  targetSecondsLabel: string;
  focusMode: AboutFocusMode;
  onShowAll: () => void;
};

export function AboutTrainingMap({
  courseLabel,
  levelSectionLabel,
  levelLabel,
  targetSecondsLabel,
  focusMode,
  onShowAll,
}: Props) {
  const isCourseActive = focusMode === "all" || focusMode === "course";
  const isLevelActive = focusMode === "all" || focusMode === "level";

  const moduleBase = "relative flex flex-col justify-center overflow-hidden rounded-[14px] border p-4 transition-all duration-200 bg-white dark:bg-[#12141a]";
  const moduleActive = "translate-x-[2px] shadow-sm";
  const inactiveBorder = "border-zinc-200 dark:border-[#2a2e38] text-zinc-500 dark:text-[#7f8695]";
  
  const courseActive = `!border-cyan-500 !bg-cyan-50/70 dark:!border-cyan-500/70 dark:!bg-cyan-950/20 ${moduleActive}`;
  const levelActive = `!border-emerald-500 !bg-emerald-50/70 dark:!border-emerald-500/70 dark:!bg-emerald-950/20 ${moduleActive}`;
  const bothActive = `!border-indigo-500 !bg-indigo-50/70 dark:!border-indigo-500/70 dark:!bg-indigo-950/20 ${moduleActive}`;

  const courseClass = `${moduleBase} ${isCourseActive ? courseActive : inactiveBorder}`;
  const levelClass = `${moduleBase} ${isLevelActive ? levelActive : inactiveBorder}`;
  const bothClass = `${moduleBase} ${isCourseActive || isLevelActive ? bothActive : inactiveBorder}`;

  // Helper for text colors inside modules
  const getEyebrowColor = (type: "course" | "level" | "both", active: boolean) => {
    if (!active) return "text-zinc-500 dark:text-[#8f96a5]";
    if (type === "course") return "text-cyan-600 dark:text-cyan-400";
    if (type === "level") return "text-emerald-600 dark:text-emerald-400";
    return "text-indigo-600 dark:text-indigo-400";
  };
  const getTitleColor = (type: "course" | "level" | "both", active: boolean) => {
    if (!active) return "text-zinc-700 dark:text-[#b0b5c3]";
    if (type === "course") return "text-cyan-950 dark:text-cyan-50";
    if (type === "level") return "text-emerald-950 dark:text-emerald-50";
    return "text-indigo-950 dark:text-indigo-50";
  };
  const getDescColor = (type: "course" | "level" | "both", active: boolean) => {
    if (!active) return "text-zinc-500 dark:text-[#7f8695]";
    if (type === "course") return "text-cyan-700 dark:text-cyan-300/80";
    if (type === "level") return "text-emerald-700 dark:text-emerald-300/80";
    return "text-indigo-700 dark:text-indigo-300/80";
  };

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-gradient-to-br from-zinc-100 to-white p-5 dark:border-[#292c36] dark:from-[#101118] dark:to-[#0b0c10]" aria-label="OOM 훈련 시스템">
      <div className="pointer-events-none absolute left-1/2 top-[45%] h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,94,255,0.06),transparent_68%)] transition duration-300 dark:bg-[radial-gradient(circle,rgba(103,94,255,0.1),transparent_68%)]" />
      
      <header className="relative z-10 mb-3 flex items-center justify-between">
        <b className="text-[13px] tracking-[0.15em] text-zinc-500 dark:text-[#a8aeba]">OOM TRAINING SYSTEM</b>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] text-zinc-500 dark:border-[#343846] dark:text-[#8f96a5]">{focusMode.toUpperCase()} FOCUS</span>
          {focusMode !== "all" && (
            <button 
              onClick={onShowAll} 
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-600 transition hover:bg-zinc-50 dark:border-[#343846] dark:bg-[#151824] dark:text-[#a8aeba] dark:hover:bg-[#1c2030]"
              aria-label="전체 시스템 보기"
            >
              전체 보기
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 mb-4 flex items-center justify-between gap-3 overflow-hidden rounded-[12px] border border-zinc-200 bg-white py-2.5 pl-3.5 pr-3 transition duration-200 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.5 before:bg-indigo-500 dark:border-[#34384b] dark:bg-[#151824] dark:before:bg-[#7771ff]">
        <div className="flex min-w-0 items-center gap-2">
          <b className="shrink-0 text-[10.5px] tracking-[0.13em] text-indigo-600 dark:text-[#aab2ff]">TRAINING CONTEXT</b>
          <strong className="truncate text-[13px] text-zinc-900 dark:text-white">
            {courseLabel} &times; {levelSectionLabel}
          </strong>
        </div>
        <span className="shrink-0 whitespace-nowrap text-[11px] text-zinc-500 dark:text-[#9097a6]">
          {levelLabel} &middot; {targetSecondsLabel}
        </span>
      </div>

      <div className="relative z-10 mb-4 grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_38px_1fr]">
        <div className="grid min-h-0 grid-rows-3 gap-3">
          <article className={courseClass}>
            <b className={`text-[10px] tracking-[0.12em] ${getEyebrowColor("course", isCourseActive)}`}>STEP 2</b>
            <strong className={`mt-1.5 text-[14px] ${getTitleColor("course", isCourseActive)}`}>추천 서베이</strong>
            <small className={`mt-1 text-[11px] leading-[1.35] ${getDescColor("course", isCourseActive)}`}>Course가 준비할 범위를 정합니다.</small>
          </article>

          <article className={courseClass}>
            <b className={`text-[10px] tracking-[0.12em] ${getEyebrowColor("course", isCourseActive)}`}>STORY POOL</b>
            <strong className={`mt-1.5 text-[14px] ${getTitleColor("course", isCourseActive)}`}>핵심 장면</strong>
            <small className={`mt-1 text-[11px] leading-[1.35] ${getDescColor("course", isCourseActive)}`}>같은 story를 여러 질문에 재사용합니다.</small>
          </article>

          <article className={levelClass}>
            <b className={`text-[10px] tracking-[0.12em] ${getEyebrowColor("level", isLevelActive)}`}>STEP 3</b>
            <strong className={`mt-1.5 text-[14px] ${getTitleColor("level", isLevelActive)}`}>난이도</strong>
            <small className={`mt-1 text-[11px] leading-[1.35] ${getDescColor("level", isLevelActive)}`}>Level이 질문 복잡도를 조절합니다.</small>
          </article>
        </div>

        <div className="relative hidden items-center justify-center md:flex before:absolute before:bottom-0 before:top-0 before:w-px before:bg-[linear-gradient(transparent,#e4e4e7_15%,#e4e4e7_85%,transparent)] dark:before:bg-[linear-gradient(transparent,#363a47_15%,#363a47_85%,transparent)]">
          <div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-[12px] text-zinc-400 transition duration-200 dark:border-[#7774ff] dark:bg-[#101218] dark:text-[#b0b5c3] ${isCourseActive || isLevelActive ? "border-indigo-400 shadow-[0_0_20px_rgba(103,94,255,0.12)] dark:border-[#7774ff]" : ""}`}>
            O
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-3 gap-3">
          <article className={bothClass}>
            <b className={`text-[10px] tracking-[0.12em] ${getEyebrowColor("both", isCourseActive || isLevelActive)}`}>STEP 4</b>
            <strong className={`mt-1.5 text-[14px] ${getTitleColor("both", isCourseActive || isLevelActive)}`}>스크립트 &middot; 질문 변형</strong>
            <small className={`mt-1 text-[11px] leading-[1.35] ${getDescColor("both", isCourseActive || isLevelActive)}`}>Course의 사실을 Level 밀도로 말합니다.</small>
          </article>

          <article className={levelClass}>
            <b className={`text-[10px] tracking-[0.12em] ${getEyebrowColor("level", isLevelActive)}`}>ANSWER DENSITY</b>
            <strong className={`mt-1.5 text-[14px] ${getTitleColor("level", isLevelActive)}`}>길이 &middot; 구체성</strong>
            <small className={`mt-1 text-[11px] leading-[1.35] ${getDescColor("level", isLevelActive)}`}>
              {levelSectionLabel} &middot; {targetSecondsLabel}
            </small>
          </article>

          <article className={bothClass}>
            <b className={`text-[10px] tracking-[0.12em] ${getEyebrowColor("both", isCourseActive || isLevelActive)}`}>STEP 6</b>
            <strong className={`mt-1.5 text-[14px] ${getTitleColor("both", isCourseActive || isLevelActive)}`}>실전 연습</strong>
            <small className={`mt-1 text-[11px] leading-[1.35] ${getDescColor("both", isCourseActive || isLevelActive)}`}>Listen &rarr; Speak &rarr; Review &rarr; Retry</small>
          </article>
        </div>
      </div>

      <div className="relative z-10 grid shrink-0 grid-cols-1 gap-3 md:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[14px] border border-zinc-200 bg-white p-4 transition duration-200 dark:border-[#2c303a] dark:bg-[#12141a]">
          <b className="text-[10.5px] tracking-[0.13em] text-zinc-500 dark:text-[#a2a9b7]">6 STEP TRAINING PATH</b>
          <div className="mt-2.5 grid grid-cols-6 gap-2">
            {["목표·코스", "서베이", "난이도", "스크립트", "롤플레이", "실전"].map((label, index) => {
              let isActive = false;
              if (focusMode === "all") isActive = true;
              else if (focusMode === "course" && [1, 3, 5].includes(index)) isActive = true;
              else if (focusMode === "level" && [2, 3, 5].includes(index)) isActive = true;

              let colorClass = "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-[#2a2e38] dark:bg-[#15171e] dark:text-[#7f8695]";
              if (isActive) {
                if (focusMode === "course") {
                  colorClass = "border-cyan-400 bg-cyan-50 text-cyan-900 dark:border-cyan-500/70 dark:bg-cyan-950/40 dark:text-cyan-50";
                } else if (focusMode === "level") {
                  colorClass = "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-50";
                } else {
                  colorClass = "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500/70 dark:bg-indigo-950/40 dark:text-indigo-50";
                }
              }

              return (
                <div key={label} className={`rounded-[8px] border p-2 text-center text-[9.5px] transition duration-150 ${colorClass}`}>
                  {index + 1}<br/>{label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[14px] border border-zinc-200 bg-white p-4 transition duration-200 dark:border-[#2c303a] dark:bg-[#12141a]">
          <b className={`text-[10.5px] tracking-[0.13em] ${isCourseActive || isLevelActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-[#a2a9b7]"}`}>AI COACH</b>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {["KEEP", "FIX", "RETRY"].map((label) => {
              const isActive = isCourseActive || isLevelActive;
              const colorClass = isActive 
                ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-500/70 dark:bg-indigo-950/40 dark:text-indigo-50"
                : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-[#2a2e38] dark:bg-[#15171e] dark:text-[#7f8695]";
              
              return (
                <div key={label} className={`rounded-[8px] border p-2 text-center text-[9.5px] transition duration-150 ${colorClass}`}>
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
