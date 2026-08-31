import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { DifficultyGuide } from "./components/difficulty/DifficultyGuide";
import { PracticeView } from "./components/practice/PracticeView";
import { RoleplayViewV2 } from "./components/roleplay/RoleplayViewV2";
import { ScriptDetail } from "./components/script/ScriptDetail";
import { SelfIntroductionView } from "./components/script/SelfIntroductionView";
import { getSelfIntroduction } from "./data/training/selfIntroduction";
import { resolveTrainingContext } from "./training/courseRegistry";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import {
  loadTrainingSelection,
  saveTrainingSelection,
  TRAINING_SELECTION_STORAGE_KEY,
} from "./training/storage";
import { writeTtsPreferences } from "./lib/tts/preferences";
import { SCRIPT_RATE_PREFERENCES_STORAGE_KEY } from "./lib/tts/ratePreferences";
import type { TrainingLevelId } from "./training/types";
import type { LlmSettings, ScriptItem } from "./types";

const ttsMocks = vi.hoisted(() => ({
  preparePlayback: vi.fn(),
  resolveStaticPlayback: vi.fn(),
  fallbackPlay: vi.fn(),
}));

const uiWaveMocks = vi.hoisted(() => ({
  create: vi.fn(),
  destroy: vi.fn(),
  load: vi.fn().mockResolvedValue(undefined),
  setPlaybackRate: vi.fn(),
  stop: vi.fn(),
  handlers: {} as Record<string, (...args: unknown[]) => void>,
}));

vi.mock("./lib/tts/TtsManager", () => ({
  getTtsManager: () => ({
    preparePlayback: ttsMocks.preparePlayback,
    resolveStaticPlayback: ttsMocks.resolveStaticPlayback,
  }),
}));

