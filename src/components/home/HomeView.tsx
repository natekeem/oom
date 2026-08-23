import { Bot, Layers, Route, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { OomBrandMark } from "../brand/OomBrandMark";
import { AboutSystemExplorer } from "./AboutSystemExplorer";
import { makeAboutCourses, makeAboutLevels } from "./aboutSystemModel";
import "./home.css";

export function HomeView() {
  const courses = makeAboutCourses();
  const levels = makeAboutLevels();
  
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:gap-6" data-about-overview>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3.5">
          <OomBrandMark className="mt-1 text-indigo-600 dark:text-indigo-300" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-400 dark:text-[#9ea8ff]">OOM · OPIC ON ME</p>
            <h1 className="mt-1.5 text-[32px] font-bold tracking-[-0.045em] text-zinc-950 dark:text-white leading-none">오픽온미란?</h1>
            <p className="mt-2 text-[14px] text-zinc-600 dark:text-[#d5d7de] whitespace-normal xl:whitespace-nowrap">
              Course로 준비 범위를 정하고, Level로 답변 밀도를 맞춘 뒤, 6단계 훈련과 AI 재시도로 연결합니다.
            </p>
          </div>
        </div>
        
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link to="/training/" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2.5 text-[11px] font-bold text-white no-underline transition hover:bg-indigo-700 dark:bg-[#6259f4] dark:hover:bg-[#5148e7]">
            실전 훈련 둘러보기
          </Link>
          <Link to="/exam-guide/" className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-[11px] font-bold text-zinc-700 no-underline transition hover:bg-zinc-50 dark:border-[#343743] dark:bg-transparent dark:text-[#d9dbe1] dark:hover:bg-[#1a1c23]">
            수험 가이드
          </Link>
        </div>
      </header>

      <dl aria-label="OOM 시스템 구성" className="grid grid-cols-2 gap-y-4 border-y border-zinc-200 py-3.5 dark:border-[#292c36] sm:grid-cols-4 sm:gap-y-0 min-h-[80px]" data-about-metrics>
        <div className="group relative flex flex-col justify-center gap-1.5 overflow-hidden border-zinc-200 px-4 first:pl-0 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <div className="absolute bottom-[-14px] left-0 right-[100%] h-0.5 bg-cyan-500 transition-all duration-200 group-hover:right-[80%]" />
          <div className="flex items-baseline gap-2.5">
            <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">{courses.length}</dd>
            <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">COURSES</dt>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Layers className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-500" />
            주제별 스크립트 풀
          </p>
        </div>
        
        <div className="group relative flex flex-col justify-center gap-1.5 overflow-hidden border-zinc-200 px-4 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <div className="absolute bottom-[-14px] left-0 right-[100%] h-0.5 bg-emerald-500 transition-all duration-200 group-hover:right-[80%]" />
          <div className="flex items-baseline gap-2.5">
            <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-emerald-500 dark:text-white dark:group-hover:text-emerald-400">{levels.length}</dd>
            <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">LEVELS</dt>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500" />
            목표 등급별 답변 밀도
          </p>
        </div>
        
        <div className="group relative flex flex-col justify-center gap-1.5 overflow-hidden border-zinc-200 px-4 last:border-r-0 dark:border-[#292c36] sm:border-r">
          <div className="absolute bottom-[-14px] left-0 right-[100%] h-0.5 bg-indigo-500 transition-all duration-200 group-hover:right-[80%]" />
          <div className="flex items-baseline gap-2.5">
            <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-indigo-500 dark:text-white dark:group-hover:text-indigo-400">6</dd>
            <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">STEPS</dt>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Route className="h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
            체계적인 실전 훈련
          </p>
        </div>
        
        <div className="group relative flex flex-col justify-center gap-1.5 overflow-hidden px-4">
          <div className="absolute bottom-[-14px] left-0 right-[100%] h-0.5 bg-indigo-500 transition-all duration-200 group-hover:right-[80%]" />
          <div className="flex items-baseline gap-2.5">
            <dd className="text-[30px] font-bold tracking-[-0.045em] text-zinc-900 transition-colors duration-200 group-hover:text-indigo-500 dark:text-white dark:group-hover:text-[#aeb5ff]">AI</dd>
            <dt className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 transition-colors duration-200 dark:text-[#8f96a5]">COACH</dt>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Bot className="h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
            실시간 문장 교정 피드백
          </p>
        </div>
      </dl>

      <AboutSystemExplorer courses={courses} levels={levels} />

    </div>
  );
}
