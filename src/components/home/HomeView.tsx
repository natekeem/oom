import { OomBrandMark } from "../brand/OomBrandMark";
import { AboutSystemExplorer } from "./AboutSystemExplorer";
import { makeAboutCourses, makeAboutLevels } from "./aboutSystemModel";
import "./home.css";

export function HomeView() {
  const courses = makeAboutCourses();
  const levels = makeAboutLevels();
  
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:gap-6" data-about-overview>
      <header className="flex items-start gap-3.5">
        <OomBrandMark className="mt-1 text-indigo-600 dark:text-indigo-300" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-400 dark:text-[#9ea8ff]">OOM · OPIC ON ME</p>
          <h1 className="mt-1.5 text-[32px] font-bold tracking-[-0.045em] text-zinc-950 dark:text-white leading-none">오픽온미란?</h1>
          <p className="mt-2 text-[14px] text-zinc-600 dark:text-[#d5d7de] whitespace-normal xl:whitespace-nowrap">
            Course로 준비 범위를 정하고, Level로 답변 밀도를 맞춘 뒤, 6단계 훈련과 AI 재시도로 연결합니다.
          </p>
        </div>
      </header>

      <dl aria-label="OOM 시스템 구성" className="grid grid-cols-2 gap-y-2 border-y border-zinc-200 dark:border-[#292c36] sm:grid-cols-4 sm:gap-y-0 h-[60px]" data-about-metrics>
        <div className="group relative flex items-center gap-3 overflow-hidden border-zinc-200 px-4 first:pl-0 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <div className="absolute bottom-0 left-0 right-[100%] h-0.5 bg-indigo-500 transition-all duration-200 group-hover:right-[80%]" />
          <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-indigo-400 dark:text-white dark:group-hover:text-indigo-300">{courses.length}</dd>
          <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">COURSES</dt>
        </div>
        <div className="group relative flex items-center gap-3 overflow-hidden border-zinc-200 px-4 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <div className="absolute bottom-0 left-0 right-[100%] h-0.5 bg-emerald-500 transition-all duration-200 group-hover:right-[80%]" />
          <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-emerald-400 dark:text-white dark:group-hover:text-emerald-400">{levels.length}</dd>
          <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">LEVELS</dt>
        </div>
        <div className="group relative flex items-center gap-3 overflow-hidden border-zinc-200 px-4 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <div className="absolute bottom-0 left-0 right-[100%] h-0.5 bg-indigo-500 transition-all duration-200 group-hover:right-[80%]" />
          <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-indigo-400 dark:text-white dark:group-hover:text-indigo-300">6</dd>
          <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">STEPS</dt>
        </div>
        <div className="group relative flex items-center gap-3 overflow-hidden px-4">
          <div className="absolute bottom-0 left-0 right-[100%] h-0.5 bg-indigo-500 transition-all duration-200 group-hover:right-[80%]" />
          <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-indigo-500 dark:text-white dark:group-hover:text-[#aeb5ff]">AI</dd>
          <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">COACH</dt>
        </div>
      </dl>

      <AboutSystemExplorer courses={courses} levels={levels} />

    </div>
  );
}
