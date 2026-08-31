import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockResultView } from "./MockResultView";
import type { MockAttempt } from "./mockSessionTypes";

const baseQuestion = {
  mockId: "practice:advanced:q1:0",
  sourceId: "q1",
  kind: "practice" as const,
  courseId: "course-1" as const,
  sourceLevelId: "advanced" as const,
  group: "야외 / 여행",
  type: "recent-experience",
  prompt: "Tell me about a memorable trip you took recently.",
  storylineId: "outdoor-travel",
};

const attempts: MockAttempt[] = [
  {
    id: "attempt-1",
    question: baseQuestion,
    session: 1,
    sessionIndex: 0,
    listenCount: 1,
    durationSeconds: 58,
    recording: { blob: new Blob(["one"]), mimeType: "audio/webm", durationSeconds: 58 },
    transcript: "",
    feedback: "",
    completedAt: 1,
  },
  {
    id: "attempt-2",
    question: { ...baseQuestion, mockId: "practice:advanced:q2:1", sourceId: "q2", prompt: "Describe what you usually do there." },
    session: 1,
    sessionIndex: 1,
    listenCount: 2,
    durationSeconds: 64,
    recording: { blob: new Blob(["two"]), mimeType: "audio/webm", durationSeconds: 64 },
    transcript: "",
    feedback: "",
    completedAt: 2,
  },
  {
    id: "attempt-3",
    question: { ...baseQuestion, mockId: "practice:advanced:q3:2", sourceId: "q3", kind: "roleplay", prompt: "Call the hotel and ask three questions." },
    session: 2,
    sessionIndex: 0,
    listenCount: 0,
    durationSeconds: 42,
    transcript: "",
    feedback: "",
    completedAt: 3,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn().mockReturnValueOnce("blob:preview-one").mockReturnValueOnce("blob:preview-two"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
});

describe("MockResultView review workbench", () => {
  it("renders one-column answer rows, one shared preview audio runtime, and synchronized previous/next controls", async () => {
    const onReview = vi.fn();
    const user = userEvent.setup();
    render(
      <MockResultView
        attempts={attempts}
        onNavigate={vi.fn()}
        onRestart={vi.fn()}
        onReview={onReview}
        reviewing
        selectedAttemptId="attempt-1"
        totalQuestions={3}
        totalTestSeconds={600}
      >
        <div>선택 답변 복기 패널</div>
      </MockResultView>,
    );

    const list = screen.getByRole("list", { name: "모의고사 답변 목록" });
    expect(list).toHaveAttribute("data-testid", "mock-answer-list");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByTestId("mock-row-preview-audio")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "이전 답변" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 답변" })).toBeEnabled();
    expect(screen.getAllByText("Tell me about a memorable trip you took recently.")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "다음 답변" }));
    expect(onReview).toHaveBeenCalledWith("attempt-2");
  });

  it("uses one row preview player, stops the previous recording, and disables timer-only attempts", async () => {
    const user = userEvent.setup();
    render(
      <MockResultView
        attempts={attempts}
        onNavigate={vi.fn()}
        onRestart={vi.fn()}
        onReview={vi.fn()}
        reviewing
        selectedAttemptId="attempt-1"
        totalQuestions={3}
        totalTestSeconds={600}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Session 1 Q1 녹음 재생" }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Session 1 Q1 녹음 정지" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Session 1 Q2 녹음 재생" }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-one");
    expect(screen.getByRole("button", { name: "Session 2 Q1 녹음 없음" })).toBeDisabled();
  });
});
