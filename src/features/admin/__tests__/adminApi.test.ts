import type { Session } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../../../lib/supabase";
import {
  AdminApiError,
  fetchAdminAudit,
  fetchAdminLearning,
  fetchAdminMe,
  fetchAdminOverview,
  fetchAdminUserDetail,
  fetchAdminUsers,
} from "../adminApi";

vi.mock("../../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe("adminApi client module", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_SUPABASE_URL = "https://mock.supabase.co";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("throws 401 UNAUTHORIZED when no session or token is available", async () => {
    vi.mocked(supabase!.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(fetchAdminMe()).rejects.toThrow(AdminApiError);
    await expect(fetchAdminMe()).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    });
  });


  it("attaches bearer token and calls /me successfully", async () => {
    vi.mocked(supabase!.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: "mock-admin-token",
        } as unknown as Session,
      },
      error: null,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          userId: "user-123",
          role: "owner",
          displayName: "Admin Kim",
          avatarUrl: null,
        }),
    });
    globalThis.fetch = mockFetch;

    const result = await fetchAdminMe();
    expect(result.role).toBe("owner");
    expect(result.displayName).toBe("Admin Kim");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/functions/v1/admin-api/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-admin-token",
        }),
      })
    );
  });

  it("handles 403 FORBIDDEN error response from Edge Function", async () => {
    vi.mocked(supabase!.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: "mock-user-token",
        } as unknown as Session,
      },
      error: null,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () =>
        Promise.resolve({
          error: {
            code: "FORBIDDEN",
            message: "관리자 권한이 필요합니다.",
          },
        }),
    });

    await expect(fetchAdminMe()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
      message: "관리자 권한이 필요합니다.",
    });
  });

  it("calls /overview, /users, /learning, /audit with appropriate query parameters", async () => {
    vi.mocked(supabase!.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: "mock-admin-token",
        } as unknown as Session,
      },

      error: null,
    });

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/overview")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              metrics: { totalUsers: 10 },
              recentUsers: [],
              recentLearningActivity: [],
            }),
        });
      }
      if (url.includes("/users/user-abc")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              id: "user-abc",
              planDisplay: "FREE",
            }),
        });
      }
      if (url.includes("/users")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              users: [],
              total: 0,
              page: 1,
              pageSize: 20,
              totalPages: 1,
            }),
        });
      }
      if (url.includes("/learning")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              records: [],
              total: 0,
              page: 1,
              pageSize: 20,
              totalPages: 1,
            }),
        });
      }
      if (url.includes("/audit")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              logs: [],
              total: 0,
              page: 1,
              pageSize: 20,
              totalPages: 1,
            }),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });

    globalThis.fetch = mockFetch;

    const overview = await fetchAdminOverview();
    expect(overview.metrics.totalUsers).toBe(10);

    const userList = await fetchAdminUsers(2, 10, "kim");
    expect(userList.page).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\?page=2&pageSize=10&search=kim/),
      expect.any(Object)
    );

    const userDetail = await fetchAdminUserDetail("user-abc");
    expect(userDetail.id).toBe("user-abc");

    const learning = await fetchAdminLearning({ range: "30d", type: "sessions" });
    expect(learning.records).toEqual([]);

    const audit = await fetchAdminAudit(1, 25);
    expect(audit.logs).toEqual([]);
  });
});
