// Adapt to actual OOM types.
// Prefer importing TrainingCourseId / TrainingLevelId from existing source.

export type AboutFocusMode = "course" | "level" | "all";

export type AboutCourseOption<TCourseId extends string = string> = {
  id: TCourseId;
  label: string;
  helper?: string;
};

export type AboutLevelOption<TLevelId extends string = string> = {
  id: TLevelId;
  sectionLabel: string;
  label: string;
  targetSecondsLabel: string;
};

export type AboutExplorerState<
  TCourseId extends string = string,
  TLevelId extends string = string,
> = {
  selectedCourseId: TCourseId;
  selectedLevelId: TLevelId;
  focusMode: AboutFocusMode;
};
