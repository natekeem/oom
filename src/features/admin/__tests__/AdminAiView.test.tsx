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
const settings = {
  runtime: {
    managed_ai_enabled: false,
    default_model: "gemini-3.5-flash-lite",
    requests_per_minute: 5,
  },
  limits: [
    { plan: "free", limit_count: 3 },
    { plan: "pro", limit_count: 30 },
  ],
  models: [
    {
      model: "gemini-3.5-flash-lite",
      enabled: true,
      input_cost_per_million_microusd: 300000,
      output_cost_per_million_microusd: 2500000,
      pricing_note: "estimate",
    },
  ],
};
const overview = {
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
const usage = { records: [], total: 40, totalPages: 2, page: 1 };
beforeEach(() => {
  mocks.role = "owner";
  mocks.request
    .mockReset()
    .mockImplementation(async (path) =>
      path === "/ai/settings"
        ? settings
        : path === "/ai/overview"
          ? overview
          : usage,
    );
});
const view = () =>
  render(
    <MemoryRouter initialEntries={["/admin/ai/"]}>
      <AdminAiView />
    </MemoryRouter>,
  );
describe("Admin AI operations", () => {
  it("renders separate raw output/thinking/cache counts and a meaningful identity", async () => {
    mocks.request.mockImplementation(async path => path === "/ai/settings" ? settings : path === "/ai/overview" ? overview : { ...usage, records: [{ request_id: "request", user_id: "12345678-rest", display_name: "Fixture learner", status: "succeeded", model: "gemini-3.5-flash-lite", effective_plan: "free", input_tokens: 100, output_tokens: 20, thought_tokens: 5, cached_input_tokens: 10, estimated_cost_microusd: 100, created_at: "2026-09-21T00:00:00Z", error_code: null }] });
    view();
    expect(await screen.findByText("Fixture learner")).toBeInTheDocument();
    expect(screen.getByText("12345678…")).toBeInTheDocument();
    expect(screen.getByText("100 / 20 / 5")).toBeInTheDocument();
    expect(screen.getByText("캐시 입력 10")).toBeInTheDocument();
  });
  it("has active navigation, loading and empty states", async () => {
    view();
    expect(screen.getByRole("link", { name: "AI 운영" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByText("AI 운영 정보를 불러오는 중..."),
    ).toBeInTheDocument();
    await screen.findByText("조건에 맞는 사용 기록이 없습니다.");
    expect(screen.getByText("오늘 AI 호출")).toBeInTheDocument();
  });
  it("uses server filters and pagination", async () => {
    view();
    await screen.findByText("조건에 맞는 사용 기록이 없습니다.");
    fireEvent.change(screen.getByLabelText("상태"), {
      target: { value: "failed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "조회" }));
    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith("/ai/usage", {
        status: "failed",
        page: 1,
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "다음" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith("/ai/usage", {
        status: "failed",
        page: 2,
      }),
    );
  });
  it("requires explicit confirmation before owner settings mutation", async () => {
    view();
    await screen.findByText("AI 운영 설정");
    fireEvent.click(screen.getByLabelText("Managed AI ON"));
    fireEvent.click(screen.getByRole("button", { name: "변경 내용 확인" }));
    expect(mocks.request.mock.calls.some((c) => c[2])).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "변경 확정" }));
    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith("/ai/settings", undefined, {
        enabled: true,
        model: "gemini-3.5-flash-lite",
        freeLimit: 3,
        proLimit: 30,
      }),
    );
  });
  it("support can read but cannot change settings", async () => {
    mocks.role = "support";
    view();
    await screen.findByText("운영 지원 권한은 조회만 가능합니다.");
    expect(screen.getByLabelText("Managed AI ON")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "변경 내용 확인" }),
    ).not.toBeInTheDocument();
  });
  it("rejects invalid limits in the UI", async () => {
    view();
    await screen.findByText("AI 운영 설정");
    fireEvent.change(screen.getByLabelText("FREE 하루 한도"), {
      target: { value: "-1" },
    });
    expect(
      screen.getByRole("button", { name: "변경 내용 확인" }),
    ).toBeDisabled();
  });
  it("shows safe loading errors", async () => {
    mocks.request.mockRejectedValue(new Error("private DB information"));
    view();
    await screen.findByText("AI 운영 정보를 불러오지 못했습니다.");
    expect(
      screen.queryByText("private DB information"),
    ).not.toBeInTheDocument();
  });
});
