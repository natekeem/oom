import { useMemo, useState } from "react";
import type {
  AboutCourseOption,
  AboutFocusMode,
  AboutLevelOption,
} from "./types";

type Args<TCourseId extends string, TLevelId extends string> = {
  courses: AboutCourseOption<TCourseId>[];
  levels: AboutLevelOption<TLevelId>[];
  initialLevelId?: TLevelId;
};

export function useAboutExplorer<
  TCourseId extends string,
  TLevelId extends string,
>({
  courses,
  levels,
  initialLevelId,
}: Args<TCourseId, TLevelId>) {
  const firstCourse = courses[0]?.id;
  const preferredLevel =
    (initialLevelId && levels.some((level) => level.id === initialLevelId)
      ? initialLevelId
      : levels[Math.min(1, Math.max(0, levels.length - 1))]?.id);

  if (!firstCourse || !preferredLevel) {
    throw new Error("About explorer requires at least one Course and Level.");
  }

  const [selectedCourseId, setSelectedCourseId] = useState<TCourseId>(firstCourse);
  const [selectedLevelId, setSelectedLevelId] = useState<TLevelId>(preferredLevel);
  const [focusMode, setFocusMode] = useState<AboutFocusMode>("course");

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? courses[0],
    [courses, selectedCourseId],
  );

  const selectedLevel = useMemo(
    () => levels.find((level) => level.id === selectedLevelId) ?? levels[0],
    [levels, selectedLevelId],
  );

  return {
    selectedCourse,
    selectedLevel,
    selectedCourseId,
    selectedLevelId,
    focusMode,

    selectCourse(courseId: TCourseId) {
      setSelectedCourseId(courseId);
      setFocusMode("course");
    },

    selectLevel(levelId: TLevelId) {
      setSelectedLevelId(levelId);
      setFocusMode("level");
    },

    focusCourse() {
      setFocusMode("course");
    },

    focusLevel() {
      setFocusMode("level");
    },

    showAll() {
      setFocusMode("all");
    },
  };
}
