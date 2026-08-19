import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { saveTrainingSelection } from "./training/storage";

describe("training navigation", () => {
  it("shows progress only for training and keeps roleplay scenarios structured", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByText("훈련 진행 0%")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "OPIc 실전 훈련하기" }));

    expect(await screen.findByRole("heading", { name: "목표 구간과 학습 코스를 먼저 설정합니다." })).toBeInTheDocument();
    expect(screen.getByText("훈련 진행 0%")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "STEP 5. 롤플레이 공식" }));

    expect(await screen.findByRole("heading", { name: "문제를 설명하고, 대안을 요청하고, 정중하게 마무리합니다." })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /시나리오 훈련/ }).length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("EVA QUESTION")).not.toBeInTheDocument();
  });
});
