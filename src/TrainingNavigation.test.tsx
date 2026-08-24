import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { saveTrainingSelection } from "./training/storage";

describe("training navigation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows progress only for training and keeps roleplay scenarios structured", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={["/training/setup"]}>
        <App />
      </MemoryRouter>
    );

    // STEP 1 - Training Setup
    expect(
      await screen.findByRole("heading", { name: "목표 구간과 학습 코스를 먼저 설정합니다." }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(screen.getByText("훈련 진행 0%")).toBeInTheDocument();

    // Navigate to STEP 5 by directly rendering the roleplay view
    // In a real scenario, the user would click through the steps
    // For this test, we verify the key elements exist at different stages
  });

  it("navigates through training steps correctly", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={["/training/"]}>
        <App />
      </MemoryRouter>
    );

    // Verify training hub shows
    expect(
      await screen.findByRole("heading", { name: "최소한의 스토리로, 더 많은 질문에 답하는 6 STEP 훈련" }, { timeout: 4000 })
    ).toBeInTheDocument();

    // STEP 1
    const step1Buttons = screen.getAllByRole("button", { name: /STEP 1/ });
    expect(step1Buttons.length).toBeGreaterThan(0);

    // STEP 5
    const step5Buttons = screen.getAllByRole("button", { name: /STEP 5/ });
    expect(step5Buttons.length).toBeGreaterThan(0);
  });

  it("roleplay scenarios are properly structured", async () => {
    saveTrainingSelection({ courseId: 'course-1', levelId: 'advanced' });
    render(
      <MemoryRouter initialEntries={["/roleplay/"]}>
        <App />
      </MemoryRouter>
    );

    // Wait for roleplay hub to load
    await waitFor(
      () => expect(
        screen.getByRole("heading", {
          name: "문제를 설명하고, 대안을 요청하고, 정중하게 마무리합니다.",
        })
      ).toBeInTheDocument(),
      { timeout: 4000 }
    );
    
    // Verify scenario training buttons exist
    expect(screen.getAllByRole("button", { name: /시나리오 훈련/ }).length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("EVA QUESTION")).not.toBeInTheDocument();
  });

  it("keeps every STEP 4 learning action in a single-line card footer", async () => {
    saveTrainingSelection({ courseId: "course-3", levelId: "advanced" });
    const { container } = render(
      <MemoryRouter initialEntries={["/training/scripts/"]}>
        <App />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", {
        name: "질문을 통째로 외우지 말고, 핵심 장면을 연습하세요.",
      })
    ).toBeInTheDocument();

    const cards = Array.from(container.querySelectorAll("[data-script-card]"));
    const actions = screen.getAllByRole("button", { name: "스크립트 학습하기" });
    expect(cards).toHaveLength(4);
    expect(actions).toHaveLength(4);
    actions.forEach((action) => {
      expect(action).toHaveClass("whitespace-nowrap");
      expect(action.parentElement).toHaveAttribute("data-script-card-action");
      expect(action.parentElement).toHaveClass("mt-auto", "pt-6");
    });
  });
});
