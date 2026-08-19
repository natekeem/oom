import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { saveTrainingSelection } from "./training/storage";

describe("training navigation", () => {
  it("shows progress only for training and keeps formula scenarios behind cards", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByText("훈련 진행 0%")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "OPIc 실전 훈련하기" }));

    expect(await screen.findByRole("heading", { name: "서베이부터 실전 답변까지, 같은 흐름으로 반복합니다." })).toBeInTheDocument();
    expect(screen.getByText("훈련 진행 0%")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "STEP 4. 롤플레이 공식" }));
    await user.click(screen.getByRole("button", { name: "공식 · 출제 구조" }));

    expect(await screen.findByRole("heading", { name: "어떤 상황이 와도, 같은 6단계 순서로 해결합니다." })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "시나리오 보기" })).toHaveLength(4);
    expect(screen.queryByText("EVA QUESTION")).not.toBeInTheDocument();
  });
});
