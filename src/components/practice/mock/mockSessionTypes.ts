import type { RecordingResult } from "../Recorder";
import type { TrainingCourseId, TrainingLevelId } from "../../../training/types";

export type MockAdjustment = "easier" | "similar" | "harder";
export type MockQuestionKind = "practice" | "roleplay";

export type MockSurveySelection = {
  selectedOptionIds: string[];
};

export type MockQuestion = {
  mockId: string;
  sourceId: string;
  kind: MockQuestionKind;
  courseId: TrainingCourseId;
  sourceLevelId: TrainingLevelId;
  group: string;
  type: string;
  prompt: string;
  storylineId?: string;
  roleplayId?: string;
};

export type MockSessionPlan = {
  seed: string;
  selectedCourseId: TrainingCourseId;
  selectedLevelId: TrainingLevelId;
  surveySelection: MockSurveySelection;
  eligibleStorylineIds: string[];
  session1: MockQuestion[];
  adjustment?: MockAdjustment;
  effectiveSecondLevelId?: TrainingLevelId;
  session2: MockQuestion[];
  createdAt: number;
};

export type MockAttempt = {
  id: string;
  question: MockQuestion;
  session: 1 | 2;
  sessionIndex: number;
  listenCount: number;
  durationSeconds: number;
  recording?: RecordingResult;
  transcript: string;
  feedback: string;
  sttError?: string;
  completedAt: number;
};

export type MockPhase =
  | { phase: "survey" }
  | { phase: "self-assessment" }
  | { phase: "pre-test" }
  | { phase: "warmup" }
  | { phase: "session-1"; index: number }
  | { phase: "adjustment" }
  | { phase: "session-2"; index: number }
  | { phase: "complete" }
  | { phase: "review"; selectedAttemptId?: string }
  | { phase: "report"; returnAttemptId?: string };
