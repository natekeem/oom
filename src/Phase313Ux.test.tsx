import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseRoleplayQuestionResult, parseScriptRewriteResult } from "../shared/ai/features";
import { RoleplayPromptPanel, presentGeneratedRoleplayPrompt } from "./components/roleplay/RoleplayPromptPanel";
import { RoleplayViewV2 } from "./components/roleplay/RoleplayViewV2";
import { ScriptRewriteComparison } from "./components/script/ScriptRewriteComparison";
import { buildLearnerRewriteDiff } from "./components/script/scriptRewriteDiff";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";
import { clearTrainingSelection, saveTrainingSelection } from "./training/storage";
import type { LlmSettings } from "./types";

const mocks = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock("./features/ai/runAiFeature", () => ({ runAiFeature: mocks.run }));

const settings: LlmSettings = { endpoint: "", mode: "openai-compatible", authType: "bearer" };

const rewriteV2 = {
  schemaVersion: 2 as const,
  rewrittenScript: "Well, I usually visit the quiet park after work. It helps me relax.",
  changes: [
    { type: "spoken_style" as const, summary: "filler 추가", reason: "실제 말하기처럼 자연스럽게 시작하도록 바꿨어요." },
    { type: "specificity" as const, summary: "장소 디테일 보강" },
  ],
};

beforeEach(() => {
  clearTrainingSelection();
  mocks.run.mockReset();
});

describe("learner-friendly script comparison", () => {
  it("highlights meaningful word changes while ignoring punctuation and capitalization noise", () => {
    const quiet = buildLearnerRewriteDiff("I visit the park.", "i visit the park!");
    expect(quiet.hasMeaningfulChanges).toBe(false);
    expect(quiet.original.some((part) => part.changed)).toBe(false);
    expect(quiet.rewritten.some((part) => part.changed)).toBe(false);

    const changed = buildLearnerRewriteDiff("I visit the park.", "I usually visit the quiet park.");
    expect(changed.hasMeaningfulChanges).toBe(true);
    expect(changed.rewritten.filter((part) => part.changed).map((part) => part.text).join(" ")).toContain("usually");
    expect(changed.rewritten.filter((part) => part.changed).map((part) => part.text).join(" ")).toContain("quiet");
  });

  it("renders a balanced comparison, compact notes and a working copy action", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ScriptRewriteComparison original="I visit the park after work." result={rewriteV2} onCopy={() => void navigator.clipboard.writeText(rewriteV2.rewrittenScript)} />);

    const comparison = screen.getByTestId("script-rewrite-comparison");
    expect(within(comparison).getByRole("heading", { name: "원본 스크립트" })).toBeInTheDocument();
    expect(within(comparison).getByRole("heading", { name: "AI 변형 결과" })).toBeInTheDocument();
    expect(within(comparison).getByText("구어체")).toBeInTheDocument();
    expect(within(comparison).getAllByLabelText("AI 변형에서 달라진 부분").length).toBeGreaterThan(0);
    await user.click(within(comparison).getByRole("button", { name: "AI 변형 결과 복사" }));
    expect(writeText).toHaveBeenCalledWith(rewriteV2.rewrittenScript);
  });

  it("keeps v1 stored results and validates richer v2 results", () => {
    expect(parseScriptRewriteResult({ schemaVersion: 1, rewrittenScript: "I visit the park.", changes: ["현재형으로 정리"] }).schemaVersion).toBe(1);
    expect(parseScriptRewriteResult(rewriteV2)).toEqual(rewriteV2);
  });
});

describe("roleplay prompt presentation", () => {
  it("uses the same situation, practice-question and cue hierarchy for static and generated content", () => {
    const { rerender } = render(<RoleplayPromptPanel scenario="예약한 차에 경고등이 켜졌습니다." prompt="Talk to the rental-car desk and ask for help." />);
    expect(screen.getByText("상황")).toBeInTheDocument();
    expect(screen.getByText("연습 질문")).toBeInTheDocument();
    expect(screen.queryByText("핵심 체크")).not.toBeInTheDocument();

    rerender(<RoleplayPromptPanel generated scenario="Your compact rental car has a warning light." prompt="Explain why the car feels unsafe and ask for another suitable car or a practical solution." cues={["문제와 안전 우려 설명", "대체 차량 또는 해결책 요청"]} />);
    expect(screen.getByText("핵심 체크")).toBeInTheDocument();
    expect(screen.getByText("문제와 안전 우려 설명")).toBeInTheDocument();
    expect(screen.queryByText(/EVA QUESTION|PRACTICE PROMPT|official OPIc/i)).not.toBeInTheDocument();
  });

  it("renders old prompt-only results without inventing cue data", () => {
    const v1 = parseRoleplayQuestionResult({ schemaVersion: 1, prompt: "Ask the desk for another car." });
    const presented = presentGeneratedRoleplayPrompt(v1, "예약 차량에 문제가 있습니다.");
    expect(presented).toEqual({ scenario: "예약 차량에 문제가 있습니다.", prompt: "Ask the desk for another car.", generated: true });

    const v2 = parseRoleplayQuestionResult({ schemaVersion: 2, scenario: "Your reserved compact car is unavailable.", prompt: "Explain why the offered SUV is inconvenient and negotiate another solution.", cues: ["불편한 이유", "대안 요청"] });
    expect(presentGeneratedRoleplayPrompt(v2, "fallback").cues).toHaveLength(2);
  });

  it("updates the existing prompt in place and sends only one provider request", async () => {
    const user = userEvent.setup();
    saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
    mocks.run.mockResolvedValue({ providerSource: "managed", requestId: crypto.randomUUID(), result: {
      schemaVersion: 2,
      scenario: "The hotel gave your family a parking-lot room instead of the ocean-view room you booked.",
      prompt: "Explain the reservation mismatch, ask whether the correct room is available, and negotiate a room change or another practical solution.",
      cues: ["예약 내용과 실제 객실 비교", "객실 변경 또는 대안 요청"],
    } });
    render(<TrainingSelectionProvider><RoleplayViewV2 onToast={vi.fn()} settings={settings} slotIndex={0} /></TrainingSelectionProvider>);

    expect(await screen.findByText(/You are at a hotel/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "AI 롤플레이 질문 생성" }));
    expect(await screen.findByText(/reservation mismatch/)).toBeInTheDocument();
    expect(screen.getByText("AI 새 질문")).toBeInTheDocument();
    expect(mocks.run).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/EVA QUESTION|PRACTICE PROMPT/)).not.toBeInTheDocument();
  });

  it("keeps the static question usable when generation fails", async () => {
    const user = userEvent.setup();
    const onToast = vi.fn();
    saveTrainingSelection({ courseId: "course-1", levelId: "foundation" });
    mocks.run.mockRejectedValue(new Error("offline"));
    render(<TrainingSelectionProvider><RoleplayViewV2 onToast={onToast} settings={settings} slotIndex={0} /></TrainingSelectionProvider>);
    const staticPrompt = await screen.findByText(/You are at a hotel/);
    await user.click(screen.getByRole("button", { name: "AI 롤플레이 질문 생성" }));
    await waitFor(() => expect(onToast).toHaveBeenCalled());
    expect(staticPrompt).toBeInTheDocument();
    expect(screen.getByText("기본 연습")).toBeInTheDocument();
  });
});
