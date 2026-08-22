import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "./landing/LandingPage";
import { LandingPracticePreview } from "./landing/components/LandingPracticePreview";
import { LANDING_SCENE_CURSOR_MODES, LANDING_SCENE_POINTER_STRENGTHS, LANDING_SIGNAL_SCENE_LAYOUTS } from "./landing/landingMotionStore";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  Object.defineProperty(window, "matchMedia", { configurable: true, value: originalMatchMedia });
  vi.restoreAllMocks();
});

describe("landing accessibility fallbacks", () => {
  it("preserves all semantic content and disables enhancements for reduced motion", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
      })),
    });

    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector(".landing-page")).toHaveAttribute("data-reduced-motion", "true"));

    expect(screen.getByRole("heading", { level: 1, name: /OPIc, ON ME/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /말하고, 확인하고/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /AI COACH/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /실전 훈련 둘러보기/ })).toHaveLength(2);
    expect(container.querySelector(".landing-pointer-field")).not.toBeInTheDocument();
    expect(container.querySelector(".landing-webgl-layer")).not.toBeInTheDocument();
  });

  it("keeps the mobile fallback free of WebGL and pointer canvases", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query === "(pointer: coarse)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
      })),
    });

    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector(".landing-page")).toHaveAttribute("data-landing-quality", "low"));

    expect(container.querySelector(".landing-pointer-field")).not.toBeInTheDocument();
    expect(container.querySelector(".landing-webgl-layer")).not.toBeInTheDocument();
  });
});

