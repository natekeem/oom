import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AdminGuard } from "../AdminGuard";
import * as useAdminAccessModule from "../useAdminAccess";

vi.mock("../useAdminAccess", () => ({
  useAdminAccess: vi.fn(),
}));

describe("AdminGuard", () => {
  it("renders accessible loading indicator when status is loading", () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "loading",
      role: null,
      adminUser: null,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Protected Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("관리자 권한을 확인하고 있습니다...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders login CTA when status is unauthenticated", () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "unauthenticated",
      role: null,
      adminUser: null,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Protected Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /로그인하러 가기/ })).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders 403 access denied view when status is forbidden", () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "forbidden",
      role: null,
      adminUser: null,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Protected Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("관리자 권한이 없습니다 (403)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /서비스 홈으로 이동/ })).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders retryable error view when status is error", async () => {
    const mockRefresh = vi.fn();
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "error",
      role: null,
      adminUser: null,
      error: "Network failure test",
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Protected Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("관리자 인증 확인 실패")).toBeInTheDocument();
    expect(screen.getByText("Network failure test")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /다시 시도/ });
    await user.click(retryBtn);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("renders children when status is authorized", () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "authorized",
      role: "owner",
      adminUser: {
        userId: "user-1",
        role: "owner",
        displayName: "Owner",
        avatarUrl: null,
      },
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Protected Content</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
