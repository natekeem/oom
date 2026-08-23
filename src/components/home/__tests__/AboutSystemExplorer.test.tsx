import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AboutSystemExplorer } from "../AboutSystemExplorer";
import { HomeView } from "../HomeView";
import type { AboutCourseOption, AboutLevelOption } from "../types";

const mockCourses: AboutCourseOption[] = [
  { id: "course-1", label: "Everyday & Getaway", helper: "일상 · 여행" },
  { id: "course-2", label: "Culture & City", helper: "문화 · 도시" },
  { id: "course-3", label: "Nature & Weekend", helper: "자연 · 주말" },
  { id: "course-4", label: "New Course", helper: "새로운 코스" },
];

const mockLevels: AboutLevelOption[] = [
  { id: "advanced", sectionLabel: "1구간", label: "Advanced", targetSecondsLabel: "60-90초" },
  { id: "intermediate", sectionLabel: "2구간", label: "Intermediate", targetSecondsLabel: "45-65초" },
  { id: "foundation", sectionLabel: "3구간", label: "Foundation", targetSecondsLabel: "30-45초" },
];

describe("AboutSystemExplorer", () => {
  it("renders Course options from supplied registry-derived options", () => {
    render(
      <BrowserRouter>
        <AboutSystemExplorer courses={mockCourses} levels={mockLevels} />
      </BrowserRouter>
    );
    expect(screen.getAllByText(/Everyday & Getaway/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/New Course/)[0]).toBeInTheDocument();
  });

  it("updates Training Context when Course changes", () => {
    render(
      <BrowserRouter>
        <AboutSystemExplorer courses={mockCourses} levels={mockLevels} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Culture & City/ }));
    expect(screen.getAllByText(/Culture & City × 2구간/)[0]).toBeInTheDocument();
  });

  it("updates target duration when Level changes", () => {
    render(
      <BrowserRouter>
        <AboutSystemExplorer courses={mockCourses} levels={mockLevels} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /1구간 · Advanced/ }));
    expect(screen.getAllByText(/60-90초/)[0]).toBeInTheDocument();
  });

  it("full system mode does not reset selected Course or Level", () => {
    render(
      <BrowserRouter>
        <AboutSystemExplorer courses={mockCourses} levels={mockLevels} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Culture & City/ }));
    fireEvent.click(screen.getByRole("button", { name: /1구간 · Advanced/ }));
    
    fireEvent.click(screen.getByRole("button", { name: /전체 시스템 보기/ }));
    expect(screen.getAllByText(/Culture & City × 1구간/)[0]).toBeInTheDocument();
  });
});

describe("HomeView", () => {
  it("includes AI Coach disclaimer", () => {
    render(
      <BrowserRouter>
        <HomeView />
      </BrowserRouter>
    );
    expect(screen.getByText(/AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다/)).toBeInTheDocument();
  });
});
