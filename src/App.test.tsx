import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { SIDEBAR_EXPANDED_STORAGE_KEY } from "./components/layout/ExpandableSidebar";
import { saveTrainingSelection } from "./training/storage";

describe("OOM", () => {
  it("defaults new visitors to dark mode while preserving an explicit light preference", async () => {
    localStorage.removeItem("oom-theme");
    document.documentElement.classList.remove("dark");

    const defaultRender = render(
      <MemoryRouter initialEntries={["/about/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(localStorage.getItem("oom-theme")).toBe("dark");
    defaultRender.unmount();

    localStorage.setItem("oom-theme", "light");
    const lightRender = render(
      <MemoryRouter initialEntries={["/about/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => expect(document.documentElement).not.toHaveClass("dark"));
    expect(localStorage.getItem("oom-theme")).toBe("light");
    lightRender.unmount();
    localStorage.removeItem("oom-theme");
  });

  it("renders the independent landing and enters the training app shell", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(await screen.findByRole("heading", { level: 1, name: /OPIc, ON ME/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("link", { name: /실전 훈련 둘러보기/ })[0]);
    await user.click(screen.getByRole("button", { name: "OPIc 실전 훈련하기" }));
    await user.click(screen.getByRole("button", { name: /STEP 2. 추천 서베이 익히기/ }));
    expect(await screen.findByText("실제 형식으로 보고, OOM 추천 조합을 그대로 기억합니다.")).toBeInTheDocument();
  });

  it("keeps the sidebar in sync when a script group changes in the body", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/training/scripts/outdoor/"]}><App /></MemoryRouter>);

    const indoorTitle = await screen.findByText("조용한 카페와 집에서의 휴식 루틴");
    await user.click(indoorTitle);

    expect(screen.getByRole("button", { name: /^실내 \/ 휴식$/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("button", { name: "다음 단계: STEP 5" })).toHaveLength(2);
  });

  it("treats the mobile menu as a modal, closes with Escape, and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/training/"]}><App /></MemoryRouter>);

    const trigger = screen.getByRole("button", { name: "메뉴 열기" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "모바일 메뉴" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("button", { name: "메뉴 닫기" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "모바일 메뉴" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("resets remembered sidebar sections after visiting the landing page", async () => {
    sessionStorage.setItem(
      SIDEBAR_EXPANDED_STORAGE_KEY,
      JSON.stringify(["guide", "training", "script"])
    );
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);

    expect(await screen.findByRole("heading", { level: 1, name: /OPIc, ON ME/ })).toBeInTheDocument();
    expect(sessionStorage.getItem(SIDEBAR_EXPANDED_STORAGE_KEY)).toBeNull();

    await user.click(screen.getAllByRole("link", { name: /실전 훈련 둘러보기/ })[0]);
    expect(
      await screen.findByRole("heading", {
        name: "최소한의 스토리로, 더 많은 질문에 답하는 6 STEP 훈련",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "STEP 4. 만능 스크립트 하위 메뉴 펼치기" })
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "OPIc 수험 가이드 하위 메뉴 펼치기" })
    ).toHaveAttribute("aria-expanded", "false");
  });
});
