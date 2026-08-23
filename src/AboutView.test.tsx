import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomeView } from "./components/home/HomeView";

describe("one-screen About product overview", () => {
  it("shows the product definition, metrics, Course × Level model, 6 STEP rail, AI Coach, and CTAs", () => {
    const { container } = render(<MemoryRouter><HomeView /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1, name: "오픽온미란?" })).toBeInTheDocument();
    expect(container.textContent).toContain("적은 수의 기본 스크립트를 익히고, 질문에 맞게 필요한 부분만 바꿔 말하는 OPIc 훈련 시스템입니다.");
    const metrics = screen.getByLabelText("OOM 시스템 구성");
    expect(metrics.textContent).toContain("COURSES3");
    expect(metrics.textContent).toContain("LEVELS3");
    expect(metrics.textContent).toContain("STEPS6");
    expect(metrics.textContent).toContain("COACHAI");
    expect(screen.queryByRole("heading", { name: "OOM TRAINING PRINCIPLES" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Course × Level" })).toBeInTheDocument();

    const rail = screen.getByLabelText("6 STEP 훈련 흐름");
    expect(within(rail).getAllByText(/^[1-6]$/)).toHaveLength(6);
    expect(screen.getByRole("link", { name: /실전 훈련 둘러보기/ })).toHaveAttribute("href", "/training/");
    expect(screen.getByRole("link", { name: /수험 가이드/ })).toHaveAttribute("href", "/exam-guide/");

    expect(container.querySelector("[data-about-overview]")).toHaveClass("max-w-7xl");
    expect(container.querySelector("[data-about-metrics]")?.children).toHaveLength(4);
    expect(container.querySelector("[data-about-core-grid]")).toHaveClass("lg:grid-cols-2");
    expect(container.querySelector("[data-about-principles]")).not.toBeInTheDocument();
    expect(container.querySelector("[data-about-ai-strip]")).toBeInTheDocument();
    expect(container.querySelector("[data-about-overview] > .overflow-hidden")).not.toBeInTheDocument();
    expect(container.textContent).toContain("답변 분석 · KEEP/FIX/RETRY · 스크립트/질문 Assist");
    expect(container.querySelector('[aria-label="OOM · OPIc On Me"]')).toBeInTheDocument();
  });
});
