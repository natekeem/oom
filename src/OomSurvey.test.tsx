import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { BackgroundSurveySheet } from "./components/survey/BackgroundSurveySheet";
import { saveTrainingSelection } from "./training/storage";
import { TrainingSelectionProvider } from "./training/TrainingSelectionContext";

describe("OOM survey rehearsal", () => {
  it("shows the complete recommended survey and grades a practice attempt", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <TrainingSelectionProvider>
        <BackgroundSurveySheet />
      </TrainingSelectionProvider>
    );

    expect(screen.getByRole("heading", { name: "실제 형식으로 보고, OOM 추천 조합을 그대로 기억합니다." })).toBeInTheDocument();
    expect(screen.getByText("일 경험 없음")).toBeInTheDocument();
    expect(screen.getByText("공원 가기")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "연습 모드" }));
    await user.click(screen.getByRole("button", { name: "선택한 서베이 답안 채점하기" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/채점 결과/);
  });

  it("keeps the sidebar active item in sync with script selection", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("link", { name: "스크립트 보기" }));
    const indoorTitle = await screen.findByText("조용한 카페와 집에서의 휴식 루틴");
    await user.click(indoorTitle);

    expect(screen.getByRole("button", { name: "실내 / 휴식" })).toHaveAttribute("aria-current", "page");
  });
});
