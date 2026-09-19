import { afterEach, vi } from "vitest";

const createClient = vi.hoisted(() => vi.fn(() => ({ auth: {} })));
vi.mock("@supabase/supabase-js", () => ({ createClient }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); vi.clearAllMocks(); });
it.each([undefined, "", "sb_secret_never_allowed", "legacy-key"])("does not initialize with absent or non-publishable key %s", async (key) => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", key);
  const client = await import("./supabase");
  expect(client.isSupabaseConfigured).toBe(false);
  expect(client.supabase).toBeNull();
  expect(createClient).not.toHaveBeenCalled();
});
it("creates only one persistent PKCE client", async () => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  const first = await import("./supabase");
  const second = await import("./supabase");
  expect(first.supabase).toBe(second.supabase);
  expect(createClient).toHaveBeenCalledExactlyOnceWith("https://example.supabase.co", "sb_publishable_test", { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" } });
});
