import { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";

const mock = vi.hoisted(() => ({ getSession: vi.fn(), onAuthStateChange: vi.fn(), single: vi.fn() }));
vi.mock("../lib/supabase", () => ({ supabase: {
  auth: mock,
  from: () => ({ select: () => ({ eq: () => ({ single: mock.single }) }) }),
} }));
function Consumer() {
  const { status, user, profile } = useAuth();
  return <div>{status}:{user?.id}:{profile?.displayName}</div>;
}
const session = (id: string) => ({ user: { id } }) as Session;
beforeEach(() => { vi.resetAllMocks(); mock.single.mockResolvedValue({ data: null, error: new Error("missing") }); });
it("unsubscribes StrictMode listeners and ignores an old initial session result", async () => {
  let event: (name: string, next: Session | null) => void = () => {};
  const unsubs: ReturnType<typeof vi.fn>[] = [];
  mock.onAuthStateChange.mockImplementation((callback) => {
    event = callback;
    const unsubscribe = vi.fn(); unsubs.push(unsubscribe);
    return { data: { subscription: { unsubscribe } } };
  });
  let resolve: (value: unknown) => void = () => {};
  mock.getSession.mockImplementation(() => new Promise((done) => { resolve = done; }));
  const view = render(<StrictMode><AuthProvider><Consumer /></AuthProvider></StrictMode>);
  expect(unsubs[0]).toHaveBeenCalledOnce();
  act(() => event("SIGNED_IN", session("new")));
  await act(async () => resolve({ data: { session: null }, error: null }));
  expect(screen.getByText("authenticated:new:")).toBeInTheDocument();
  view.unmount();
  expect(unsubs[1]).toHaveBeenCalledOnce();
});
it("discards profile results after signout", async () => {
  let event: (name: string, next: Session | null) => void = () => {};
  mock.onAuthStateChange.mockImplementation((callback) => { event = callback; return { data: { subscription: { unsubscribe: vi.fn() } } }; });
  mock.getSession.mockResolvedValue({ data: { session: session("old") }, error: null });
  let resolve: (value: unknown) => void = () => {};
  mock.single.mockImplementation(() => new Promise((done) => { resolve = done; }));
  render(<AuthProvider><Consumer /></AuthProvider>);
  await waitFor(() => expect(mock.single).toHaveBeenCalledOnce());
  act(() => event("SIGNED_OUT", null));
  await act(async () => resolve({ data: { id: "old", display_name: "Old user", avatar_url: null, plan: "free" }, error: null }));
  expect(screen.getByText("anonymous::")).toBeInTheDocument();
  expect(screen.queryByText(/Old user/)).not.toBeInTheDocument();
});
