import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "./landing/LandingPage";
import { LandingPracticePreview } from "./landing/components/LandingPracticePreview";
import { LANDING_SCENE_CURSOR_MODES, LANDING_SIGNAL_SCENE_LAYOUTS } from "./landing/landingMotionStore";

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
    expect(screen.getByRole("heading", { name: /LISTEN. SPEAK. REVIEW. RETRY/ })).toBeInTheDocument();
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
    expect(LANDING_SCENE_CURSOR_MODES.exam).toBe("tilt");
    expect(LANDING_SCENE_CURSOR_MODES.ecosystem).toBe("ambient");
    expect(LANDING_SCENE_CURSOR_MODES.final).toBe("reconverge");

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
    expect(source).toContain("const vibration = Math.sin");
    expect(source).toContain("pointerLocalX");

    expect(LANDING_SIGNAL_SCENE_LAYOUTS.story.anchorX).toBeGreaterThan(0);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.pivot.opacity).toBeLessThanOrEqual(0.25);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.exam.opacity).toBeLessThanOrEqual(0.2);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.opacity).toBeGreaterThanOrEqual(0.9);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.anchorX).toBe(0);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.anchorY).toBe(0);
  });

  it("keeps Pivot and Practice surfaces above the signature field", () => {
    const css = readFileSync(join(process.cwd(), "src", "landing", "landing.css"), "utf8");
    expect(css).toContain(".landing-webgl-layer { position: fixed; inset: 0; z-index: 1;");
    expect(css).toContain(".landing-pointer-field { position: fixed; inset: 0; z-index: 2;");
    expect(css).toContain(".landing-pivot-demo { position: relative; z-index: 12;");
    expect(css).toContain(".landing-practice-frame { position: relative; z-index: 12;");
    expect(css).not.toMatch(/\.landing-webgl-layer[^}]*filter:\s*blur/s);
  });
});
