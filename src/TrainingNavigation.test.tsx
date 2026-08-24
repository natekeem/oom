import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { saveTrainingSelection } from "./training/storage";

describe("training navigation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows progress only for training and keeps roleplay scenarios structured", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/training/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByText("훈련 진행 0%")).not.toBeInTheDocument();

    // /training/ is TrainingHub with 6 STEP overview
    expect(
      await screen.findByRole("heading", { name: "최소한의 스토리로, 더 많은 질문에 답하는 6 STEP 훈련" }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(screen.getByText("OPIc 실전 훈련 6 STEP 로드맵")).toBeInTheDocument();

    // Click STEP 1 button
    const step1Button = screen.getByRole("button", { name: /STEP 1 이동/ });
    await user.click(step1Button);
    
    expect(
      await screen.findByRole("heading", { name: "목표 구간과 학습 코스를 먼저 설정합니다." }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(screen.getByText("훈련 진행 0%")).toBeInTheDocument();

    // Navigate to STEP 5 by going back to hub first using sidebar/navigation
    // Use the training hub link in the navigation
    const trainingHubLink = screen.getAllByRole("link").find(link => 
      link.getAttribute("href") === "/training/" || link.textContent?.includes("실전 훈련")
    );
    
    if (trainingHubLink) {
      await user.click(trainingHubLink);
      await screen.findByRole("heading", { name: "최소한의 스토리로, 더 많은 질문에 답하는 6 STEP 훈련" });
    }

    // Click STEP 5 button
    const step5Button = screen.getByRole("button", { name: /STEP 5 이동/ });
    await user.click(step5Button);

    // Wait for roleplay heading
    await waitFor(
      () => expect(
        screen.getByRole("heading", {
          name: "문제를 설명하고, 대안을 요청하고, 정중하게 마무리합니다.",
        })
      ).toBeInTheDocument(),
      { timeout: 4000 }
    );
    expect(screen.getAllByRole("button", { name: /시나리오 훈련/ }).length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("EVA QUESTION")).not.toBeInTheDocument();
  });
});
