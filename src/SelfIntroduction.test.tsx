import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelfIntroductionView } from "./components/script/SelfIntroductionView";
import {
  getSelfIntroduction,
  SELF_INTRODUCTION_BY_LEVEL,
  SELF_INTRODUCTION_COPY,
  SELF_INTRODUCTION_PROMPT,
} from "./data/training/selfIntroduction";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import {
  saveTrainingSelection,
  TRAINING_SELECTION_STORAGE_KEY,
} from "./training/storage";

const ttsMocks = vi.hoisted(() => ({
  resolveStaticPlayback: vi.fn(),
}));

vi.mock("./lib/tts/TtsManager", () => ({
  getTtsManager: () => ({
    resolveStaticPlayback: ttsMocks.resolveStaticPlayback,
  }),
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  ttsMocks.resolveStaticPlayback.mockResolvedValue(null);
  saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
});

describe("shared Self Introduction", () => {
  it("owns exactly three Level-aware examples and one shared warm-up prompt", () => {
    expect(Object.keys(SELF_INTRODUCTION_BY_LEVEL)).toEqual([
      "foundation",
      "intermediate",
      "advanced",
    ]);
    expect(SELF_INTRODUCTION_PROMPT).toBe(
      "Let's start the interview now. Tell me something about yourself.",
    );
    expect(getSelfIntroduction("foundation").targetSeconds).toEqual([15, 20]);
    expect(getSelfIntroduction("intermediate").targetSeconds).toEqual([20, 25]);
    expect(getSelfIntroduction("advanced").targetSeconds).toEqual([25, 30]);
  });

  it("renders the guide CTA in its own card without mutating TrainingSelection", () => {
    const selectionBefore = localStorage.getItem(TRAINING_SELECTION_STORAGE_KEY);

    render(
      <MemoryRouter initialEntries={["/training/scripts/self-introduction/"]}>
        <TrainingSelectionProvider>
          <SelfIntroductionView onToast={vi.fn()} />
        </TrainingSelectionProvider>
      </MemoryRouter>,
    );

    const warmupCard = screen.getByTestId("self-introduction-warmup");
    const guideCard = screen.getByTestId("self-introduction-guide-card");
    const exampleCard = screen.getByTestId("self-introduction-example-card");
    const audioCard = screen.getByTestId("self-introduction-audio-controls");
    const guideLink = within(guideCard).getByRole("link", {
      name: /자기소개 가이드 읽기/,
    });

    expect(within(warmupCard).queryByRole("link")).not.toBeInTheDocument();
    expect(exampleCard).toHaveClass("h-full");
    expect(audioCard).toHaveClass("xl:h-full", "xl:flex", "xl:justify-center");
    expect(within(guideCard).getByText(SELF_INTRODUCTION_COPY.guide).tagName).toBe("P");
    expect(within(guideCard).getByText(SELF_INTRODUCTION_COPY.helper).tagName).toBe("P");
    expect(guideLink).toHaveAttribute(
      "href",
      "/magazine/opic-self-introduction-strategy/",
    );
    expect(screen.getByText(getSelfIntroduction("advanced").example)).toBeInTheDocument();
    expect(screen.queryByRole("slider", { name: "스크립트 재생 속도" })).not.toBeInTheDocument();
    expect(localStorage.getItem(TRAINING_SELECTION_STORAGE_KEY)).toBe(selectionBefore);
  });
});
