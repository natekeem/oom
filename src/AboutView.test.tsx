import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomeView } from "./components/home/HomeView";

describe("one-screen About product overview", () => {
  it("shows the product definition, metrics, Course × Level model, 6 STEP rail, AI Coach, and CTAs", () => {
    const { container } = render(<MemoryRouter><HomeView /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1, name: "오픽온미란?" })).toBeInTheDocument();
    expect(screen.getByText("적은 수의 기본 스크립트를 익히고, 질문에 맞게 필요한 부분만 바꿔 말하도록 만든 OPIc 훈련 시스템입니다.")).toBeInTheDocument();
    expect(container.textContent).toContain("3 COURSES");
    expect(container.textContent).toContain("3 LEVELS");
    expect(container.textContent).toContain("6 STEPS");
    expect(container.textContent).toContain("AI COACH");
    expect(screen.getByRole("heading", { name: "OOM TRAINING PRINCIPLES" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Course × Level" })).toBeInTheDocument();

    const rail = screen.getByLabelText("6 STEP 훈련 흐름");
    expect(within(rail).getAllByText(/^[1-6]$/)).toHaveLength(6);
    expect(screen.getByRole("link", { name: /실전 훈련 둘러보기/ })).toHaveAttribute("href", "/training/");
    expect(screen.getByRole("link", { name: /수험 가이드/ })).toHaveAttribute("href", "/exam-guide/");

    expect(container.querySelector("[data-about-overview]")).toHaveClass("max-w-7xl");
    const overviewGrid = container.querySelector("[data-about-overview] section")?.parentElement;
    expect(overviewGrid).toHaveClass("lg:grid-cols-[0.86fr_1.14fr]");
    expect(container.textContent).toContain("답변 분석 · 스크립트/질문 Assist · 재시도 미션");
    expect(container.querySelector('[aria-label="OOM · OPIc On Me"]')).toBeInTheDocument();
  });
});
