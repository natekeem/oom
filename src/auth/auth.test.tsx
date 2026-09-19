import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { AuthContext } from "./useAuth";
import { MyPage } from "./MyPage";
import { AuthNavigationLabel } from "./AuthNavigation";
import { mapProfile, safeReturnPath } from "./authHelpers";
import type { AuthContextValue, ProfileRow } from "./authTypes";
import { viewIdForPath, viewPathForId } from "../lib/routes";

vi.mock("../features/history/useLearningHistory", () => ({
  useLearningHistory: () => ({
    sessions: [],
    status: "idle",
    isEmpty: true,
    retry: vi.fn(),
  }),
}));

const row: ProfileRow = { id: "a", display_name: "민지", avatar_url: "https://example.com/avatar.png", plan: "free", created_at: "2026-09-19", updated_at: "2026-09-19" };
function setup(overrides: Partial<AuthContextValue> = {}) {
  const value: AuthContextValue = { user: null, session: null, profile: null, status: "anonymous", error: null, profileError: null, signInWithGoogle: vi.fn().mockResolvedValue(undefined), signOut: vi.fn().mockResolvedValue(undefined), refreshProfile: vi.fn().mockResolvedValue(undefined), ...overrides };
  render(<MemoryRouter><AuthContext.Provider value={value}><MyPage /><AuthNavigationLabel /></AuthContext.Provider></MemoryRouter>);
  return value;
}
describe("account UI", () => {
  it("offers Google login to anonymous visitors", async () => {
    const auth = setup();
    fireEvent.click(screen.getByRole("button", { name: "Google로 계속하기" }));
    await waitFor(() => expect(auth.signInWithGoogle).toHaveBeenCalledWith("/mypage/"));
  });
  it("shows real account and FREE profile and logs out", async () => {
    const auth = setup({ status: "authenticated", user: { id: "a", email: "a@example.com", created_at: row.created_at } as User, profile: mapProfile(row) });
    expect(screen.getByText("민지")).toBeInTheDocument();
    expect(screen.getByText("a@example.com")).toBeInTheDocument();
    expect(screen.getByText("FREE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalledOnce());
  });
  it("does not flash anonymous actions while restoring", () => {
    setup({ status: "loading" });
    expect(screen.getByText("계정 확인 중…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Google로 계속하기" })).not.toBeInTheDocument();
  });
  it("handles missing configuration", () => {
    setup({ status: "unconfigured" });
    expect(screen.getByRole("status")).toHaveTextContent("로그인 기능 설정이 필요합니다");
  });
  it("sanitizes OAuth failures", async () => {
    setup({ signInWithGoogle: vi.fn().mockRejectedValue(new Error("private payload")) });
    fireEvent.click(screen.getByRole("button", { name: "Google로 계속하기" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Google 로그인을 시작하지 못했습니다");
    expect(screen.queryByText("private payload")).not.toBeInTheDocument();
  });
  it("offers retry after profile errors without fabricating a plan", () => {
    const auth = setup({ status: "authenticated", user: { id: "a", created_at: row.created_at } as User, profileError: "프로필을 불러오지 못했습니다." });
    fireEvent.click(screen.getByRole("button", { name: "프로필 다시 불러오기" }));
    expect(auth.refreshProfile).toHaveBeenCalledOnce();
    expect(screen.queryByText("FREE")).not.toBeInTheDocument();
  });
  it("reports logout failure", async () => {
    setup({ status: "authenticated", user: { id: "a", created_at: row.created_at } as User, signOut: vi.fn().mockRejectedValue(new Error("secret")) });
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("로그아웃하지 못했습니다");
  });
  it("renders goal setting card and primary CTA routing to /training/setup/", () => {
    setup({ status: "authenticated", user: { id: "a", email: "a@example.com", created_at: row.created_at } as User, profile: mapProfile(row) });
    expect(screen.getByText("내 학습 설정")).toBeInTheDocument();
    const primaryCta = screen.getAllByRole("link", { name: /시작하기/ })[0];
    expect(primaryCta).toHaveAttribute("href", "/training/setup/");
    const practiceCta = screen.getAllByRole("link", { name: "실전 연습 바로가기" })[0];
    expect(practiceCta).toHaveAttribute("href", "/practice/");
  });
  it("renders empty history state with intentional copy and CTA to /training/setup/", () => {
    setup({ status: "authenticated", user: { id: "a", email: "a@example.com", created_at: row.created_at } as User, profile: mapProfile(row) });
    expect(screen.getByText("아직 저장된 학습 기록이 없어요.")).toBeInTheDocument();
    const emptyStateStartCta = screen.getAllByRole("link", { name: "학습 시작하기" })[0];
    expect(emptyStateStartCta).toHaveAttribute("href", "/training/setup/");
  });
});
describe("auth boundary helpers", () => {
  it.each(["https://evil.com/", "//evil.com/", "/\\evil.com", "/%2fevil.com", "/auth/callback/", "/missing/", "/training/?next=//evil.com", " /training/", null])("rejects unsafe return path %s", (value) => {
    expect(safeReturnPath(value)).toBe("/mypage/");
  });
  it("normalizes known routes and maps both auth views", () => {
    expect(safeReturnPath("/practice/quick")).toBe("/practice/quick/");
    for (const id of ["mypage", "auth-callback"] as const) expect(viewIdForPath(viewPathForId[id])).toBe(id);
  });
  it("maps nullable metadata and blocks non-HTTPS avatars", () => {
    expect(mapProfile(row)).toMatchObject({ displayName: "민지", plan: "free" });
    expect(mapProfile({ ...row, display_name: null, avatar_url: "javascript:alert(1)" })).toMatchObject({ displayName: null, avatarUrl: null });
  });
});
