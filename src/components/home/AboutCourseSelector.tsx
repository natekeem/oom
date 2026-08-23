import { useEffect, useRef } from "react";
import type { AboutCourseOption } from "./types";

type Props<TCourseId extends string> = {
  courses: AboutCourseOption<TCourseId>[];
  selectedId: TCourseId;
  focused: boolean;
  reducedMotion: boolean;
  onFocusPanel: () => void;
  onSelect: (id: TCourseId) => void;
};

export function AboutCourseSelector<TCourseId extends string>({
  courses,
  selectedId,
  focused,
  reducedMotion,
  onFocusPanel,
  onSelect,
}: Props<TCourseId>) {
  const selectedRef = useRef<HTMLButtonElement | null>(null);
  const hasOverflowPotential = courses.length > 3;

  useEffect(() => {
    if (!hasOverflowPotential) return;

    selectedRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [hasOverflowPotential, reducedMotion, selectedId]);

  return (
    <article
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-[17px] border p-4 transition-[border,background-color] duration-200 ${
        focused 
          ? "border-indigo-500 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20" 
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#11131a]"
      }`}
      aria-labelledby="about-course-heading"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-course-option]")) return;
        onFocusPanel();
      }}
    >
      <div
        className={`pointer-events-none absolute -bottom-[105px] -right-[100px] h-[170px] w-[170px] rounded-full border transition-colors duration-200 ${
          focused ? "border-indigo-500/20" : "border-transparent"
        }`}
      />
      <div className="flex items-center justify-between text-zinc-500 dark:text-[#a1a8b6]">
        <b className="text-[10px] tracking-[0.15em]">COURSE</b>
        <span className="rounded-full border border-zinc-200 px-1.5 py-0.5 text-[8px] tracking-[0.1em] dark:border-[#303440] dark:text-[#858c9b]">WHAT</span>
      </div>

      <h2 id="about-course-heading" className="mt-2 text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">무엇을 준비할지</h2>
      <p className="text-[11px] leading-[1.45] text-zinc-600 dark:text-[#858d9d]">반복해서 쓸 이야기의 맥락과 소재를 정합니다.</p>

      <div
        className={`mt-auto flex flex-col gap-1.5 pt-2.5 ${
          hasOverflowPotential ? "max-h-[140px] overflow-y-auto overscroll-contain [scrollbar-gutter:stable]" : ""
        }`}
        aria-label="Course 선택"
      >
        {courses.map((course, index) => {
          const selected = course.id === selectedId;

          return (
            <button
              key={course.id}
              ref={selected ? selectedRef : undefined}
              type="button"
              data-course-option
              className={`relative z-10 flex w-full flex-col items-start justify-center overflow-hidden rounded-lg border px-2.5 py-2 text-left transition duration-150 min-w-0 ${
                selected
                  ? "border-indigo-500 bg-indigo-100 text-indigo-900 dark:border-[#6964ee] dark:bg-[#1c1d2e] dark:text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-[#2d3039] dark:bg-[#161820] dark:text-[#aeb3c0] dark:hover:border-[#4d5260] dark:hover:bg-[#191b24] dark:hover:text-white"
              }`}
              aria-pressed={selected}
              onClick={() => onSelect(course.id)}
            >
              <div className="flex w-full min-w-0 items-center justify-between gap-2">
                <strong className="truncate text-[11px] font-bold">
                  {String(index + 1).padStart(2, "0")} · {course.label}
                </strong>
                {selected && <small className="shrink-0 text-[9px] text-indigo-500 dark:text-[#7f8797]">선택</small>}
              </div>
              {course.helper && <span className="mt-1 w-full truncate text-left text-[9px] text-zinc-500 dark:text-[#8d94a4]">{course.helper}</span>}
            </button>
          );
        })}
      </div>
    </article>
  );
}
