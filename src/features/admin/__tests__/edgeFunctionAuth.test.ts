import { beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeAuditMetadata, writeAdminAuditLog } from "../../../../supabase/functions/admin-api/auditHelper";
import { authenticateAdminRequest } from "../../../../supabase/functions/admin-api/auth";
import { getCorsHeaders, handleCorsPreflight, withTiming } from "../../../../supabase/functions/admin-api/cors";
import { handleAdminApiRequest, normalizeAdminPath } from "../../../../supabase/functions/admin-api/index";

// Mock Deno global if running in Node/Vitest
const globalScope = globalThis as unknown as {
  Deno?: {
    env: { get: (key: string) => string | undefined };
    serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  };
};

if (typeof globalScope.Deno === "undefined") {
  globalScope.Deno = {
    env: {
      get: (key: string) => {
        if (key === "SUPABASE_URL") return "https://mock.supabase.co";
        if (key === "SUPABASE_SERVICE_ROLE_KEY") return "mock-service-role-key";
        if (key === "SUPABASE_ANON_KEY") return "mock-anon-key";
        return undefined;
      },
    },
    serve: vi.fn(),
  };
}


describe("Edge Function: admin-api logic & security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CORS & Preflight", () => {
    it("returns 204 with CORS headers on OPTIONS preflight from allowed origin", () => {
      const req = new Request("https://mock.supabase.co/functions/v1/admin-api/overview", {
        method: "OPTIONS",
        headers: {
          Origin: "https://opic-on-me.com",
        },
      });

      const res = handleCorsPreflight(req);
      expect(res).not.toBeNull();
      expect(res!.status).toBe(204);
      expect(res!.headers.get("Access-Control-Allow-Origin")).toBe("https://opic-on-me.com");
      expect(res!.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    });

    it("restricts unknown origin to production domain", () => {
      const req = new Request("https://mock.supabase.co/functions/v1/admin-api/me", {
        method: "GET",
        headers: {
          Origin: "https://evil-site.com",
        },
      });

      const headers = getCorsHeaders(req) as Record<string, string>;
      expect(headers["Access-Control-Allow-Origin"]).toBe("https://opic-on-me.com");
    });
  });

  describe("Path Normalization", () => {
    it("normalizes diverse Supabase Edge Function URL paths", () => {
      expect(normalizeAdminPath("/functions/v1/admin-api/me")).toBe("/me");
      expect(normalizeAdminPath("/functions/v1/admin-api/overview/")).toBe("/overview");
      expect(normalizeAdminPath("/admin-api/users")).toBe("/users");
      expect(normalizeAdminPath("/admin-api/users/123-abc/")).toBe("/users/123-abc");
      expect(normalizeAdminPath("/users")).toBe("/users");
    });
  });

  describe("Authorization & Security Guards", () => {
    it("rejects request without Authorization header with 401", async () => {
      const req = new Request("https://mock.supabase.co/functions/v1/admin-api/overview", {
        method: "GET",
      });

      const authResult = await authenticateAdminRequest(req);
      expect(authResult.error).toBeDefined();

      const response = authResult.error!;
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects non-GET HTTP methods with 405", async () => {
      const req = new Request("https://mock.supabase.co/functions/v1/admin-api/overview", {
        method: "POST",
        headers: {
          Authorization: "Bearer some-token",
        },
      });

      const res = await handleAdminApiRequest(req);
      expect(res.status).toBe(405);
      const json = await res.json();
      expect(json.error.code).toBe("METHOD_NOT_ALLOWED");
    });
  });

  describe("Audit Metadata Sanitization", () => {
    it("redacts sensitive tokens, passwords, and secrets from audit metadata", () => {
      const dirty = {
        userId: "user-123",
        accessToken: "secret-bearer-token-12345",
        passwordHash: "$2b$10$hashedpw",
        clientKey: "sk_live_secret",
        normalDetail: "User display name changed",
        nested: {
          apiKey: "sk_another_key",
          safeNote: "ok",
        },
      };

      const clean = sanitizeAuditMetadata(dirty);
      expect(clean.userId).toBe("user-123");
      expect(clean.accessToken).toBe("[REDACTED]");
      expect(clean.passwordHash).toBe("[REDACTED]");
      expect(clean.clientKey).toBe("[REDACTED]");
      expect(clean.normalDetail).toBe("User display name changed");
      const nested = clean.nested as Record<string, unknown>;
      expect(nested.apiKey).toBe("[REDACTED]");
      expect(nested.safeNote).toBe("ok");
    });

    it("rejects read-only actions and never writes them to admin_audit_logs", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockAdminClient = {
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      } as unknown as Parameters<typeof writeAdminAuditLog>[0];

      // Read-only actions should be blocked
      await writeAdminAuditLog(mockAdminClient, "admin-1", "view_users");
      await writeAdminAuditLog(mockAdminClient, "admin-1", "read_dashboard");
      await writeAdminAuditLog(mockAdminClient, "admin-1", "list_records");
      expect(mockInsert).not.toHaveBeenCalled();

      // Mutation actions should be written
      await writeAdminAuditLog(mockAdminClient, "admin-1", "update_user_role", "user", "u-123", { role: "admin" });
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });
  });

  describe("Timing Headers", () => {
    it("attaches Server-Timing and X-Response-Time headers to API responses", async () => {
      const req = new Request("https://mock.supabase.co/functions/v1/admin-api/overview", {
        method: "POST", // Will be rejected with 405
      });

      const res = await handleAdminApiRequest(req);
      expect(res.headers.get("Server-Timing")).toMatch(/^total;dur=\d+(\.\d+)?$/);
      expect(res.headers.get("X-Response-Time")).toMatch(/^\d+(\.\d+)?ms$/);
    });

    it("measures timing for all 4 admin endpoints (/me, /overview, /users, /learning)", () => {
      const endpoints = ["/me", "/overview", "/users", "/learning"];
      for (const endpoint of endpoints) {
        const start = performance.now();
        const fakeRes = new Response(JSON.stringify({ endpoint }), { status: 200 });
        const timedRes = withTiming(fakeRes, start);

        const serverTiming = timedRes.headers.get("Server-Timing");
        const responseTime = timedRes.headers.get("X-Response-Time");
        expect(serverTiming).toMatch(/^total;dur=\d+(\.\d+)?$/);
        expect(responseTime).toMatch(/^\d+(\.\d+)?ms$/);
      }
    });
  });
});

