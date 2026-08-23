import { Link } from "react-router-dom";
import { AboutCourseSelector } from "./AboutCourseSelector";
import { AboutLevelSelector } from "./AboutLevelSelector";
import { AboutTrainingMap } from "./AboutTrainingMap";
import { useAboutExplorer } from "./useAboutExplorer";
import type { AboutCourseOption, AboutLevelOption } from "./types";

type Props<TCourseId extends string, TLevelId extends string> = {
  courses: AboutCourseOption<TCourseId>[];
  levels: AboutLevelOption<TLevelId>[];
  reducedMotion?: boolean;
};

export function AboutSystemExplorer<
  TCourseId extends string,
  TLevelId extends string,
>({
  courses,
  levels,
  reducedMotion = false,
}: Props<TCourseId, TLevelId>) {
  const explorer = useAboutExplorer({
    courses,
    levels,
  });

  return (
    <section className="grid min-h-0 grid-cols-1 gap-3.5 lg:grid-cols-[310px_minmax(0,1fr)] items-stretch">
      <div className="grid min-h-0 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <AboutCourseSelector
          courses={courses}
          selectedId={explorer.selectedCourseId}
          focused={explorer.focusMode === "course" || explorer.focusMode === "all"}
          reducedMotion={reducedMotion}
          onFocusPanel={explorer.focusCourse}
          onSelect={explorer.selectCourse}
        />

        <AboutLevelSelector
          levels={levels}
          selectedId={explorer.selectedLevelId}
          focused={explorer.focusMode === "level" || explorer.focusMode === "all"}
          onFocusPanel={explorer.focusLevel}
          onSelect={explorer.selectLevel}
        />

        <button
          type="button"
          className={`col-span-1 rounded-xl border p-2.5 text-[10px] transition duration-200 sm:col-span-2 lg:col-span-1 ${
            explorer.focusMode === "all"
              ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-[#595e70] dark:bg-[#14161d] dark:text-[#e5e7ec]"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-[#30333e] dark:bg-[#0f1015] dark:text-[#969dad] dark:hover:border-[#595e70] dark:hover:bg-[#14161d] dark:hover:text-[#e5e7ec]"
          }`}
          aria-pressed={explorer.focusMode === "all"}
          onClick={explorer.showAll}
        >
          전체 시스템 보기
        </button>
      </div>

      <div className="flex min-h-0 flex-col gap-3.5 h-full">
        <AboutTrainingMap
          courseLabel={explorer.selectedCourse.label}
          levelSectionLabel={explorer.selectedLevel.sectionLabel}
          levelLabel={explorer.selectedLevel.label}
          targetSecondsLabel={explorer.selectedLevel.targetSecondsLabel}
          focusMode={explorer.focusMode}
        />
        
        <div className="mt-auto flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[11px] text-zinc-500 dark:text-[#8d94a3] leading-relaxed">
            <strong className="font-bold text-zinc-900 dark:text-[#d9dbe1]">현재 흐름:</strong> {explorer.selectedCourse.label}의 story를 준비하고 &rarr; {explorer.selectedLevel.sectionLabel} 밀도로 바꾸어 &rarr; 말하고 AI 피드백으로 다시 시도합니다.
            <div className="mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500">AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.</div>
          </div>
          
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/training/" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2.5 text-[11px] font-bold text-white no-underline transition hover:bg-indigo-700 dark:bg-[#6259f4] dark:hover:bg-[#5148e7]">
              실전 훈련 둘러보기
            </Link>
            <Link to="/exam-guide/" className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-[11px] font-bold text-zinc-700 no-underline transition hover:bg-zinc-50 dark:border-[#343743] dark:bg-transparent dark:text-[#d9dbe1] dark:hover:bg-[#1a1c23]">
              수험 가이드
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
