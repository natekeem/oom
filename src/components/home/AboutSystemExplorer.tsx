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
      <div className="grid min-h-0 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
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
      </div>

      <div className="flex min-h-0 flex-col gap-3.5 h-full">
        <AboutTrainingMap
          courseLabel={explorer.selectedCourse.label}
          levelSectionLabel={explorer.selectedLevel.sectionLabel}
          levelLabel={explorer.selectedLevel.label}
          targetSecondsLabel={explorer.selectedLevel.targetSecondsLabel}
          focusMode={explorer.focusMode}
          onShowAll={explorer.showAll}
        />
      </div>
    </section>
  );
}
