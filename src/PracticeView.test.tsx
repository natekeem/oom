import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PracticeView } from "./components/practice/PracticeView";
import { FullMockPracticeView } from "./components/practice/FullMockPracticeView";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import { saveTrainingSelection } from "./training/storage";
import type { LlmSettings, SttSettings } from "./types";
import { resolveTrainingContext } from "./training/courseRegistry";

const practiceApiMocks = vi.hoisted(() => ({
  callInternalLlm: vi.fn(),
  transcribeAudio: vi.fn(),
}));

vi.mock("./lib/llm", () => ({
  callInternalLlm: practiceApiMocks.callInternalLlm,
}));

vi.mock("./lib/stt", () => ({
  transcribeAudio: practiceApiMocks.transcribeAudio,
}));

// Mock SpeechSynthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();

beforeEach(() => {
  localStorage.clear();
  saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
  vi.clearAllMocks();

  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: () => [],
    },
    writable: true,
  });

  // Mock URL.createObjectURL / revokeObjectURL
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = vi.fn(() => "blob:test-audio-url");
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = vi.fn();
  }
});

const dummyLlmSettings: LlmSettings = {
  endpoint: "https://llm.example.com/v1/chat/completions",
  apiKey: "test-llm-key",
  model: "gpt-4o-mini",
  mode: "openai-compatible",
  authType: "bearer",
};

const dummySttSettings: SttSettings = {
  endpoint: "https://stt.example.com/v1/audio/transcriptions",
  apiKey: "test-stt-key",
  model: "whisper-1",
  autoTranscribe: false,
};

async function passWarmup(user: ReturnType<typeof userEvent.setup>) {
  // Start answer (will fail in jsdom and show mic error)
  await user.click(screen.getByRole("button", { name: /워밍업 시작/ }));

  // In jsdom, mic fails, so click "타이머만 시작"
  const timerOnlyBtn = await screen.findByRole("button", { name: /타이머만 시작/ });
  await user.click(timerOnlyBtn);

  // Stop answer
  await user.click(await screen.findByRole("button", { name: /워밍업 종료/ }));

  // Wait for the short completion transition to enter Question 1.
  await waitFor(() => {
    expect(screen.queryByRole("button", { name: /워밍업/ })).not.toBeInTheDocument();
  }, { timeout: 2500 });
}

function renderFullMock(onNavigate = vi.fn()) {
  const resolved = resolveTrainingContext("course-1", "advanced");
  render(
    <TrainingSelectionProvider>
      <FullMockPracticeView
        onNavigate={onNavigate}
        onToast={vi.fn()}
        resolved={resolved}
        settings={dummyLlmSettings}
        sttSettings={dummySttSettings}
      />
    </TrainingSelectionProvider>,
  );
  return { onNavigate, resolved };
}

async function advanceMockToWarmup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /다음: Self Assessment/ }));
  await user.click(screen.getByRole("button", { name: /다음: 시험 준비/ }));
  await user.click(screen.getByRole("button", { name: /모의고사 시작/ }));
}

