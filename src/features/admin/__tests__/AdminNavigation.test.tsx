import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpandableSidebar } from "../../../components/layout/ExpandableSidebar";
import * as useAdminAccessModule from "../useAdminAccess";

vi.mock("../useAdminAccess", () => ({
  useAdminAccess: vi.fn(),
}));

vi.mock("../../../training/TrainingSelectionContext", () => ({
  useTrainingSelection: () => ({ selection: null }),
}));

vi.mock("../../../auth/AuthNavigation", () => ({
  AuthNavigationLabel: () => <span>마이페이지</span>,
}));

describe("Admin Navigation integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does NOT render admin navigation for non-admin users or anonymous visitors", () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "unauthenticated",
      role: null,
      adminUser: null,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ExpandableSidebar
          activeView="home"
          darkMode={false}
          onNavigate={vi.fn()}
          onToggleDarkMode={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText("관리자 콘솔")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "관리자 콘솔" })).not.toBeInTheDocument();
  });

  it("does NOT render admin navigation for authenticated non-admin users (403 forbidden)", () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "forbidden",
      role: null,
      adminUser: null,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ExpandableSidebar
          activeView="home"
          darkMode={false}
          onNavigate={vi.fn()}
          onToggleDarkMode={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText("관리자 콘솔")).not.toBeInTheDocument();
  });

  it("renders admin navigation button when authorized admin and navigates on click", async () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "authorized",
      role: "owner",
      adminUser: {
        userId: "admin-1",
        role: "owner",
        displayName: "Admin Kim",
        avatarUrl: null,
      },
      error: null,
      refresh: vi.fn(),
    });

    const mockNavigate = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ExpandableSidebar
          activeView="home"
          darkMode={false}
          onNavigate={mockNavigate}
          onToggleDarkMode={vi.fn()}
        />
      </MemoryRouter>
    );

    const adminBtn = screen.getByRole("button", { name: "관리자 콘솔" });
    expect(adminBtn).toBeInTheDocument();

    await user.click(adminBtn);
    expect(mockNavigate).toHaveBeenCalledWith("admin-dashboard");
  });

  it("marks admin navigation button active when on an admin view", () => {
    vi.mocked(useAdminAccessModule.useAdminAccess).mockReturnValue({
      status: "authorized",
      role: "admin",
      adminUser: {
        userId: "admin-2",
        role: "admin",
        displayName: "Admin Lee",
        avatarUrl: null,
      },
      error: null,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ExpandableSidebar
          activeView="admin-dashboard"
          darkMode={false}
          onNavigate={vi.fn()}
          onToggleDarkMode={vi.fn()}
        />
      </MemoryRouter>
    );

    const adminBtn = screen.getByRole("button", { name: "관리자 콘솔" });
    expect(adminBtn).toHaveAttribute("aria-current", "page");
  });
});
