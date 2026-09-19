import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { AuthCallback } from "./AuthCallback";
import { AuthContext } from "./useAuth";
import type { AuthContextValue } from "./authTypes";

function setup(status: AuthContextValue["status"], path: string) {
  const value: AuthContextValue = { status, user: null, session: null, profile: null, error: null, profileError: null, signInWithGoogle: vi.fn(), signOut: vi.fn(), refreshProfile: vi.fn() };
  render(<MemoryRouter initialEntries={[path]}><AuthContext.Provider value={value}><Routes>
    <Route path="/auth/callback/" element={<AuthCallback />} />
    <Route path="/mypage/" element={<p>My Page destination</p>} />
    <Route path="/training/" element={<p>Training destination</p>} />
  </Routes></AuthContext.Provider></MemoryRouter>);
}
it("navigates authenticated callbacks to validated internal destinations", async () => {
  setup("authenticated", "/auth/callback/?returnTo=%2Ftraining%2F");
  expect(await screen.findByText("Training destination")).toBeInTheDocument();
});
it("rejects external destinations", async () => {
  setup("authenticated", "/auth/callback/?returnTo=https://evil.example");
  expect(await screen.findByText("My Page destination")).toBeInTheDocument();
});
it("does not accept a cancelled OAuth callback even with an existing session", () => {
  setup("authenticated", "/auth/callback/?error=access_denied&error_description=private");
  expect(screen.getByRole("alert")).toHaveTextContent("로그인을 완료하지 못했습니다");
  expect(screen.queryByText("private")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "마이페이지에서 다시 시도" })).toHaveAttribute("href", "/mypage/?returnTo=%2Fmypage%2F");
});
it("offers recovery after slow restoration", () => {
  vi.useFakeTimers();
  try {
    setup("loading", "/auth/callback/");
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  } finally { vi.useRealTimers(); }
});
