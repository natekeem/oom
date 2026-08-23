import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomeView } from "./components/home/HomeView";

describe("Method Editorial About product overview", () => {
  it("shows the product definition, compact editorial metrics, four-step method, AI Coach, and CTAs", () => {
    const { container } = render(<MemoryRouter><HomeView /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1, name: "오픽온미란?" })).toBeInTheDocument();
    expect(container.textContent).toContain("적은 수의 기본 스크립트를 익히고, 질문에 맞게 바꿔 말하는 OPIc 훈련 시스템입니다.");
    const metrics = screen.getByLabelText("OOM 시스템 구성");
    expect(within(metrics).getByText("COURSES")).toBeInTheDocument();
    expect(within(metrics).getByText("LEVELS")).toBeInTheDocument();
    expect(within(metrics).getByText("STEPS")).toBeInTheDocument();
    expect(within(metrics).getByText("COACH")).toBeInTheDocument();
    expect(screen.getByText("The OOM Method")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "적게 준비하고, 필요한 만큼 바꿔 말합니다." })).toBeInTheDocument();

    const method = screen.getByLabelText("THE OOM METHOD 4단계");
    expect(within(method).getAllByRole("listitem")).toHaveLength(4);
    expect(within(method).getByRole("link", { name: /질문에 맞게 바꿉니다/ })).toHaveAttribute("href", "/training/scripts/");
    expect(container.querySelector("[data-about-relation]")).not.toBeInTheDocument();
    expect(container.querySelector("[data-about-loop]")).not.toBeInTheDocument();
    expect(container.querySelector("[data-about-principles]")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /실전 훈련 둘러보기/ })).toHaveAttribute("href", "/training/");
    expect(screen.getByRole("link", { name: /수험 가이드/ })).toHaveAttribute("href", "/exam-guide/");

    expect(container.querySelector("[data-about-overview]")).toHaveClass("max-w-7xl");
    expect(container.querySelector("[data-about-metrics]")?.children).toHaveLength(4);
    expect(container.querySelector("[data-about-method]")).toBeInTheDocument();
    expect(container.querySelector("[data-about-ai-strip]")).toBeInTheDocument();
    expect(container.querySelector("[data-about-overview] > .rounded-md")).not.toBeInTheDocument();
    expect(container.textContent).toContain("답변 분석 · KEEP/FIX/RETRY · 스크립트/질문 Assist");
    expect(container.querySelector('[aria-label="OOM · OPIc On Me"]')).toBeInTheDocument();
  });

  it("keeps editorial interactions progressive and semantics action-led", () => {
    const css = readFileSync(join(process.cwd(), "src", "components", "home", "home.css"), "utf8");
    const source = readFileSync(join(process.cwd(), "src", "components", "home", "HomeView.tsx"), "utf8");

    expect(css).toContain("@media (hover: hover) and (pointer: fine)");
    expect(css).toContain(".about-method-row:focus-within");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(source).not.toContain("tabIndex");
    expect(source).not.toMatch(/📚|🎯|🤖|✨/u);
  });
});
