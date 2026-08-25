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
    <section
      className={[
        "about-input-card about-input-card--course",
        focused ? "is-focused" : "",
      ].join(" ")}
      aria-labelledby="about-course-heading"
      onClick={(event) => {
        // Let option clicks handle selection without double-running behavior.
        if ((event.target as HTMLElement).closest("[data-course-option]")) return;
        onFocusPanel();
      }}
    >
      <div className="about-input-card__header">
        <span>COURSE</span>
        <span>WHAT</span>
      </div>

      <h2 id="about-course-heading">무엇을 준비할지</h2>
      <p>반복해서 쓸 이야기의 맥락과 소재를 정합니다.</p>

      <div
        className={[
          "about-option-list",
          hasOverflowPotential ? "about-option-list--scrollable" : "",
        ].join(" ")}
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
              className={[
                "about-option",
                selected ? "is-selected" : "",
              ].join(" ")}
              aria-pressed={selected}
              onClick={() => onSelect(course.id)}
            >
              <span>
                {String(index + 1).padStart(2, "0")} · {course.label}
              </span>
              {course.helper ? <small>{course.helper}</small> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