describe("landing correction contracts", () => {
  it("reuses the existing STEP 6 ExamScreenShell without runtime side effects", () => {
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    render(<LandingPracticePreview />);

    expect(screen.getByLabelText("실제 STEP 6 시험 화면 미리보기")).toHaveAttribute("inert");
    expect(screen.getByLabelText("OOM OPIc 실전 연습 시험 콘솔")).toBeInTheDocument();
    expect(screen.getByAltText("가상 인터뷰어 EVA")).toBeInTheDocument();
    expect(storageWrite).not.toHaveBeenCalled();

    const source = readFileSync(join(process.cwd(), "src", "landing", "components", "LandingPracticePreview.tsx"), "utf8");
    expect(source).toContain("ExamScreenShell");
    expect(source).not.toMatch(/import .*?(PracticeView|Recorder|speech|llm)|MediaRecorder|localStorage/i);
  });

  it("keeps every landing section on a live global pointer mode", () => {
    expect(Object.values(LANDING_SCENE_CURSOR_MODES)).not.toContain("none");
    expect(LANDING_SCENE_CURSOR_MODES.pivot).toBe("attract");
    expect(LANDING_SCENE_CURSOR_MODES.practice).toBe("tilt");
    expect(LANDING_SCENE_CURSOR_MODES.ai).toBe("ambient");
    expect(LANDING_SCENE_CURSOR_MODES.final).toBe("reconverge");
    expect(Object.keys(LANDING_SCENE_POINTER_STRENGTHS)).toEqual(["hero", "story", "levels", "journey", "pivot", "practice", "ai", "final"]);
    expect(Object.values(LANDING_SCENE_POINTER_STRENGTHS).every((strength) => strength > 0)).toBe(true);
    expect(LANDING_SCENE_POINTER_STRENGTHS.hero).toBe(1);
    expect(LANDING_SCENE_POINTER_STRENGTHS.final).toBe(0.8);

    const source = readFileSync(join(process.cwd(), "src", "landing", "components", "PointerSignalTrail.tsx"), "utf8");
    expect(source).toContain('window.addEventListener("pointermove"');
    expect(source).toContain("ambient: { count: 1");
    expect(source).toContain("reconverge: { count: 2");

    const timelineSource = readFileSync(join(process.cwd(), "src", "landing", "hooks", "useLandingScrollTimeline.ts"), "utf8");
    expect(timelineSource).toContain('window.addEventListener("scroll", requestSceneSync');
    expect(timelineSource).toContain("section.getBoundingClientRect()");
  });

  it("uses local deformation and scene anchors without continuous rigid rotation", () => {
    const source = readFileSync(join(process.cwd(), "src", "landing", "three", "MorphingSignalPoints.tsx"), "utf8");
    expect(source).not.toMatch(/points\.rotation\.[xyz]/);
    expect(source).toContain("const breath = 1 + Math.sin");
    expect(source).toContain("const organicDeformation = Math.sin");
    expect(source).toContain("const radialScale = 1 + organicDeformation");
    expect(source).toContain("const localBulge = pointerFalloff");
    expect(source).toContain("pointerLocalX");

    expect(LANDING_SIGNAL_SCENE_LAYOUTS.story.anchorX).toBeGreaterThan(0);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.pivot.opacity).toBeLessThanOrEqual(0.25);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.practice.opacity).toBeLessThanOrEqual(0.2);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.opacity).toBeGreaterThanOrEqual(0.9);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.anchorX).toBe(0);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.anchorY).toBe(0);
  });

  it("keeps Pivot and Practice surfaces above the signature field", () => {
    const css = readFileSync(join(process.cwd(), "src", "landing", "landing.css"), "utf8");
    expect(css).toContain(".landing-webgl-layer { position: fixed; inset: 0; z-index: 1;");
    expect(css).toContain(".landing-pointer-field { position: fixed; inset: 0; z-index: 3;");
    expect(css).toMatch(/\.landing-vignette \{[^}]*z-index: 2;/);
    expect(css).toContain(".landing-pivot-demo { position: relative; z-index: 12;");
    expect(css).toContain(".landing-practice-frame { position: relative; z-index: 12;");
    expect(css).not.toMatch(/\.landing-webgl-layer[^}]*filter:\s*blur/s);
  });

  it("keeps Journey in normal document flow and removes the isolated pin", () => {
    const source = readFileSync(join(process.cwd(), "src", "landing", "hooks", "useLandingScrollTimeline.ts"), "utf8");
    expect(source).toContain('trigger: ".landing-journey"');
    expect(source).toContain('start: "top 80%"');
    expect(source).toContain('end: "bottom 20%"');
    expect(source).toContain("pin: false");
    expect(source).not.toContain("pin: true");
    expect(source).not.toContain("anticipatePin");
  });

  it("uses a crisp trail core plus a restrained halo instead of fog-only circles", () => {
    const source = readFileSync(join(process.cwd(), "src", "landing", "components", "PointerSignalTrail.tsx"), "utf8");
    expect(source).toContain("coreRadius");
    expect(source).toContain("coreOpacity");
    expect(source).toContain("haloRadius");
    expect(source).toContain("context.lineTo(point.x, point.y)");
    expect(source).not.toContain("radius: 34");
  });

  it("uses the approved messaging, simplified Pivot, and honest AI Coach positioning", async () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    expect(screen.getByText("외울 건 줄이고, 바꿔 말할 건 정해두고.")).toBeInTheDocument();
    expect(container.textContent).toContain("적게 준비하고,여러 질문에 돌려씁니다.");
    expect(container.textContent).toContain("같은 스크립트도목표에 맞게 밀도를 바꿉니다.");
    expect(container.textContent).toContain("질문이 틀어져도처음부터 다시 외우지 않습니다.");
    expect(screen.getByText("AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.")).toBeInTheDocument();
    expect(container.querySelector('[data-landing-scene="ai"]')).toBeInTheDocument();
    expect(container.querySelectorAll(".landing-pivot-arrow")).toHaveLength(1);
    expect(container.textContent).not.toContain("PIVOT QUESTION");
    expect(container.textContent).not.toMatch(/AL 보장|고득점 보장|합격 보장/);
    expect(await screen.findByLabelText("실제 STEP 6 시험 화면 미리보기")).toBeInTheDocument();
  });

  it("reuses the shared OOM brand mark in landing and app navigation", () => {
    const landingSource = readFileSync(join(process.cwd(), "src", "landing", "components", "LandingNav.tsx"), "utf8");
    const sidebarSource = readFileSync(join(process.cwd(), "src", "components", "layout", "ExpandableSidebar.tsx"), "utf8");
    const legacySidebarSource = readFileSync(join(process.cwd(), "src", "components", "layout", "UnifiedSidebar.tsx"), "utf8");
    expect(landingSource).toContain("OomBrandMark");
    expect(sidebarSource).toContain("OomBrandMark");
    expect(sidebarSource).not.toContain("GraduationCap");
    expect(legacySidebarSource).not.toContain("GraduationCap");
  });
});
