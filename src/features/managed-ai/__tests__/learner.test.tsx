import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../../auth/useAuth";
import type { AuthContextValue } from "../../../auth/authTypes";
import { ManagedFeedback, ManagedAiSettings } from "../ManagedFeedback";
import { AiSettingsView } from "../../../components/ai/AiSettingsView";
import { ManagedAiError } from "../api";
const mocks = vi.hoisted(() => ({ quota: vi.fn(), feedback: vi.fn() }));
vi.mock("../api", async (original) => ({
  ...(await original<object>()),
  getAiQuota: mocks.quota,
  getManagedFeedback: mocks.feedback,
}));
const f = {
  schemaVersion: 1 as const,
  overallSummary: "구체적인 답변이에요.",
  strengths: ["시간과 장소를 설명했어요."],
  improvements: [
    {
      issue: "시제",
      whyItMatters: "시간 흐름을 보여 줘요.",
      suggestion: "과거형을 사용해요.",
    },
  ],
  retryTip: "느낌을 한 문장 덧붙여요.",
  dimensions: {
    relevance: 4,
    organization: 3,
    specificity: 4,
    naturalness: 3,
    languageControl: 3,
  },
  improvedAnswer: "I enjoyed the park last week.",
};
const q = {
  feature: "answer_feedback",
  plan: "free",
  limit: 3,
  used: 0,
  reserved: 0,
  remaining: 3,
  resetsAt: "2026-09-22T00:00:00+09:00",
  enabled: true,
};
const auth = (id: string | null) =>
  ({
    user: id ? { id } : null,
    status: id ? "authenticated" : "anonymous",
    session: null,
    profile: null,
    error: null,
    profileError: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
  }) as unknown as AuthContextValue;
const panel = (id: string | null = "A", answer = "I went to a park.") => (
  <MemoryRouter>
    <AuthContext.Provider value={auth(id)}>
      <ManagedFeedback
        answer={answer}
        question="Describe a park"
        context="course-1 advanced"
        onRetry={vi.fn()}
      />
    </AuthContext.Provider>
  </MemoryRouter>
);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.quota.mockResolvedValue(q);
  mocks.feedback.mockResolvedValue({
    feedback: f,
    quota: { ...q, used: 1, remaining: 2 },
  });
});
describe("managed learner feedback", () => {
  it("keeps CTA unavailable without actual text", async () => {
    render(panel("A", " "));
    await screen.findByText(/0 \/ 3 사용/);
    expect(
      screen.getByRole("button", { name: "AI 피드백 받기" }),
    ).toBeDisabled();
    expect(screen.getByText(/녹음만으로는/)).toBeInTheDocument();
  });
  it("anonymous users do not fetch quota or submit", () => {
    render(panel(null));
    expect(screen.getByText(/로그인하면 OOM/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "AI 피드백 받기" }),
    ).toBeDisabled();
    expect(mocks.quota).not.toHaveBeenCalled();
  });
  it("shows usage, loading, structured KEEP/FIX/RETRY and prevents double submit", async () => {
    let resolve!: (v: unknown) => void;
    mocks.feedback.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    render(panel());
    await screen.findByText(/0 \/ 3 사용/);
    const button = screen.getByRole("button", { name: "AI 피드백 받기" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(mocks.feedback).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: /답변을 분석하고 있어요/ }),
    ).toBeDisabled();
    await act(async () =>
      resolve({ feedback: f, quota: { ...q, used: 1, remaining: 2 } }),
    );
    expect(screen.getByText("KEEP · 잘한 점")).toBeInTheDocument();
    expect(screen.getByText("FIX · 우선 고칠 점")).toBeInTheDocument();
    expect(screen.getByText(/공식 OPIc 점수/)).toBeInTheDocument();
  });
  it("retries same UUID after uncertain network failure", async () => {
    mocks.feedback.mockRejectedValueOnce(new Error("network"));
    render(panel());
    await screen.findByText(/0 \/ 3 사용/);
    fireEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    await screen.findByText(f.overallSummary);
    expect(mocks.feedback.mock.calls[0][1].requestId).toBe(
      mocks.feedback.mock.calls[1][1].requestId,
    );
  });
  it("uses a new UUID only after confirmed terminal provider failure/refund", async () => {
    mocks.feedback.mockRejectedValueOnce(
      new ManagedAiError("PROVIDER_UNAVAILABLE", true, q, false),
    );
    render(panel());
    await screen.findByText(/0 \/ 3 사용/);
    fireEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    await screen.findByText(/이번 요청은 사용 횟수에 포함되지/);
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    await screen.findByText(f.overallSummary);
    expect(mocks.feedback.mock.calls[0][1].requestId).not.toBe(
      mocks.feedback.mock.calls[1][1].requestId,
    );
  });
  it("renders authoritative exhaustion with reset semantics", async () => {
    mocks.quota.mockResolvedValue({ ...q, used: 3, remaining: 0 });
    render(panel());
    await screen.findByText(/오늘 무료 AI 피드백을 모두/);
    expect(screen.getByText(/한국 시간 자정/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "AI 피드백 받기" }),
    ).toBeDisabled();
  });
  it("clears feedback and quota synchronously on account switch and logout", async () => {
    const view = render(panel());
    await screen.findByText(/0 \/ 3 사용/);
    fireEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    await screen.findByText(f.overallSummary);
    mocks.quota.mockReturnValue(new Promise(() => {}));
    view.rerender(panel("B"));
    expect(screen.queryByText(f.overallSummary)).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ 3 사용/)).not.toBeInTheDocument();
    view.rerender(panel(null));
    expect(screen.getByText(/로그인하면 OOM/)).toBeInTheDocument();
  });
  it("suppresses late responses from prior account", async () => {
    let resolve!: (v: unknown) => void;
    mocks.feedback.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const view = render(panel());
    await screen.findByText(/0 \/ 3 사용/);
    fireEvent.click(screen.getByRole("button", { name: "AI 피드백 받기" }));
    view.rerender(panel("B"));
    await act(async () => resolve({ feedback: f, quota: q }));
    expect(screen.queryByText(f.overallSummary)).not.toBeInTheDocument();
  });
  it("shows kill switch state and retains advanced settings", async () => {
    mocks.quota.mockResolvedValue({ ...q, enabled: false });
    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth("A")}>
          <AiSettingsView
            settings={{
              endpoint: "",
              model: "",
              apiKey: "",
              mode: "openai-compatible",
              authType: "bearer",
            }}
            sttSettings={{ endpoint: "", apiKey: "", autoTranscribe: false }}
            onChange={vi.fn()}
            onSttChange={vi.fn()}
            onSave={vi.fn()}
          />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    await screen.findByText(/현재 AI 피드백을 잠시/);
    fireEvent.click(screen.getByText(/고급 사용자 설정/));
    expect(
      screen.getByPlaceholderText(
        "https://internal.example.com/v1/chat/completions",
      ),
    ).toBeInTheDocument();
  });
  it("settings refresh has no persistent feedback cache", async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={auth("A")}>
          <ManagedAiSettings />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    await screen.findByText(/0 \/ 3 사용/);
    window.dispatchEvent(new Event("oom-ai-changed"));
    await waitFor(() => expect(mocks.quota).toHaveBeenCalledTimes(2));
    expect(localStorage.getItem("oom-managed-feedback")).toBeNull();
  });
});