vi.mock("wavesurfer.js", () => ({
  default: {
    create: uiWaveMocks.create,
  },
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
  uiWaveMocks.load.mockResolvedValue(undefined);
  uiWaveMocks.handlers = {};
  ttsMocks.resolveStaticPlayback.mockResolvedValue(null);
  uiWaveMocks.create.mockImplementation(() => ({
    destroy: uiWaveMocks.destroy,
    load: uiWaveMocks.load,
    on: (event: string, handler: (...args: unknown[]) => void) => {
      uiWaveMocks.handlers[event] = handler;
    },
    play: vi.fn().mockResolvedValue(undefined),
    playPause: vi.fn().mockResolvedValue(undefined),
    setPlaybackRate: uiWaveMocks.setPlaybackRate,
    setOptions: vi.fn(),
    setTime: vi.fn(),
    stop: uiWaveMocks.stop,
  }));
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
    expect(screen.getAllByTestId("oom-wave-player-script")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "시험 질문 음성 미리듣기" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "스크립트 재생 음성 미리듣기" }),
    ).not.toBeInTheDocument();
    expect(within(examGroup).getByRole("button", { name: "Heart" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(scriptGroup).getByRole("button", { name: "Bella" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(examGroup).getByText("균형 잡히고 또렷한 톤")).toBeInTheDocument();
    expect(within(examGroup).getByText("균형 잡히고 또렷한 톤")).toHaveClass(
      "whitespace-nowrap",
      "text-[9px]",
    );
    expect(within(examGroup).getByText("부드럽고 자연스러운 톤")).toBeInTheDocument();
    expect(within(examGroup).getByText("차분하고 담백한 톤")).toBeInTheDocument();
    expect(within(examGroup).getByText("밝고 가벼운 톤")).toBeInTheDocument();

    await user.click(within(examGroup).getByRole("button", { name: "Sky" }));
    await user.click(within(scriptGroup).getByRole("button", { name: "Sarah" }));

    expect(JSON.parse(localStorage.getItem("oom.tts.preferences") ?? "{}")).toEqual({
      examVoice: "af_sky",
      scriptVoice: "af_sarah",
    });
    expect(localStorage.getItem(TRAINING_SELECTION_STORAGE_KEY)).toBe(selectionBefore);
    expect(loadTrainingSelection()).toMatchObject({ courseId: "course-1", levelId: "advanced" });

    await user.click(
      await screen.findByRole("button", { name: "시험 질문 음성 재생" }),
    );
    await waitFor(() =>
      expect(ttsMocks.preparePlayback).toHaveBeenCalledWith(
        expect.objectContaining({ voice: "af_sky" }),
        expect.any(Function),
        { skipStatic: false },
      ),
    );
  });
});

describe("voice preference consumers", () => {
  it("uses scriptVoice and a static hit for the STEP 4 self-introduction example", async () => {
    const peaks = Array.from({ length: 256 }, () => 0.35);
    const selfIntroduction = getSelfIntroduction("advanced");
    ttsMocks.resolveStaticPlayback.mockResolvedValue({
      kind: "static",
      url: "/generated-tts/audio/self-introduction/sky.webm",
      peaks,
      duration: 27,
      bytes: 216000,
      mimeType: "audio/webm; codecs=opus",
      voice: "af_sky",
      engine: "static",
    });
    writeTtsPreferences({ examVoice: "af_heart", scriptVoice: "af_sky" });

    render(
      <MemoryRouter>
        <TrainingSelectionProvider>
          <SelfIntroductionView onToast={vi.fn()} />
        </TrainingSelectionProvider>
      </MemoryRouter>,
    );

    const player = await screen.findByTestId("oom-wave-player-script");
    await waitFor(() => expect(player).toHaveAttribute("data-source", "static"));
    expect(ttsMocks.resolveStaticPlayback).toHaveBeenCalledWith({
      text: selfIntroduction.example,
      voice: "af_sky",
      speed: 1,
    });

    await userEvent.setup().click(
      screen.getByRole("button", { name: "자기소개 예시 재생" }),
    );
    expect(ttsMocks.preparePlayback).not.toHaveBeenCalled();
    expect(uiWaveMocks.setPlaybackRate).toHaveBeenCalledWith(1, true);
  });

  it("uses scriptVoice for the current STEP 5 role-play English example", async () => {
    const user = userEvent.setup();
    writeTtsPreferences({ examVoice: "af_heart", scriptVoice: "af_sky" });
    const roleplay = resolveTrainingContext("course-1", "advanced").roleplays[0];

    render(
      <TrainingSelectionProvider>
        <RoleplayViewV2
          onToast={vi.fn()}
          settings={settings}
          slotIndex={0}
        />
      </TrainingSelectionProvider>,
    );

    expect(screen.getByTestId("roleplay-audio-controls")).toBeInTheDocument();
    await user.click(
      await screen.findByRole("button", { name: "영어 롤플레이 답변 재생" }),
    );

    await waitFor(() =>
      expect(ttsMocks.preparePlayback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: roleplay.active.englishExample,
          voice: "af_sky",
          speed: 1,
        }),
        expect.any(Function),
        { skipStatic: false },
      ),
    );
  });

  it("preloads the current STEP 5 role-play example from static assets", async () => {
    const user = userEvent.setup();
    const peaks = Array.from({ length: 256 }, () => 0.45);
    ttsMocks.resolveStaticPlayback.mockResolvedValue({
      kind: "static",
      url: "/generated-tts/audio/roleplay/sky.webm",
      peaks,
      duration: 42,
      bytes: 336000,
      mimeType: "audio/webm; codecs=opus",
      voice: "af_sky",
      engine: "static",
    });
    writeTtsPreferences({ examVoice: "af_heart", scriptVoice: "af_sky" });

    render(
      <TrainingSelectionProvider>
        <RoleplayViewV2 onToast={vi.fn()} settings={settings} slotIndex={0} />
      </TrainingSelectionProvider>,
    );

    const player = await screen.findByTestId("oom-wave-player-script");
    await waitFor(() => expect(player).toHaveAttribute("data-source", "static"));
    expect(uiWaveMocks.load).toHaveBeenCalledWith(
      "/generated-tts/audio/roleplay/sky.webm",
      [peaks],
      42,
    );

    await user.click(screen.getByRole("button", { name: "롤플레이 답변 음성 재생" }));
    expect(ttsMocks.preparePlayback).not.toHaveBeenCalled();
  });

  it("uses a STEP 4 static URL and peaks without requesting runtime generation", async () => {
    const user = userEvent.setup();
    const peaks = Array.from({ length: 256 }, () => 0.5);
    ttsMocks.resolveStaticPlayback.mockResolvedValue({
      kind: "static",
      url: "/generated-tts/audio/hash/bella.webm",
      peaks,
      duration: 45,
      bytes: 360000,
      mimeType: "audio/webm; codecs=opus",
      voice: "af_bella",
      engine: "static",
    });

    render(<ScriptDetail onToast={vi.fn()} script={getScript()} settings={settings} />);
    const player = await screen.findByTestId("oom-wave-player-script");
    await waitFor(() => expect(player).toHaveAttribute("data-source", "static"));
    expect(uiWaveMocks.load).toHaveBeenCalledWith(
      "/generated-tts/audio/hash/bella.webm",
      [peaks],
      45,
    );

    await user.click(screen.getByRole("button", { name: "음성 재생" }));
    expect(ttsMocks.preparePlayback).not.toHaveBeenCalled();
  });

  it("bypasses a failed STEP 4 static URL exactly once and continues to runtime fallback", async () => {
    ttsMocks.resolveStaticPlayback.mockResolvedValue({
      kind: "static",
      url: "/generated-tts/audio/missing/bella.webm",
      peaks: Array.from({ length: 256 }, () => 0.5),
      duration: 45,
      bytes: 360000,
      mimeType: "audio/webm; codecs=opus",
      voice: "af_bella",
      engine: "static",
    });
    uiWaveMocks.load.mockRejectedValueOnce(new Error("static 404"));

    render(<ScriptDetail onToast={vi.fn()} script={getScript()} settings={settings} />);

    await waitFor(() =>
      expect(ttsMocks.preparePlayback).toHaveBeenCalledWith(
        expect.objectContaining({ voice: "af_bella", speed: 1 }),
        expect.any(Function),
        { skipStatic: true },
      ),
    );
    expect(ttsMocks.preparePlayback).toHaveBeenCalledTimes(1);
  });

  it("uses scriptVoice for the complete STEP 4 script", async () => {
    const user = userEvent.setup();
    writeTtsPreferences({ examVoice: "af_heart", scriptVoice: "af_sky" });
    const script = getScript();

    render(<ScriptDetail onToast={vi.fn()} script={script} settings={settings} />);
    expect(screen.getByTestId("oom-wave-player-script")).toHaveAttribute("data-state", "idle");
    expect(screen.getAllByText("재생하면 음성을 준비합니다.")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "영어 스크립트 재생" }));

    await waitFor(() =>
      expect(ttsMocks.preparePlayback).toHaveBeenCalledWith(
        expect.objectContaining({
          text: script.englishScript,
          voice: "af_sky",
          speed: 1,
        }),
        expect.any(Function),
        { skipStatic: false },
      ),
    );
  });

  it("restores and stores compact script rates per Level without generating on slider input", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ScriptDetail onToast={vi.fn()} script={getScript("advanced")} settings={settings} />,
    );
    const slider = screen.getByRole("slider", { name: "스크립트 재생 속도" });
    expect(slider).toHaveValue("1");

    fireEvent.change(slider, { target: { value: "1.05" } });
    expect(ttsMocks.preparePlayback).not.toHaveBeenCalled();
    expect(uiWaveMocks.setPlaybackRate).toHaveBeenLastCalledWith(1.05, true);
    expect(uiWaveMocks.stop).not.toHaveBeenCalled();
    expect(
      JSON.parse(localStorage.getItem(SCRIPT_RATE_PREFERENCES_STORAGE_KEY) ?? "{}"),
    ).toEqual({ advanced: 1.05 });

    rerender(
      <ScriptDetail onToast={vi.fn()} script={getScript("intermediate")} settings={settings} />,
    );
    await waitFor(() =>
      expect(screen.getByRole("slider", { name: "스크립트 재생 속도" })).toHaveValue("0.95"),
    );

    await user.click(screen.getByRole("button", { name: "영어 스크립트 재생" }));
    await waitFor(() =>
      expect(ttsMocks.preparePlayback).toHaveBeenCalledWith(
        expect.objectContaining({ speed: 1 }),
        expect.any(Function),
        { skipStatic: false },
      ),
    );

    rerender(
      <ScriptDetail onToast={vi.fn()} script={getScript("foundation")} settings={settings} />,
    );
    await waitFor(() =>
      expect(screen.getByRole("slider", { name: "스크립트 재생 속도" })).toHaveValue("0.9"),
    );

    rerender(
      <ScriptDetail onToast={vi.fn()} script={getScript("advanced")} settings={settings} />,
    );
    await waitFor(() =>
      expect(screen.getByRole("slider", { name: "스크립트 재생 속도" })).toHaveValue("1.05"),
    );
  });

  it("keeps the same player shell while showing real chunk generation progress", async () => {
    const user = userEvent.setup();
    let resolvePlayback:
      | ((source: {
          kind: "web-speech";
          voice: "af_bella";
          fallback: true;
          error: Error;
          play: () => void;
        }) => void)
      | undefined;
    ttsMocks.preparePlayback.mockImplementationOnce(
      async (
        _input: { voice: string },
        onStatus?: (status: {
          phase: string;
          completedChunks?: number;
          totalChunks?: number;
        }) => void,
      ) => {
        onStatus?.({ phase: "generating", completedChunks: 6, totalChunks: 14 });
        return new Promise((resolve) => {
          resolvePlayback = resolve;
        });
      },
    );

    render(<ScriptDetail onToast={vi.fn()} script={getScript()} settings={settings} />);
    const reservedShell = screen.getByTestId("oom-wave-player-script");
    await user.click(screen.getByRole("button", { name: "영어 스크립트 재생" }));

    expect(screen.getByTestId("oom-wave-player-script")).toBe(reservedShell);
    expect(reservedShell).toHaveAttribute("data-state", "loading");
    expect(screen.getAllByText("스크립트 음성 생성 중 · 6/14")).toHaveLength(2);

    resolvePlayback?.({
      kind: "web-speech",
      voice: "af_bella",
      fallback: true,
      error: new Error("test fallback"),
      play: vi.fn(),
    });
    await waitFor(() => expect(reservedShell).toHaveAttribute("data-state", "fallback"));
  });

  it("uses examVoice and starts Quick directly at Question 1 with 0/2", async () => {
    const user = userEvent.setup();
    writeTtsPreferences({ examVoice: "af_sarah", scriptVoice: "af_bella" });

    render(
      <TrainingSelectionProvider>
        <PracticeView onToast={vi.fn()} settings={settings} />
      </TrainingSelectionProvider>,
    );

    const listen = screen.getByRole("button", { name: "질문 듣기" });
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /자기소개 안내|워밍업/ })).not.toBeInTheDocument();

    await user.click(listen);
    await waitFor(() => expect(listen).not.toBeDisabled());
    await user.click(listen);

    expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument();
    expect(listen).toBeDisabled();
    expect(ttsMocks.preparePlayback).toHaveBeenCalledTimes(2);
    for (const [input] of ttsMocks.preparePlayback.mock.calls) {
      expect(input).toEqual(expect.objectContaining({ voice: "af_sarah", speed: 1 }));
    }
    expect(ttsMocks.preparePlayback.mock.calls[0][0]).toEqual(
      expect.objectContaining({ text: resolveTrainingContext("course-1", "advanced").questions[0].prompt }),
    );
  });

  it("preloads STEP 6 static audio while keeping the compact non-seekable 0/2 contract", async () => {
    const user = userEvent.setup();
    const peaks = Array.from({ length: 256 }, () => 0.4);
    ttsMocks.resolveStaticPlayback.mockResolvedValue({
      kind: "static",
      url: "/generated-tts/audio/question/sarah.webm",
      peaks,
      duration: 6.5,
      bytes: 52000,
      mimeType: "audio/webm; codecs=opus",
      voice: "af_sarah",
      engine: "static",
    });
    writeTtsPreferences({ examVoice: "af_sarah", scriptVoice: "af_bella" });

    render(
      <TrainingSelectionProvider>
        <PracticeView onToast={vi.fn()} settings={settings} />
      </TrainingSelectionProvider>,
    );

    const player = await screen.findByTestId("oom-wave-player-exam");
    expect(player).toHaveAttribute("data-source", "static");
    expect(player).toHaveAttribute("data-seek-enabled", "false");
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();

    const listen = screen.getByRole("button", { name: "질문 듣기" });
    await user.click(listen);
    act(() => uiWaveMocks.handlers.finish?.());
    await user.click(listen);
    expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument();
    expect(listen).toBeDisabled();
    expect(ttsMocks.preparePlayback).not.toHaveBeenCalled();
  });
});

function getScript(levelId: TrainingLevelId = "advanced"): ScriptItem {
  const resolved = resolveTrainingContext("course-1", levelId);
  const story = resolved.storylines[0];
  return {
    id: story.id,
    group: story.group,
    title: story.title,
    goalLevel: levelId === "advanced" ? "AL" : levelId === "intermediate" ? "IH" : "IM3",
    surveyBadges: story.surveyOptionIds,
    strategy: story.core.anchorScene,
    covers: story.core.reusableFor,
    keywords: story.core.facts,
    expectedQuestions: story.core.reusableFor,
    fillerPhrases: [],
    koreanSummary: story.active.koreanSummary,
    englishScript: story.active.englishScript,
    pointNotes: story.active.skills,
    trainingLevelId: levelId,
    trainingPresetLabel: resolved.level.displayName,
    targetSeconds: resolved.level.targetSeconds,
    trainingCourseId: "course-1",
    baseQuestion: story.baseQuestion,
  };
}
