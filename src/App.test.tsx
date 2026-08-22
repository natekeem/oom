import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { saveTrainingSelection } from "./training/storage";

describe("OOM", () => {
  it("renders the dashboard and navigates to the survey guide", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getAllByText("오픽온미").length).toBeGreaterThan(0);
    expect(await screen.findByText(/오픽은 나에게 맡기고/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "OPIc 실전 훈련하기" }));
    await user.click(screen.getByRole("button", { name: /STEP 2. 추천 서베이 익히기/ }));
    expect(await screen.findByText("실제 형식으로 보고, OOM 추천 조합을 그대로 기억합니다.")).toBeInTheDocument();
  });

  it("keeps the sidebar in sync when a script group changes in the body", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(<MemoryRouter><App /></MemoryRouter>);

    await user.click(await screen.findByRole("link", { name: "스크립트 보기" }));
    const indoorTitle = await screen.findByText("조용한 카페와 집에서의 휴식 루틴");
    await user.click(indoorTitle);

    expect(screen.getByRole("button", { name: /^실내 \/ 휴식$/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("button", { name: "다음 단계: STEP 5" })).toHaveLength(2);
  });

  it("treats the mobile menu as a modal, closes with Escape, and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><App /></MemoryRouter>);

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
});
