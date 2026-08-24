import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DifficultyGuide } from "./components/difficulty/DifficultyGuide";
import { PracticeView } from "./components/practice/PracticeView";
import { ScriptDetail } from "./components/script/ScriptDetail";
import { resolveTrainingContext } from "./training/courseRegistry";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import {
  loadTrainingSelection,
  saveTrainingSelection,
  TRAINING_SELECTION_STORAGE_KEY,
} from "./training/storage";
import { writeTtsPreferences } from "./lib/tts/preferences";
import type { LlmSettings, ScriptItem } from "./types";

const ttsMocks = vi.hoisted(() => ({
  preparePlayback: vi.fn(),
  fallbackPlay: vi.fn(),
}));

vi.mock("./lib/tts/TtsManager", () => ({
  getTtsManager: () => ({ preparePlayback: ttsMocks.preparePlayback }),
}));

const settings: LlmSettings = {
  endpoint: "",
  apiKey: "",
  model: "",
  mode: "openai-compatible",
  authType: "bearer",
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
  ttsMocks.preparePlayback.mockImplementation(
    async (input: { voice: string }, onStatus?: (status: { phase: string }) => void) => {
      onStatus?.({ phase: "fallback" });
      return {
        kind: "web-speech",
        voice: input.voice,
        fallback: true,
        error: new Error("worker unavailable in test"),
        play: (callbacks?: { onEnd?: () => void }) => {
          ttsMocks.fallbackPlay(input);
          callbacks?.onEnd?.();
        },
      };
    },
  );
});

describe("STEP 3 voice settings", () => {
  it("exposes exactly four voices per use, persists independent choices, and leaves TrainingSelection untouched", async () => {
    const user = userEvent.setup();
    const selectionBefore = localStorage.getItem(TRAINING_SELECTION_STORAGE_KEY);

    render(
      <TrainingSelectionProvider>
        <DifficultyGuide />
      </TrainingSelectionProvider>,
    );

    const examGroup = screen.getByRole("group", { name: "시험 질문 음성 선택" });
    const scriptGroup = screen.getByRole("group", { name: "스크립트 재생 음성 선택" });
    expect(within(examGroup).getAllByRole("button")).toHaveLength(4);
    expect(within(scriptGroup).getAllByRole("button")).toHaveLength(4);
    expect(within(examGroup).getByRole("button", { name: "Heart" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(scriptGroup).getByRole("button", { name: "Bella" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(within(examGroup).getByRole("button", { name: "Sky" }));
    await user.click(within(scriptGroup).getByRole("button", { name: "Sarah" }));

    expect(JSON.parse(localStorage.getItem("oom.tts.preferences") ?? "{}")).toEqual({
      examVoice: "af_sky",
      scriptVoice: "af_sarah",
    });
    expect(localStorage.getItem(TRAINING_SELECTION_STORAGE_KEY)).toBe(selectionBefore);
    expect(loadTrainingSelection()).toMatchObject({ courseId: "course-1", levelId: "advanced" });

    await user.click(screen.getByRole("button", { name: "시험 질문 음성 미리듣기" }));
    await waitFor(() =>
      expect(ttsMocks.preparePlayback).toHaveBeenCalledWith(
        expect.objectContaining({ voice: "af_sky" }),
        expect.any(Function),
      ),
    );
  });
});

describe("voice preference consumers", () => {
  it("uses scriptVoice for the complete STEP 4 script", async () => {
    const user = userEvent.setup();
    writeTtsPreferences({ examVoice: "af_heart", scriptVoice: "af_sky" });
    const script = getScript();

    render(<ScriptDetail onToast={vi.fn()} script={script} settings={settings} />);
    await user.click(screen.getByRole("button", { name: "영어 스크립트 재생" }));

    await waitFor(() =>
      expect(ttsMocks.preparePlayback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: script.englishScript,
          voice: "af_sky",
          speed: 1,
        }),
        expect.any(Function),
      ),
    );
  });

  it("uses examVoice while preserving the 0/2 to 2/2 listen cap", async () => {
    const user = userEvent.setup();
    writeTtsPreferences({ examVoice: "af_sarah", scriptVoice: "af_bella" });

    render(
      <TrainingSelectionProvider>
        <PracticeView onToast={vi.fn()} settings={settings} />
      </TrainingSelectionProvider>,
    );

    const listen = screen.getByRole("button", { name: "질문 듣기" });
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();

    await user.click(listen);
    await waitFor(() => expect(listen).not.toBeDisabled());
    await user.click(listen);

    expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument();
    expect(listen).toBeDisabled();
    expect(ttsMocks.preparePlayback).toHaveBeenCalledTimes(2);
    for (const [input] of ttsMocks.preparePlayback.mock.calls) {
      expect(input).toEqual(expect.objectContaining({ voice: "af_sarah", speed: 0.95 }));
    }
  });
});

function getScript(): ScriptItem {
  const resolved = resolveTrainingContext("course-1", "advanced");
  const story = resolved.storylines[0];
  return {
    id: story.id,
    group: story.group,
    title: story.title,
    goalLevel: "AL",
    surveyBadges: story.surveyOptionIds,
    strategy: story.core.anchorScene,
    covers: story.core.reusableFor,
    keywords: story.core.facts,
    expectedQuestions: story.core.reusableFor,
    fillerPhrases: [],
    koreanSummary: story.active.koreanSummary,
    englishScript: story.active.englishScript,
    pointNotes: story.active.skills,
    trainingLevelId: "advanced",
    trainingPresetLabel: "1구간 · AL · 60~90초",
    targetSeconds: [60, 90],
    trainingCourseId: "course-1",
    baseQuestion: story.baseQuestion,
  };
}
