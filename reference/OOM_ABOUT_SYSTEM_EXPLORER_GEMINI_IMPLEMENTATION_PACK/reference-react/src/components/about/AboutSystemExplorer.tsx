import { AboutCourseSelector } from "./AboutCourseSelector";
import { AboutLevelSelector } from "./AboutLevelSelector";
import { AboutTrainingMap } from "./AboutTrainingMap";
import { useAboutExplorer } from "./useAboutExplorer";
import type { AboutCourseOption, AboutLevelOption } from "./types";

type Props<TCourseId extends string, TLevelId extends string> = {
  courses: AboutCourseOption<TCourseId>[];
  levels: AboutLevelOption<TLevelId>[];
  reducedMotion: boolean;
};

export function AboutSystemExplorer<
  TCourseId extends string,
  TLevelId extends string,
>({
  courses,
  levels,
  reducedMotion,
}: Props<TCourseId, TLevelId>) {
  const explorer = useAboutExplorer({
    courses,
    levels,
  });

  return (
    <section className="about-explorer">
      <div className="about-explorer__inputs">
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
          className="about-explorer__all"
          aria-pressed={explorer.focusMode === "all"}
          onClick={explorer.showAll}
        >
          전체 시스템 보기
        </button>
      </div>

      <AboutTrainingMap
        courseLabel={explorer.selectedCourse.label}
        levelSectionLabel={explorer.selectedLevel.sectionLabel}
        levelLabel={explorer.selectedLevel.label}
        targetSecondsLabel={explorer.selectedLevel.targetSecondsLabel}
        focusMode={explorer.focusMode}
      />
    </section>
  );
}
