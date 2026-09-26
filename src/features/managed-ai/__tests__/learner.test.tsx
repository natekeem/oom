import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../../auth/useAuth";
import type { AuthContextValue } from "../../../auth/authTypes";
import { ManagedFeedback } from "../ManagedFeedback";
import { AiSettingsView } from "../../../components/ai/AiSettingsView";
import { AiExecutionError } from "../../ai/errors";

const mocks = vi.hoisted(() => ({ quota: vi.fn(), run: vi.fn() }));
vi.mock("../../ai/managedProvider", async (original) => ({
  ...(await original<object>()),
  getManagedAiQuota: mocks.quota,
}));
vi.mock("../../ai/runAiFeature", () => ({ runAiFeature: mocks.run }));

const feedback = {
  schemaVersion: 1 as const,
  overallSummary: "구체적인 답변이에요.",
  strengths: ["시간과 장소를 설명했어요."],
  improvements: [{ issue: "시제", whyItMatters: "시간 흐름", suggestion: "과거형을 사용해요." }],
  retryTip: "느낌을 한 문장 덧붙여요.",
  dimensions: { relevance: 4, organization: 3, specificity: 4, naturalness: 3, languageControl: 3 },
  improvedAnswer: "I enjoyed the park last week.",
};
const quota = { feature: "answer_feedback", plan: "free", limit: 3, used: 0, reserved: 0, remaining: 3, resetsAt: "2026-09-22T00:00:00+09:00", enabled: true };
const managed = { endpoint: "", apiKey: "", model: "", mode: "openai-compatible" as const, authType: "bearer" as const };
const custom = { ...managed, endpoint: "https://llm.example.com/v1/chat/completions" };
const auth = (id: string | null) => ({
  user: id ? { id } : null,
  status: id ? "authenticated" : "anonymous",
  session: null, profile: null, error: null, profileError: null,
  signInWithGoogle: vi.fn(), signOut: vi.fn(), refreshProfile: vi.fn(),
}) as unknown as AuthContextValue;

function panel(settings = managed, id: string | null = "A") {
  return <MemoryRouter><AuthContext.Provider value={auth(id)}><ManagedFeedback
    answer="I went to a park." question="Describe a park" context="course-1 advanced"
    settings={settings} onRetry={vi.fn()} /></AuthContext.Provider></MemoryRouter>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.quota.mockResolvedValue(quota);
  mocks.run.mockResolvedValue({
    providerSource: "managed",
    requestId: "10000000-0000-4000-a000-000000000001",
    quota: { ...quota, used: 1, remaining: 2 },
    result: { schemaVersion: 1, format: "structured", feedback },
  });
});

describe("unified learner feedback", () => {
  it("uses managed AI by default and renders structured feedback", async () => {
    render(panel());
    await screen.findByText(/0 \/ 3 사용/);
    fireEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    await screen.findByText("KEEP · 잘한 점");
    expect(mocks.run).toHaveBeenCalledWith(expect.objectContaining({ feature: "answer_feedback", customSettings: managed }));
  });

  it("allows anonymous custom API without loading managed quota", async () => {
    mocks.run.mockResolvedValue({ providerSource: "custom", requestId: "id", result: { schemaVersion: 1, format: "text", text: "KEEP\n좋아요" } });
    render(panel(custom, null));
    fireEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    await screen.findByText(/KEEP/);
    expect(mocks.quota).not.toHaveBeenCalled();
  });

  it("requires login for managed AI but leaves training controls available", () => {
    render(panel(managed, null));
    expect(screen.getByText(/로그인하면 OOM 관리형 AI/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 피드백 받기" })).toBeDisabled();
  });

  it("shows custom errors without a managed fallback", async () => {
    mocks.run.mockRejectedValue(new AiExecutionError("CUSTOM_PROVIDER_FAILED", "custom"));
    render(panel(custom, null));
    fireEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    await screen.findByRole("alert");
    expect(mocks.run).toHaveBeenCalledTimes(1);
    expect(mocks.quota).not.toHaveBeenCalled();
  });

  it("blocks only managed execution when the server switch is off", async () => {
    mocks.quota.mockResolvedValue({ ...quota, enabled: false });
    const { unmount } = render(panel(managed));
    await screen.findByText(/현재 OOM 관리형 AI를 잠시 사용할 수 없습니다/);
    expect(screen.getByRole("button", { name: "AI 피드백 받기" })).toBeDisabled();
    unmount();

    render(panel(custom, null));
    expect(screen.getByRole("button", { name: "AI 피드백 받기" })).toBeEnabled();
    expect(mocks.quota).toHaveBeenCalledTimes(1);
  });

  it("shows automatic precedence and clear action in settings", async () => {
    const clear = vi.fn();
    render(<MemoryRouter><AuthContext.Provider value={auth("A")}><AiSettingsView
      settings={custom} sttSettings={{ endpoint: "", autoTranscribe: false, authType: "bearer" }}
      onChange={vi.fn()} onSttChange={vi.fn()} onSave={vi.fn()} onClearCustom={clear} />
    </AuthContext.Provider></MemoryRouter>);
    expect(screen.getByText("사용자 API", { selector: "p" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "사용자 API 설정 해제" }));
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("refreshes managed quota without persisting feedback", async () => {
    render(panel());
    await screen.findByText(/0 \/ 3 사용/);
    window.dispatchEvent(new Event("oom-ai-changed"));
    await waitFor(() => expect(mocks.quota).toHaveBeenCalledTimes(2));
    expect(localStorage.getItem("oom-managed-feedback")).toBeNull();
  });
});
