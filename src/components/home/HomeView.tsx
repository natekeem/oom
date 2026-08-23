import { OomBrandMark } from "../brand/OomBrandMark";
import { AboutSystemExplorer } from "./AboutSystemExplorer";
import { makeAboutCourses, makeAboutLevels } from "./aboutSystemModel";
import "./home.css";

export function HomeView() {
  const courses = makeAboutCourses();
  const levels = makeAboutLevels();
  
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:gap-6" data-about-overview>
      <header className="flex items-start gap-3">
        <OomBrandMark className="mt-1 text-indigo-600 dark:text-indigo-300" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-400 dark:text-[#9ea8ff]">OOM · OPIC ON ME</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-[30px] sm:tracking-[-0.045em]">오픽온미란?</h1>
          <p className="mt-1.5 text-[13px] text-zinc-600 dark:text-[#d3d5dc] whitespace-normal sm:whitespace-nowrap">
            Course로 준비 범위를 정하고, Level로 답변 밀도를 맞춘 뒤, 6단계 훈련과 AI 재시도로 연결합니다.
          </p>
        </div>
      </header>

      <dl aria-label="OOM 시스템 구성" className="grid grid-cols-2 gap-y-2 border-y border-zinc-200 py-2 dark:border-[#292c36] sm:grid-cols-4 sm:gap-y-0" data-about-metrics>
        <div className="flex items-baseline gap-2 border-zinc-200 px-4 first:pl-0 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <dd className="text-xl font-bold tracking-[-0.04em] text-zinc-900 dark:text-white sm:text-[21px]">{courses.length}</dd>
          <dt className="text-[9px] font-bold tracking-[0.14em] text-zinc-500 dark:text-[#8f96a5]">COURSES</dt>
        </div>
        <div className="flex items-baseline gap-2 border-zinc-200 px-4 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <dd className="text-xl font-bold tracking-[-0.04em] text-zinc-900 dark:text-white sm:text-[21px]">{levels.length}</dd>
          <dt className="text-[9px] font-bold tracking-[0.14em] text-zinc-500 dark:text-[#8f96a5]">LEVELS</dt>
        </div>
        <div className="flex items-baseline gap-2 border-zinc-200 px-4 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <dd className="text-xl font-bold tracking-[-0.04em] text-zinc-900 dark:text-white sm:text-[21px]">6</dd>
          <dt className="text-[9px] font-bold tracking-[0.14em] text-zinc-500 dark:text-[#8f96a5]">STEPS</dt>
        </div>
        <div className="flex items-baseline gap-2 px-4">
          <dd className="text-xl font-bold tracking-[-0.04em] text-zinc-900 dark:text-white sm:text-[21px]">AI</dd>
          <dt className="text-[9px] font-bold tracking-[0.14em] text-zinc-500 dark:text-[#8f96a5]">COACH</dt>
        </div>
      </dl>

      <AboutSystemExplorer courses={courses} levels={levels} />

    </div>
  );
}
