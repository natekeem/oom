import { describe, expect, it } from "vitest";
import type { MockAttempt, MockSessionPlan } from "./mockSessionTypes";
import { buildMockReportHtml, createMockTrainingReport } from "./mockReport";

const question = {
  mockId: "practice:intermediate:q1:0",
  sourceId: "q1",
  kind: "practice" as const,
  courseId: "course-1" as const,
  sourceLevelId: "intermediate" as const,
  group: "야외 / 여행",
  type: "description",
  prompt: "<script>Tell me about your favorite park.</script>",
  storylineId: "outdoor",
};

const plan: MockSessionPlan = {
  seed: "report-seed",
  selectedCourseId: "course-1",
  selectedLevelId: "advanced",
  surveySelection: { selectedOptionIds: [] },
  eligibleStorylineIds: [],
  session1: [question],
  adjustment: "easier",
  effectiveSecondLevelId: "intermediate",
  session2: [{ ...question, mockId: "practice:intermediate:q2:1", sourceId: "q2" }],
  createdAt: 1,
};

const attempts: MockAttempt[] = [
  {
    id: "a1",
    question,
    session: 1,
    sessionIndex: 0,
    listenCount: 1,
    durationSeconds: 52,
    recording: { blob: new Blob(["audio"]), mimeType: "audio/webm", durationSeconds: 52 },
    transcript: "I visit the park every weekend.",
    feedback: "KEEP\nDirect answer.\nFIX\nAdd detail.\nRETRY\nConnect the result.",
    completedAt: 1,
  },
  {
    id: "a2",
    question: plan.session2[0],
    session: 2,
    sessionIndex: 0,
    listenCount: 2,
    durationSeconds: 48,
    recording: { blob: new Blob(["audio"]), mimeType: "audio/webm", durationSeconds: 48 },
    transcript: "The park is quiet and close to my home.",
    feedback: "KEEP\nClear scene.\nFIX\nAdd feeling.\nRETRY\nClose the story.",
    completedAt: 2,
  },
];

describe("mock training report", () => {
  it("reports transparent process metrics without estimating a score or grade", () => {
    const report = createMockTrainingReport({ attempts, totalQuestions: 2, totalTestSeconds: 600 });

    expect(report.completionRate).toBe(100);
    expect(report.timingRate).toBe(100);
    expect(report.recordingRate).toBe(100);
    expect(report.transcriptRate).toBe(100);
    expect(report.feedbackRate).toBe(100);
    expect(report).not.toHaveProperty("diagnosticScore");
    expect(report).not.toHaveProperty("estimatedRange");
    expect(report.disclaimer).toMatch(/점수나 등급을 예측하지 않으며/);
  });

  it("builds a standalone downloadable HTML report and escapes question text", () => {
    const report = createMockTrainingReport({ attempts, totalQuestions: 2, totalTestSeconds: 600 });
    const html = buildMockReportHtml(report, attempts);

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("OOM 모의고사 훈련 리포트");
    expect(html).toContain("목표 발화시간 적합률");
    expect(html).not.toMatch(/IM1|IM2|IM3|IH|AL|예상 등급|예상 점수|\/100/);
    expect(html).toContain("&lt;script&gt;Tell me about your favorite park.&lt;/script&gt;");
    expect(html).not.toContain("<script>Tell me about your favorite park.</script>");
  });
});
