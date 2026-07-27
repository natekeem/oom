import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { BackgroundSurveySheet } from "./components/survey/BackgroundSurveySheet";

describe("OOM survey rehearsal", () => {
  it("shows the complete recommended survey and grades a blank practice attempt", async () => {
    const user = userEvent.setup();
    render(<BackgroundSurveySheet />);

    expect(screen.getByRole("heading", { name: "실제 형식으로 보고, OOM 조합을 그대로 기억합니다." })).toBeInTheDocument();
    expect(screen.getByText("Background Survey")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "최근 5년 이내에 수강했습니까?" })).toBeInTheDocument();
    expect(screen.getByText("수강 후 5년 이상 지남")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "귀하는 어떤 휴가나 출장을 다녀온 경험이 있습니까? (1개 이상)" })).toBeInTheDocument();
    expect(screen.getByText("일 경험 없음")).toBeInTheDocument();
    expect(screen.getByText("테니스")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "연습 모드" }));
    await user.click(await screen.findByRole("button", { name: /채점하기$/ }));
    expect(await screen.findByRole("status")).toHaveTextContent(/추천 답안/);
  });

  it("keeps the sidebar active item in sync with script selection", async () => {
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
