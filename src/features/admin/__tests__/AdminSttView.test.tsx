import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAiView } from "../AdminAiView";

const mocks = vi.hoisted(() => ({ request: vi.fn(), role: "owner" }));
vi.mock("../adminApi", () => ({ requestAdminApi: mocks.request }));
vi.mock("../useAdminAccess", () => ({
  useAdminAccess: () => ({
    role: mocks.role,
    adminUser: { userId: "admin", displayName: "운영자" },
    refresh: vi.fn(),
  }),
}));

const aiSettings = {
  runtime: {
    managed_ai_enabled: false,
    default_model: "gemini-3.5-flash-lite",
    requests_per_minute: 5,
  },
  limits: [],
  models: [],
};

const aiOverview = {
  today: {
    calls: 0,
    succeeded: 0,
    failed: 0,
    users: 0,
    inputTokens: null,
    outputTokens: null,
    cost: null,
    unknownCost: 0,
    blocked: 0,
    avgLatency: null,
    p95Latency: null,
  },
  days: [],
  models: [],
  features: [],
  users: [],
  failures: [],
};

const sttSettings = {
  runtime: {
    managed_stt_enabled: false,
    default_model: "gemini-3.5-transcribe",
    requests_per_minute: 10,
  },
  limits: [
    { plan: "free", limit_duration_ms: 600000, enabled: true },
    { plan: "pro", limit_duration_ms: 3600000, enabled: true },
  ],
  models: [
    {
      model: "gemini-3.5-transcribe",
      enabled: true,
      cost_per_minute_microusd: 4000,
      pricing_note: "Gemini Transcribe",
    },
  ],
};

const sttOverview = {
  today: {
    calls: 15,
    succeeded: 14,
    failed: 1,
    users: 5,
    durationMs: 450000, // 7.5 mins
    cost: 30000,
    unknownCost: 0,
    blocked: 2,
    avgLatency: 1200,
    p95Latency: 2100,
  },
  days: [{ day: "2026-09-27", calls: 15, durationMs: 450000, cost: 30000 }],
  models: [{ model: "gemini-3.5-transcribe", calls: 15, durationMs: 450000, cost: 30000 }],
  failures: [
    {
      request_id: "req-err-1",
      model: "gemini-3.5-transcribe",
      error_code: "PROVIDER_TIMEOUT",
      created_at: "2026-09-27T08:00:00Z",
    },
  ],
  users: [{ user_id: "user-abc-12345678", display_name: "Mock Learner", calls: 4, durationMs: 120000 }],
};

const sttUsage = {
  records: [
    {
      request_id: "stt-rec-1",
      user_id: "user-abc-12345678",
      display_name: "Mock Learner",
      status: "succeeded",
      model: "gemini-3.5-transcribe",
      effective_plan: "free",
      duration_ms: 30000,
      estimated_cost_microusd: 2000,
      audio_format: "audio/webm",
      created_at: "2026-09-27T10:00:00Z",
      error_code: null,
    },
  ],
  total: 1,
  totalPages: 1,
  page: 1,
};

beforeEach(() => {
  mocks.role = "owner";
  mocks.request.mockReset().mockImplementation(async (path: string) => {
    if (path === "/ai/settings") return aiSettings;
    if (path === "/ai/overview") return aiOverview;
    if (path === "/ai/usage") return { records: [], total: 0, totalPages: 1, page: 1 };
    if (path === "/stt/settings") return sttSettings;
    if (path === "/stt/overview") return sttOverview;
    if (path === "/stt/usage") return sttUsage;
    return {};
  });
});

const renderView = () =>
  render(
    <MemoryRouter initialEntries={["/admin/ai/"]}>
      <AdminAiView />
    </MemoryRouter>
  );

describe("Admin STT operations tab", () => {
  it("switches to STT tab and displays operational metrics", async () => {
    renderView();
    const sttTabBtn = screen.getByRole("button", { name: "음성 인식 (STT)" });
    fireEvent.click(sttTabBtn);

    expect(await screen.findByText("STT 음성 인식 운영")).toBeInTheDocument();
    expect(screen.getByText("오늘 STT 호출")).toBeInTheDocument();
    expect(screen.getByText("오늘 전사 시간")).toBeInTheDocument();
    expect(screen.getByText("오늘 STT 사용자")).toBeInTheDocument();
    expect(screen.getByText("7.5분")).toBeInTheDocument();
    expect(screen.getByText("93%")).toBeInTheDocument(); // 14 / 15 succeeded
  });

  it("renders STT usage records and filters", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "음성 인식 (STT)" }));

    expect(await screen.findByText("Mock Learner")).toBeInTheDocument();
    expect(screen.getAllByText("user-abc…").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("0.5분")).toBeInTheDocument(); // 30000ms
    expect(screen.getByText("audio/webm")).toBeInTheDocument();
  });

  it("mutates STT settings with confirmation dialog", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "음성 인식 (STT)" }));

    await screen.findByText("STT 운영 설정");
    expect(screen.getByText("현재 표시 플랜: FREE. PRO 한도는 미래 설정이며 유료 구독은 준비 중입니다. 요청 제한: 분당 10회.")).toBeInTheDocument();

    const checkbox = screen.getByLabelText("Managed STT ON");
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const checkBtn = screen.getByRole("button", { name: "변경 내용 확인" });
    fireEvent.click(checkBtn);

    expect(await screen.findByText(/STT ON · FREE 10분 \/ PRO 60분/)).toBeInTheDocument();
    const confirmBtn = screen.getByRole("button", { name: "변경 확정" });
    fireEvent.click(confirmBtn);

    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith(
        "/stt/settings",
        undefined,
        expect.objectContaining({
          enabled: true,
          model: "gemini-3.5-transcribe",
          freeLimitMs: 600000,
          proLimitMs: 3600000,
        })
      )
    );
  });
});
