import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomeView } from "./components/home/HomeView";

describe("compact About product overview", () => {
  it("shows the restored product definition, Course × Level model, 6 STEP rail, and CTAs", () => {
    const { container } = render(<MemoryRouter><HomeView /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1, name: "오픽온미란?" })).toBeInTheDocument();
    expect(screen.getByText("많이 외우는 대신, 익숙한 이야기를 질문에 맞게 바꾸어 말하는 OPIc 훈련 도구.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "세 가지 훈련 원칙" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Course × Level" })).toBeInTheDocument();

    const rail = screen.getByLabelText("6 STEP 훈련 흐름");
    expect(within(rail).getAllByText(/STEP [1-6]/)).toHaveLength(6);
    expect(screen.getByRole("link", { name: /실전 훈련 둘러보기/ })).toHaveAttribute("href", "/training/");
    expect(screen.getByRole("link", { name: /수험 가이드/ })).toHaveAttribute("href", "/exam-guide/");

    expect(container.querySelector("[data-about-overview]")).toHaveClass("max-w-7xl");
    const overviewGrid = container.querySelector("[data-about-overview] section")?.parentElement;
    expect(overviewGrid).toHaveClass("lg:grid-cols-[0.88fr_1.12fr]");
    expect(container.querySelectorAll("p").length).toBeLessThanOrEqual(12);
  });
});
