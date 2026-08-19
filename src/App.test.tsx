import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { saveTrainingSelection } from "./training/storage";

describe("OOM", () => {
  it.skip("renders the dashboard and navigates to the survey guide", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByText("OOM")).toBeInTheDocument();
    expect(screen.getByText(/오픽은 나에게 맡기고/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /STEP 1. 서베이 고정/ }));
    expect(await screen.findByText("시험 전, 이 선택 조합으로 답변 범위를 고정합니다.")).toBeInTheDocument();
  });

  it("keeps the sidebar in sync when a script group changes in the body", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(<MemoryRouter><App /></MemoryRouter>);

    await user.click(screen.getByRole("link", { name: "스크립트 보기" }));
    const indoorTitle = await screen.findByText("조용한 카페와 집에서의 휴식 루틴");
    await user.click(indoorTitle);

    expect(screen.getByRole("button", { name: /^실내 \/ 휴식$/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("button", { name: "다음 단계: STEP 4" })).toHaveLength(2);
  });
});
