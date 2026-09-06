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

  it("shows the STEP 4 training header on the self-introduction page", async () => {
    saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
    render(
      <MemoryRouter initialEntries={["/training/scripts/self-introduction/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("훈련 진행 60%")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "다음 단계: 첫 스토리" })).toHaveLength(2);
  });

  it("ends the six-step header flow on practice without an AI settings action", async () => {
    saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
    render(
      <MemoryRouter initialEntries={["/practice/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("훈련 진행 100%")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다음 단계: AI 설정" })).not.toBeInTheDocument();
  });

  it("routes the STEP 6 hub, Quick child, and Mock child independently", async () => {
    saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });

    const hub = render(
      <MemoryRouter initialEntries={["/practice/"]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: "배운 내용을 실제 말하기로 연결해보세요." })).toBeInTheDocument();
    expect(screen.queryByText("OOM OPIc Practice Console")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "서비스 정보" })).toBeInTheDocument();
    hub.unmount();

    const quick = render(
      <MemoryRouter initialEntries={["/practice/quick/"]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByRole("button", { name: "질문 듣기" })).toBeInTheDocument();
    expect(screen.queryByText(/WARM-UP|자기소개 워밍업/)).not.toBeInTheDocument();
    expect(screen.getByText("훈련 진행 100%")).toBeInTheDocument();
    expect(screen.getAllByText("STEP 6 · 빠른 연습").length).toBeGreaterThan(0);
    expect(screen.getByRole("navigation", { name: "서비스 정보" })).toBeInTheDocument();
    quick.unmount();

    render(
      <MemoryRouter initialEntries={["/practice/mock/"]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: /모의고사에서 사용할 배경 설문/ })).toBeInTheDocument();
    expect(screen.queryByText("WARM-UP · 자기소개")).not.toBeInTheDocument();
    expect(screen.queryByText("훈련 진행 100%")).not.toBeInTheDocument();
    expect(screen.getAllByText("STEP 6 · 실전 모의고사").length).toBeGreaterThan(0);
    expect(screen.queryByRole("navigation", { name: "서비스 정보" })).not.toBeInTheDocument();
  });

  it("keeps STEP 6 expanded with two leaf children on desktop and mobile", async () => {
    saveTrainingSelection({ courseId: "course-1", levelId: "advanced" });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/practice/mock/"]}>
        <App />
      </MemoryRouter>
    );
    await screen.findByRole("heading", { name: /모의고사에서 사용할 배경 설문/ });

    const desktopNav = screen.getByRole("navigation", { name: "OOM 메뉴" });
    expect(within(desktopNav).getByRole("button", { name: "STEP 6. 실전 연습 하위 메뉴 접기" })).toHaveAttribute("aria-expanded", "true");
    expect(within(desktopNav).getByRole("button", { name: "실전 모의고사" })).toHaveAttribute("aria-current", "page");
    expect(within(desktopNav).getByRole("button", { name: "빠른 연습" })).not.toHaveAttribute("aria-expanded");
    expect(within(desktopNav).queryByRole("button", { name: /빠른 연습 하위 메뉴/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "메뉴 열기" }));
    const mobile = screen.getByRole("dialog", { name: "모바일 메뉴" });
    expect(within(mobile).getByRole("button", { name: "빠른 연습" })).toBeInTheDocument();
    expect(within(mobile).getByRole("button", { name: "실전 모의고사" })).toHaveAttribute("aria-current", "page");
  });

  it.each(["/practice/quick/", "/practice/mock/"])("guards direct STEP 6 child access without a selection: %s", async (path) => {
    localStorage.removeItem("oom-training-selection-v1");
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByText("먼저 STEP 1에서 목표 구간과 훈련 코스를 설정해 주세요.")).toBeInTheDocument();
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
