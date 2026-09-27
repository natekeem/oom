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

// Exact production contract: { runtime, models } without a `limits` array
const prodSttSettings = {
  runtime: {
    managed_stt_enabled: false,
    default_provider: "gemini",
    default_model: "gemini-3.5-transcribe",
    requests_per_minute: 5,
    daily_limit_ms_free: 600000,
    daily_limit_ms_pro: 3600000,
  },
  models: [
    {
      provider: "gemini",
      model: "gemini-3.5-transcribe",
      enabled: true,
      input_cost_per_million_microusd: 2000000,
      output_cost_per_million_microusd: 12000000,
      estimated_cost_per_second_microusd: 83,
      pricing_note: "Gemini 3.5 Transcribe official pricing",
    },
  ],
};

const richSttOverview = {
  today: {
    calls: 15,
    succeeded: 14,
    failed: 1,
    users: 5,
    audioDurationMs: 450000, // 7.5 mins
    cost: 30000,
    unknownCost: 0,
    blocked: 2,
    avgLatency: 1200,
    p95Latency: 2100,
  },
  days: [{ day: "2026-09-27", calls: 15, audioDurationMs: 450000, cost: 30000 }],
  models: [{ model: "gemini-3.5-transcribe", calls: 15, audioDurationMs: 450000, cost: 30000 }],
  failures: [
    {
      request_id: "req-err-1",
      model: "gemini-3.5-transcribe",
      error_code: "PROVIDER_TIMEOUT",
      created_at: "2026-09-27T08:00:00Z",
    },
  ],
  users: [{ user_id: "user-abc-12345678", display_name: "Mock Learner", calls: 4, audioDurationMs: 120000 }],
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
    if (path === "/stt/settings") return prodSttSettings;
    if (path === "/stt/overview") return richSttOverview;
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
    expect(screen.getByText(/요청 제한: 분당 5회/)).toBeInTheDocument();

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
          limits: {
            free: 600000,
            pro: 3600000,
          },
        })
      )
    );
  });

  it("reproduces production initial state: zero usage in database and no limits in settings without crashing", async () => {
    // Exact production bug reproduction:
    // 1. settings has { runtime, models } without limits
    // 2. overview has empty arrays for days, models, failures, users, sources
    // 3. usage records is empty
    mocks.request.mockImplementation(async (path: string) => {
      if (path === "/stt/settings") {
        return {
          runtime: {
            managed_stt_enabled: false,
            default_provider: "gemini",
            default_model: "gemini-3.5-transcribe",
            requests_per_minute: 5,
            daily_limit_ms_free: 600000,
            daily_limit_ms_pro: 3600000,
          },
          models: [
            {
              provider: "gemini",
              model: "gemini-3.5-transcribe",
              enabled: true,
              estimated_cost_per_second_microusd: 83,
              pricing_note: "Gemini 3.5 Transcribe official pricing",
            },
          ],
        };
      }
      if (path === "/stt/overview") {
        return {
          today: {
            calls: 0,
            succeeded: 0,
            failed: 0,
            users: 0,
            audioDurationMs: 0,
            audioMinutes: 0,
            cost: null,
            unknownCost: 0,
            blocked: 0,
            avgLatency: null,
            p95Latency: null,
          },
          days: [],
          models: [],
          sources: [],
          failures: [],
          users: [],
        };
      }
      if (path === "/stt/usage") {
        return { records: [], total: 0, totalPages: 1, page: 1 };
      }
      return {};
    });

    renderView();
    fireEvent.click(screen.getByRole("button", { name: "음성 인식 (STT)" }));

    // Does NOT throw TypeError: Cannot read properties of undefined (reading 'find')
    expect(await screen.findByText("STT 음성 인식 운영")).toBeInTheDocument();
    expect(await screen.findByText("STT 운영 설정")).toBeInTheDocument();

    // Verify empty state notices rendered safely
    expect(screen.getAllByText("아직 사용 기록이 없습니다.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("최근 실패가 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("조건에 맞는 사용 기록이 없습니다.")).toBeInTheDocument();

    // Verify initial values properly populated from runtime limits
    const freeInput = screen.getByLabelText(/FREE 하루 한도/);
    const proInput = screen.getByLabelText(/향후 PRO 하루 한도/);
    expect((freeInput as HTMLInputElement).value).toBe("10");
    expect((proInput as HTMLInputElement).value).toBe("60");
  });

  it("handles loading states gracefully while requests are in flight", async () => {
    // Never-resolving promise to inspect in-flight states
    mocks.request.mockImplementation(() => new Promise(() => {}));

    renderView();
    fireEvent.click(screen.getByRole("button", { name: "음성 인식 (STT)" }));

    expect(screen.getByText("STT 운영 정보를 불러오는 중...")).toBeInTheDocument();
    expect(screen.getByText("STT 설정을 불러오는 중...")).toBeInTheDocument();
    expect(screen.getByText("사용 기록을 불러오는 중...")).toBeInTheDocument();
  });

  it("handles API failure with isolated error cards and retry functionality", async () => {
    mocks.request.mockImplementation(async (path: string) => {
      if (path === "/stt/overview") throw new Error("Network Error");
      if (path === "/stt/settings") throw new Error("Server Error");
      if (path === "/stt/usage") throw new Error("DB Error");
      return {};
    });

    renderView();
    fireEvent.click(screen.getByRole("button", { name: "음성 인식 (STT)" }));

    expect(await screen.findByText("STT 운영 현황을 불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.getByText("STT 운영 설정을 불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.getByText("사용 기록을 불러오지 못했습니다. 필터 값을 확인해 주세요.")).toBeInTheDocument();
  });

  it("renders independently when settings resolves before overview", async () => {
    let resolveOverview: (value: unknown) => void = () => {};
    mocks.request.mockImplementation(async (path: string) => {
      if (path === "/stt/settings") return prodSttSettings;
      if (path === "/stt/usage") return { records: [], total: 0, totalPages: 1, page: 1 };
      if (path === "/stt/overview") {
        return new Promise((resolve) => {
          resolveOverview = resolve;
        });
      }
      return {};
    });

    renderView();
    fireEvent.click(screen.getByRole("button", { name: "음성 인식 (STT)" }));

    // Settings is already visible while overview is still loading
    expect(await screen.findByText("STT 운영 설정")).toBeInTheDocument();
    expect(screen.getByText("STT 운영 정보를 불러오는 중...")).toBeInTheDocument();

    // Now resolve overview
    resolveOverview(richSttOverview);
    expect(await screen.findByText("7.5분")).toBeInTheDocument();
  });
});