describe("PracticeView & ExamScreenShell", () => {
  it("starts with an isolated warm-up, skips STT/AI, and enters Question 1 at 0/2", async () => {
    const user = userEvent.setup();
    render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={vi.fn()}
          settings={dummyLlmSettings}
          sttSettings={{ ...dummySttSettings, autoTranscribe: true }}
        />
      </TrainingSelectionProvider>,
    );

    expect(screen.getByText("WARM-UP · 자기소개")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "워밍업 안내 듣기" })).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
    expect(screen.queryByText(/방금 말한 내용을 듣고/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "워밍업 안내 듣기" }));
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
    await passWarmup(user);

    expect(screen.getByRole("button", { name: "질문 듣기" })).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
    expect(practiceApiMocks.transcribeAudio).not.toHaveBeenCalled();
    expect(practiceApiMocks.callInternalLlm).not.toHaveBeenCalled();
  });

  it("renders the exam screen console with single audio-first question text toggle", async () => {
    const onToast = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={onToast}
          settings={dummyLlmSettings}
          sttSettings={dummySttSettings}
        />
      </TrainingSelectionProvider>
    );

    await passWarmup(user);

    // Header & Shell rendered
    expect(screen.getByText("STEP 6 · 빠른 연습")).toBeInTheDocument();
    expect(screen.getByText(/시험 화면 스타일로 질문을 듣고/)).toBeInTheDocument();

    // Check listen count starts at 0 / 2
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();

    // Only ONE question text toggle should exist across the entire screen
    const toggleButtons = screen.getAllByRole("button", {
      name: /문제 텍스트 보기|문제 텍스트 숨기기|텍스트 보기|텍스트 숨기기/,
    });
    expect(toggleButtons).toHaveLength(1);

    const togglePromptBtn = toggleButtons[0];
    expect(togglePromptBtn).toHaveTextContent("텍스트 보기");

    // Click toggle to reveal text
    await user.click(togglePromptBtn);
    expect(togglePromptBtn).toHaveTextContent("텍스트 숨기기");

    const prompt = resolveTrainingContext("course-1", "advanced").questions[0].prompt;
    expect([...container.querySelectorAll("p")].filter((node) => node.textContent === prompt)).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "녹음 시작" })).not.toBeInTheDocument();
    expect(screen.getByTestId("exam-console-grid")).toHaveClass("xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]");
    expect(screen.getByTestId("exam-console-grid").className).not.toContain("lg:grid-cols");
  });

  it("shows KEEP/FIX/RETRY fallback without auto-opening the story hint", async () => {
    const user = userEvent.setup();
    render(
      <TrainingSelectionProvider>
        <PracticeView onToast={vi.fn()} settings={{ ...dummyLlmSettings, endpoint: "" }} sttSettings={dummySttSettings} />
      </TrainingSelectionProvider>
    );

    await passWarmup(user);

    await user.click(screen.getByRole("button", { name: /답변 시작/ }));
    const timerOnly = screen.queryByRole("button", { name: /타이머만 시작/ });
    if (timerOnly) await user.click(timerOnly);
    await user.click(screen.getByRole("button", { name: /답변 종료/ }));
    await user.type(await screen.findByRole("textbox", { name: /Transcript/ }), "Last Saturday I went to the beach with my family.");
    await user.click(screen.getByRole("button", { name: "AI 피드백 받기" }));

    expect(screen.getAllByText("KEEP").length).toBeGreaterThan(0);
    expect(screen.getAllByText("FIX").length).toBeGreaterThan(0);
    expect(screen.getAllByText("RETRY").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /추천 스크립트 힌트 보기/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("increments listen count on Play and caps at 2/2", async () => {
    const onToast = vi.fn();
    const user = userEvent.setup();

    render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={onToast}
          settings={dummyLlmSettings}
          sttSettings={dummySttSettings}
        />
      </TrainingSelectionProvider>
    );

    await passWarmup(user);

    const playBtn = screen.getByRole("button", { name: "질문 듣기" });
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();

    // First listen
    await user.click(playBtn);
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();

    // Second listen
    await user.click(playBtn);
    expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument();

    // Play button should now be disabled because max listen count (2) is reached
    expect(playBtn).toBeDisabled();
  });

  it("handles start answer, timer only mode, and shows privacy notice in review panel", async () => {
    const onToast = vi.fn();
    const user = userEvent.setup();

    render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={onToast}
          settings={dummyLlmSettings}
          sttSettings={dummySttSettings}
        />
      </TrainingSelectionProvider>
    );

    await passWarmup(user);

    // Click Start Answer
    const startBtn = screen.getByRole("button", { name: /답변 시작/ });
    await user.click(startBtn);

    const timerOnlyBtn = screen.queryByRole("button", { name: /타이머만 시작/ });
    if (timerOnlyBtn) {
      await user.click(timerOnlyBtn);
    }

    // Stop answer
    const stopBtn = screen.getByRole("button", { name: /답변 종료/ });
    await user.click(stopBtn);

    // Review panel is now displayed
    expect(await screen.findByText(/방금 말한 내용을 듣고/)).toBeInTheDocument();
    expect(screen.getByText(/① 내 녹음/)).toBeInTheDocument();
    expect(screen.getByText(/② 음성 받아쓰기/)).toBeInTheDocument();
    expect(screen.getByText(/③ AI 맞춤 피드백/)).toBeInTheDocument();

    // Privacy notice
    expect(
      screen.getByText(/녹음은 서버로 전송되지 않고 브라우저 메모리에만 유지됩니다/)
    ).toBeInTheDocument();
  });

  it("triggers visual acknowledgement and resets on random question draw", async () => {
    const onToast = vi.fn();
    const user = userEvent.setup();

    render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={onToast}
          settings={dummyLlmSettings}
          sttSettings={dummySttSettings}
        />
      </TrainingSelectionProvider>
    );

    await passWarmup(user);

    const drawBtn = screen.getByRole("button", { name: /랜덤 질문 뽑기/ });
    await user.click(drawBtn);

    // Visual acknowledgement should appear
    expect(screen.getByText(/새 연습 문항을 불러왔습니다/)).toBeInTheDocument();

    // After ~1200ms, it should return to normal
    await waitFor(
      () => {
        expect(screen.queryByText(/새 연습 문항을 불러왔습니다/)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("resets listen count and review data when '같은 문제 다시 말하기' retry button is clicked", async () => {
    const onToast = vi.fn();
    const user = userEvent.setup();

    render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={onToast}
          settings={dummyLlmSettings}
          sttSettings={dummySttSettings}
        />
      </TrainingSelectionProvider>
    );

    await passWarmup(user);

    // Listen once
    const playBtn = screen.getByRole("button", { name: "질문 듣기" });
    await user.click(playBtn);
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();

    // Start timer & stop to reveal review panel
    const startBtn = screen.getByRole("button", { name: /답변 시작/ });
    await user.click(startBtn);
    const timerOnlyBtn = screen.queryByRole("button", { name: /타이머만 시작/ });
    if (timerOnlyBtn) await user.click(timerOnlyBtn);

    const stopBtn = screen.getByRole("button", { name: /답변 종료/ });
    await user.click(stopBtn);

    // Review panel is visible
    const retryBtn = await screen.findByRole("button", { name: /같은 문제 다시 말하기/ });
    await user.click(retryBtn);

    // Listen count should be reset to 0 / 2
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
    expect(onToast).toHaveBeenCalledWith("재도전 준비 완료", expect.any(String), "info");
  });

  it("records the warm-up but discards it before entering Question 1", async () => {
    const trackStop = vi.fn();
    const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;

    class MockMediaRecorder {
      state: RecordingState = "inactive";
      mimeType = "audio/webm";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;

      start() {
        this.state = "recording";
      }

      stop() {
        this.state = "inactive";
        this.ondataavailable?.({ data: new Blob(["warmup"], { type: this.mimeType }) });
        this.onstop?.();
      }
    }

    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const onToast = vi.fn();
    const user = userEvent.setup();
    render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={onToast}
          settings={dummyLlmSettings}
          sttSettings={{ ...dummySttSettings, autoTranscribe: true }}
        />
      </TrainingSelectionProvider>,
    );

    await user.click(screen.getByRole("button", { name: "워밍업 시작" }));
    await user.click(await screen.findByRole("button", { name: "워밍업 종료" }));
    await screen.findByRole("button", { name: "랜덤 질문 뽑기" }, { timeout: 2500 });

    expect(trackStop).toHaveBeenCalled();
    expect(onToast).not.toHaveBeenCalledWith(
      "녹음이 저장되었습니다.",
      expect.anything(),
      expect.anything(),
    );
    expect(practiceApiMocks.transcribeAudio).not.toHaveBeenCalled();
    expect(screen.queryByText(/방금 말한 내용을 듣고/)).not.toBeInTheDocument();
  });

  it("starts Full Mock at Survey and keeps its orientation state local", async () => {
    const user = userEvent.setup();
    renderFullMock();

    expect(screen.getByText(/모의고사에서 사용할 배경 설문을 선택하세요/)).toBeInTheDocument();
    expect(screen.getByText(/현재 코스 · Everyday & Getaway/)).toBeInTheDocument();
    const shoppingOption = screen.getByRole("checkbox", { name: "쇼핑하기" });
    expect(shoppingOption).toBeChecked();
    await user.click(shoppingOption);
    await user.click(screen.getByRole("button", { name: /다음: Self Assessment/ }));
    expect(screen.getByText(/현재 말하기 수준에 가까운 설정/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /3-3/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /4-4/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /5-5/ })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: /3-3/ }));
    await user.click(screen.getByRole("button", { name: /이전: Survey/ }));
    expect(screen.getByText(/모의고사에서 사용할 배경 설문을 선택하세요/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "쇼핑하기" })).not.toBeChecked();
    expect(resolveTrainingContext("course-1", "advanced").level.id).toBe("advanced");
    expect(JSON.parse(localStorage.getItem("oom-training-selection-v1") ?? "{}").levelId).toBe("advanced");
  });

  it("blocks Survey progression when a canonical minimum selection rule is not met", async () => {
    const user = userEvent.setup();
    renderFullMock();

    await user.click(screen.getByRole("checkbox", { name: "공원 가기" }));
    await user.click(screen.getByRole("checkbox", { name: "해변 가기" }));
    await user.click(screen.getByRole("checkbox", { name: "카페/커피 전문점 가기" }));

    expect(screen.getByRole("button", { name: /다음: Self Assessment/ })).toBeDisabled();
    expect(screen.getByText("이 항목의 최소 선택 조건을 채워주세요.")).toBeInTheDocument();
  });

  it("uses the local Self Assessment Level for Session 1 without mutating TrainingSelection", async () => {
    const user = userEvent.setup();
    renderFullMock();

    await user.click(screen.getByRole("button", { name: /다음: Self Assessment/ }));
    await user.click(screen.getByRole("radio", { name: /3-3/ }));
    await user.click(screen.getByRole("button", { name: /다음: 시험 준비/ }));
    expect(screen.getByText(/초기 난이도 3-3 · 3구간/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /모의고사 시작/ }));
    await user.click(screen.getByRole("button", { name: /워밍업 시작/ }));
    const timerOnly = screen.queryByRole("button", { name: /타이머만 시작/ });
    if (timerOnly) await user.click(timerOnly);
    await user.click(screen.getByRole("button", { name: /워밍업 종료/ }));

    const session = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-mock-phase="session-1"]');
      expect(element).not.toBeNull();
      return element!;
    });
    expect(session).toHaveAttribute("data-mock-initial-level", "foundation");
    expect(session).toHaveAttribute("data-question-source-level", "foundation");
    expect(JSON.parse(localStorage.getItem("oom-training-selection-v1") ?? "{}").levelId).toBe("advanced");
  });

  it("registers exit confirmation only after a main-session response starts", async () => {
    const user = userEvent.setup();
    let guard: (() => boolean) | null = null;
    const onSetNavigationGuard = vi.fn((next: (() => boolean) | null) => { guard = next; });
    const resolved = resolveTrainingContext("course-1", "advanced");
    render(
      <TrainingSelectionProvider>
        <FullMockPracticeView
          onSetNavigationGuard={onSetNavigationGuard}
          onToast={vi.fn()}
          resolved={resolved}
          settings={dummyLlmSettings}
          sttSettings={dummySttSettings}
        />
      </TrainingSelectionProvider>,
    );

    expect(guard?.()).toBe(true);
    await advanceMockToWarmup(user);
    await user.click(screen.getByRole("button", { name: /워밍업 시작/ }));
    const warmupTimerOnly = screen.queryByRole("button", { name: /타이머만 시작/ });
    if (warmupTimerOnly) await user.click(warmupTimerOnly);
    await user.click(screen.getByRole("button", { name: /워밍업 종료/ }));
    await screen.findByText(/SESSION 1 · 문항 1 \/ 7/);
    await user.click(screen.getByRole("button", { name: /답변 시작/ }));

    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await waitFor(() => expect(guard).not.toBeNull());
    expect(guard?.()).toBe(false);
    expect(confirm).toHaveBeenCalledTimes(1);
    confirm.mockReturnValue(true);
    expect(guard?.()).toBe(true);
  });

  it("starts the main timer only after Mock warm-up and keeps the exam free of hints, STT, and AI", async () => {
    const user = userEvent.setup();
    renderFullMock();
    await advanceMockToWarmup(user);
    expect(screen.getByText(/본시험 타이머 · 워밍업 후 시작/)).toBeInTheDocument();
    expect(screen.getByText(/WARM-UP · 자기소개/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /워밍업 시작/ }));
    const timerOnly = screen.queryByRole("button", { name: /타이머만 시작/ });
    if (timerOnly) await user.click(timerOnly);
    await user.click(screen.getByRole("button", { name: /워밍업 종료/ }));

    expect(await screen.findByText(/SESSION 1 · 문항 1 \/ 7/)).toBeInTheDocument();
    expect(screen.getByLabelText(/남은 본시험 시간 40:00/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /랜덤 질문 뽑기/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /추천 스크립트 힌트/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /문제 텍스트 보기/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/OOM 연습 목표/)).not.toBeInTheDocument();
    expect(practiceApiMocks.transcribeAudio).not.toHaveBeenCalled();
    expect(practiceApiMocks.callInternalLlm).not.toHaveBeenCalled();
  });

  it("resets 0/2 per Mock question and reaches adjustment after seven saved answers without STT or AI", async () => {
    const user = userEvent.setup();
    renderFullMock();
    await advanceMockToWarmup(user);
    await user.click(screen.getByRole("button", { name: /워밍업 시작/ }));
    const warmupTimerOnly = screen.queryByRole("button", { name: /타이머만 시작/ });
    if (warmupTimerOnly) await user.click(warmupTimerOnly);
    await user.click(screen.getByRole("button", { name: /워밍업 종료/ }));

    for (let questionIndex = 0; questionIndex < 7; questionIndex += 1) {
      expect(await screen.findByText(new RegExp(`SESSION 1 · 문항 ${questionIndex + 1} / 7`))).toBeInTheDocument();
      expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "질문 듣기" }));
      expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /답변 시작/ }));
      const timerOnly = screen.queryByRole("button", { name: /타이머만 시작/ });
      if (timerOnly) await user.click(timerOnly);
      await user.click(screen.getByRole("button", { name: /답변 종료/ }));
      const nextLabel = questionIndex === 6 ? /난이도 재조정/ : /다음 문항/;
      await user.click(await screen.findByRole("button", { name: nextLabel }));
    }

    expect(await screen.findByText(/1st Session 완료/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /조금 쉽게/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /비슷하게/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /조금 어렵게/ })).toBeInTheDocument();
    expect(practiceApiMocks.transcribeAudio).not.toHaveBeenCalled();
    expect(practiceApiMocks.callInternalLlm).not.toHaveBeenCalled();
  });

  it("finishes a 15-question advanced Mock before allowing one selected answer to call STT and AI", async () => {
    const stream = { getTracks: () => [{ stop: vi.fn() }] } as unknown as MediaStream;
    class MockMediaRecorder {
      state: RecordingState = "inactive";
      mimeType = "audio/webm";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() { this.state = "recording"; }
      stop() {
        this.state = "inactive";
        this.ondataavailable?.({ data: new Blob(["mock-answer"], { type: this.mimeType }) });
        this.onstop?.();
      }
    }
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    practiceApiMocks.transcribeAudio.mockResolvedValue("I answered the selected mock question clearly.");
    practiceApiMocks.callInternalLlm.mockResolvedValue("KEEP\nClear opening.\nFIX\nAdd one detail.\nRETRY\nConnect the result.");

    const user = userEvent.setup();
    renderFullMock();
    await advanceMockToWarmup(user);
    await user.click(screen.getByRole("button", { name: /워밍업 시작/ }));
    await user.click(screen.getByRole("button", { name: /워밍업 종료/ }));

    for (let index = 0; index < 7; index += 1) {
      await user.click(screen.getByRole("button", { name: /답변 시작/ }));
      await user.click(screen.getByRole("button", { name: /답변 종료/ }));
      await user.click(await screen.findByRole("button", { name: index === 6 ? /난이도 재조정/ : /다음 문항/ }));
    }
    await user.click(screen.getByRole("button", { name: /조금 어렵게/ }));
    expect(await screen.findByText(/SESSION 2 · 문항 1 \/ 8/)).toBeInTheDocument();

    for (let index = 0; index < 8; index += 1) {
      await user.click(screen.getByRole("button", { name: /답변 시작/ }));
      await user.click(screen.getByRole("button", { name: /답변 종료/ }));
      await user.click(await screen.findByRole("button", { name: index === 7 ? /시험 결과 보기/ : /다음 문항/ }));
    }

    expect(await screen.findByText("15 / 15")).toBeInTheDocument();
    expect(practiceApiMocks.transcribeAudio).not.toHaveBeenCalled();
    expect(practiceApiMocks.callInternalLlm).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /종합 예상 점수·진단 Report/ }));
    expect(await screen.findByRole("heading", { name: /실전 모의고사 예상 점수·진단 Report/ })).toBeInTheDocument();
    expect(screen.getByText(/OOM 훈련 진단 점수/)).toBeInTheDocument();
    expect(screen.getByText(/공식 OPIc 점수나 등급을 보장하지 않으며/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /HTML 내려받기/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /전체 답변 복기/ }));
    expect(screen.queryByText(/녹음 있음.*듣기 \/ 복기/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /같은 문제 다시 말하기/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /음성을 텍스트로 변환/ }));
    expect(practiceApiMocks.transcribeAudio).toHaveBeenCalledTimes(1);
    await screen.findByDisplayValue("I answered the selected mock question clearly.");
    await user.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    expect(practiceApiMocks.callInternalLlm).toHaveBeenCalledTimes(1);
  });
});
