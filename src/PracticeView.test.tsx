import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PracticeView } from "./components/practice/PracticeView";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import { saveTrainingSelection } from "./training/storage";
import type { LlmSettings, SttSettings } from "./types";

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

describe("PracticeView & ExamScreenShell", () => {
  it("renders the exam screen console with single audio-first question text toggle", async () => {
    const onToast = vi.fn();
    render(
      <TrainingSelectionProvider>
        <PracticeView
          onToast={onToast}
          settings={dummyLlmSettings}
          sttSettings={dummySttSettings}
        />
      </TrainingSelectionProvider>
    );

    // Header & Shell rendered
    expect(screen.getByText("STEP 6. 실전 연습")).toBeInTheDocument();
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
    const user = userEvent.setup();
    await user.click(togglePromptBtn);
    expect(togglePromptBtn).toHaveTextContent("텍스트 숨기기");
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
});
