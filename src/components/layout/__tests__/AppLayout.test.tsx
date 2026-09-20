import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { getRouteLayoutMeta } from "../layoutConfig";
import { PageContainer } from "../PageContainer";
import { ServiceFooter } from "../ServiceFooter";
import {
  ExpandableSidebar,
  SIDEBAR_COLLAPSED_STORAGE_KEY,
} from "../ExpandableSidebar";
import { AppShell } from "../AppShell";
import { TrainingSelectionProvider } from "../../../training/TrainingSelectionContext";
import { saveTrainingSelection } from "../../../training/storage";

describe("Phase 2.9 Layout System", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("getRouteLayoutMeta", () => {
    it("assigns immersive width and suppresses footer for Full Mock", () => {
      const meta = getRouteLayoutMeta("practice-mock", "/practice/mock/");
      expect(meta).toEqual({ width: "immersive", footer: "none" });
    });

    it("assigns narrow width and public footer for Magazine articles and legal pages", () => {
      expect(getRouteLayoutMeta("magazine-list", "/magazine/opic-survey-strategy/")).toEqual({
        width: "narrow",
        footer: "public",
      });
      expect(getRouteLayoutMeta("privacy", "/privacy/")).toEqual({
        width: "narrow",
        footer: "public",
      });
      expect(getRouteLayoutMeta("terms", "/terms/")).toEqual({
        width: "narrow",
        footer: "public",
      });
      expect(getRouteLayoutMeta("contact", "/contact/")).toEqual({
        width: "narrow",
        footer: "public",
      });
      expect(getRouteLayoutMeta("editorial-policy", "/editorial-policy/")).toEqual({
        width: "narrow",
        footer: "public",
      });
      expect(getRouteLayoutMeta("image-credits", "/image-credits/")).toEqual({
        width: "narrow",
        footer: "public",
      });
    });

    it("assigns wide width and app footer for training and practice routes", () => {
      const trainingViews = [
        "training-hub",
        "training-setup",
        "survey",
        "difficulty",
        "script-hub",
        "script-self-introduction",
        "script-outdoor",
        "roleplay-hub",
        "roleplay-travel",
        "practice",
        "practice-quick",
      ] as const;

      for (const view of trainingViews) {
        const meta = getRouteLayoutMeta(view, "");
        expect(meta).toEqual({ width: "wide", footer: "app" });
      }
    });

    it("assigns default width and app footer for internal utility views", () => {
      expect(getRouteLayoutMeta("mypage", "/mypage/")).toEqual({
        width: "default",
        footer: "app",
      });
      expect(getRouteLayoutMeta("ai-settings", "/ai-settings/")).toEqual({
        width: "default",
        footer: "app",
      });
    });

    it("assigns default width and public footer for guides, pricing, and about", () => {
      expect(getRouteLayoutMeta("exam-guide", "/exam-guide/")).toEqual({
        width: "default",
        footer: "public",
      });
      expect(getRouteLayoutMeta("pricing", "/pricing/")).toEqual({
        width: "default",
        footer: "public",
      });
      expect(getRouteLayoutMeta("about", "/about/")).toEqual({
        width: "default",
        footer: "public",
      });
      expect(getRouteLayoutMeta("magazine-list", "/magazine/")).toEqual({
        width: "default",
        footer: "public",
      });
    });
  });

  describe("PageContainer", () => {
    it("applies semantic width and padding classes for all variants", () => {
      const { rerender, container } = render(
        <PageContainer width="narrow">Content</PageContainer>
      );
      let el = container.firstElementChild as HTMLElement;
      expect(el).toHaveClass("max-w-4xl", "oom-content-shell");
      expect(el).toHaveAttribute("data-page-width", "narrow");

      rerender(<PageContainer width="default">Content</PageContainer>);
      el = container.firstElementChild as HTMLElement;
      expect(el).toHaveClass("max-w-7xl");
      expect(el).toHaveAttribute("data-page-width", "default");

      rerender(<PageContainer width="wide">Content</PageContainer>);
      el = container.firstElementChild as HTMLElement;
      expect(el).toHaveClass("max-w-[1440px]");
      expect(el).toHaveAttribute("data-page-width", "wide");

      rerender(<PageContainer width="immersive">Content</PageContainer>);
      el = container.firstElementChild as HTMLElement;
      expect(el).toHaveClass("max-w-none");
      expect(el).toHaveAttribute("data-page-width", "immersive");
    });
  });

  describe("ServiceFooter", () => {
    it("renders rich grouped layout for public variant", () => {
      render(
        <MemoryRouter>
          <ServiceFooter variant="public" />
        </MemoryRouter>
      );
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveAttribute("data-footer-variant", "public");
      expect(footer).toHaveClass("mt-auto");
      expect(screen.getByText("학습")).toBeInTheDocument();
      expect(screen.getByText("서비스")).toBeInTheDocument();
      expect(screen.getByText("정책 · 정보")).toBeInTheDocument();
      expect(screen.getByText("OOM · 오픽온미")).toBeInTheDocument();
    });

    it("renders compact single-line layout for app variant with legal nav", () => {
      render(
        <MemoryRouter>
          <ServiceFooter variant="app" />
        </MemoryRouter>
      );
      const footer = screen.getByRole("contentinfo");
      expect(footer).toHaveAttribute("data-footer-variant", "app");
      expect(footer).toHaveClass("mt-auto");
      expect(screen.queryByText("학습")).not.toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "서비스 정보" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "개인정보처리방침" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "이용약관" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "문의" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "소개" })).toBeInTheDocument();
    });

    it("renders nothing when variant is none", () => {
      const { container } = render(
        <MemoryRouter>
          <ServiceFooter variant="none" />
        </MemoryRouter>
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("ExpandableSidebar desktop collapse / expand", () => {
    it("defaults to expanded state and allows toggling to collapsed state", () => {
      render(
        <MemoryRouter>
          <ExpandableSidebar
            activeView="about"
            darkMode={false}
            onNavigate={() => {}}
            onToggleDarkMode={() => {}}
          />
        </MemoryRouter>
      );

      const desktopAside = screen.getAllByRole("complementary", { hidden: true }).find(
        (el) => el.getAttribute("data-sidebar-collapsed") !== null
      );
      expect(desktopAside).toBeDefined();
      expect(desktopAside).toHaveAttribute("data-sidebar-collapsed", "false");
      expect(desktopAside).toHaveClass("lg:w-60");

      const collapseButton = screen.getByRole("button", { name: "사이드바 접기" });
      fireEvent.click(collapseButton);

      expect(desktopAside).toHaveAttribute("data-sidebar-collapsed", "true");
      expect(desktopAside).toHaveClass("lg:w-[68px]");
      expect(localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY)).toBe("true");

      const expandButton = screen.getByRole("button", { name: "사이드바 펼치기" });
      fireEvent.click(expandButton);

      expect(desktopAside).toHaveAttribute("data-sidebar-collapsed", "false");
      expect(desktopAside).toHaveClass("lg:w-60");
      expect(localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY)).toBe("false");
    });

    it("restores collapsed state from localStorage", () => {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "true");

      render(
        <MemoryRouter>
          <ExpandableSidebar
            activeView="about"
            darkMode={false}
            onNavigate={() => {}}
            onToggleDarkMode={() => {}}
          />
        </MemoryRouter>
      );

      const desktopAside = screen.getAllByRole("complementary", { hidden: true }).find(
        (el) => el.getAttribute("data-sidebar-collapsed") !== null
      );
      expect(desktopAside).toHaveAttribute("data-sidebar-collapsed", "true");
      expect(desktopAside).toHaveClass("lg:w-[68px]");

      // Top-level icon buttons are accessible with title and aria-label
      expect(screen.getByRole("button", { name: "오픽온미란?" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "OPIc 수험 가이드" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "OPIc 실전 훈련하기" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "마이페이지" })).toBeInTheDocument();
    });

    it("keeps mobile drawer unaffected when desktop sidebar is collapsed", () => {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "true");

      render(
        <MemoryRouter>
          <ExpandableSidebar
            activeView="about"
            darkMode={false}
            mobileOpen={true}
            onClose={() => {}}
            onNavigate={() => {}}
            onToggleDarkMode={() => {}}
          />
        </MemoryRouter>
      );

      const mobileDialog = screen.getByRole("dialog", { name: "모바일 메뉴" });
      expect(mobileDialog).toHaveClass("w-72");
      // Mobile drawer should not have desktop collapse toggle
      expect(within(mobileDialog).queryByRole("button", { name: "사이드바 접기" })).not.toBeInTheDocument();
      expect(within(mobileDialog).queryByRole("button", { name: "사이드바 펼치기" })).not.toBeInTheDocument();
    });
  });

  describe("AppShell Layout Flow", () => {
    it("renders flex-column main column with mt-auto on footer for short-page placement", () => {
      saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
      const { container } = render(
        <MemoryRouter initialEntries={["/pricing/"]}>
          <TrainingSelectionProvider>
            <AppShell
              activeView="pricing"
              darkMode={false}
              mobileOpen={false}
              onCloseMobileMenu={() => {}}
              onNavigate={() => {}}
              onToggleDarkMode={() => {}}
              onToggleMobileMenu={() => {}}
              showTrainingHeader={false}
            >
              <div>Pricing Content</div>
            </AppShell>
          </TrainingSelectionProvider>
        </MemoryRouter>
      );

      const mainColumn = container.querySelector("[data-main-column]");
      expect(mainColumn).toHaveClass("flex", "min-h-[100dvh]", "min-w-0", "flex-1", "flex-col");

      const main = container.querySelector("main");
      expect(main).toHaveClass("flex", "flex-1", "min-w-0", "flex-col");

      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("mt-auto");
      expect(footer).toHaveAttribute("data-footer-variant", "public");
    });

    it("renders compact app footer on internal routes", () => {
      saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
      const { container } = render(
        <MemoryRouter initialEntries={["/mypage/"]}>
          <TrainingSelectionProvider>
            <AppShell
              activeView="mypage"
              darkMode={false}
              mobileOpen={false}
              onCloseMobileMenu={() => {}}
              onNavigate={() => {}}
              onToggleDarkMode={() => {}}
              onToggleMobileMenu={() => {}}
              showTrainingHeader={false}
            >
              <div>My Page Content</div>
            </AppShell>
          </TrainingSelectionProvider>
        </MemoryRouter>
      );

      const footer = container.querySelector("footer");
      expect(footer).toHaveAttribute("data-footer-variant", "app");
    });

    it("suppresses footer completely on practice-mock route", () => {
      saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
      const { container } = render(
        <MemoryRouter initialEntries={["/practice/mock/"]}>
          <TrainingSelectionProvider>
            <AppShell
              activeView="practice-mock"
              darkMode={false}
              mobileOpen={false}
              onCloseMobileMenu={() => {}}
              onNavigate={() => {}}
              onToggleDarkMode={() => {}}
              onToggleMobileMenu={() => {}}
              showTrainingHeader={true}
            >
              <div>Mock Content</div>
            </AppShell>
          </TrainingSelectionProvider>
        </MemoryRouter>
      );

      const footer = container.querySelector("footer");
      expect(footer).toBeNull();
    });
  });
});
