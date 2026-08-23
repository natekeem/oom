import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomeView } from "./components/home/HomeView";

describe("Method Editorial About product overview", () => {
  it("shows the product definition, compact editorial metrics, and CTAs", () => {
    const { container } = render(<MemoryRouter><HomeView /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1, name: "오픽온미란?" })).toBeInTheDocument();
    expect(container.textContent).toContain("Course로 준비 범위를 정하고, Level로 답변 밀도를 맞춘 뒤, 6단계 훈련과 AI 재시도로 연결합니다.");
    const metrics = screen.getByLabelText("OOM 시스템 구성");
    expect(within(metrics).getByText("COURSES")).toBeInTheDocument();
    expect(within(metrics).getByText("LEVELS")).toBeInTheDocument();
    expect(within(metrics).getByText("STEPS")).toBeInTheDocument();
    expect(within(metrics).getByText("COACH")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /실전 훈련 둘러보기/ })).toHaveAttribute("href", "/training/");
    expect(screen.getByRole("link", { name: /수험 가이드/ })).toHaveAttribute("href", "/exam-guide/");

    expect(container.querySelector("[data-about-overview]")).toHaveClass("max-w-7xl");
    expect(container.querySelector("[data-about-metrics]")?.children).toHaveLength(4);
    expect(container.textContent).toContain("AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.");
  });

  it("keeps interactions progressive and semantics action-led", () => {
    const source = readFileSync(join(process.cwd(), "src", "components", "home", "HomeView.tsx"), "utf8");
    expect(source).not.toContain("tabIndex");
    expect(source).not.toMatch(/📚|🎯|🤖|✨/u);
  });
});
