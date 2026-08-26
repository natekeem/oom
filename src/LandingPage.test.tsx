import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "./landing/LandingPage";
import { LandingPracticePreview } from "./landing/components/LandingPracticePreview";
import {
  LANDING_SCENE_CURSOR_MODES,
  LANDING_SCENE_POINTER_STRENGTHS,
  LANDING_SCENE_SIGNATURE_PHASES,
  LANDING_SCENE_TRACE_MODES,
  LANDING_SIGNAL_SCENE_LAYOUTS,
} from "./landing/landingMotionStore";

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
    expect(screen.getByRole("heading", { name: /말하고, 고치고/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /AI COACH/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /실전 훈련 둘러보기/ })).toHaveLength(2);
    expect(container.querySelector(".landing-pointer-field")).not.toBeInTheDocument();
    expect(container.querySelector(".landing-webgl-layer")).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-trace-mode]")).toHaveLength(4);

    const css = readFileSync(join(process.cwd(), "src", "landing", "landing.css"), "utf8");
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.landing-trace-core \{ transform: scaleX\(1\) !important;/);
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
    expect(container.querySelectorAll("[data-trace-mode]")).toHaveLength(4);
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
    expect(LANDING_SCENE_POINTER_STRENGTHS.final).toBe(1);

    const source = readFileSync(join(process.cwd(), "src", "landing", "components", "PointerSignalTrail.tsx"), "utf8");
    expect(source).toContain('window.addEventListener("pointermove"');
    expect(source).toContain("setLandingMotion");
    expect(source).toContain("initAgencyFluidCursor");

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

    expect(LANDING_SIGNAL_SCENE_LAYOUTS.story.anchorX).toBe(0);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.story.scale).toBe(1);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.pivot.opacity).toBeLessThanOrEqual(0.16);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.practice.opacity).toBeLessThanOrEqual(0.16);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.opacity).toBeGreaterThanOrEqual(0.9);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.anchorX).toBe(0);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final.anchorY).toBe(0);
    expect(LANDING_SIGNAL_SCENE_LAYOUTS.final).toEqual(LANDING_SIGNAL_SCENE_LAYOUTS.hero);
  });

  it("uses one particle pool only for the Hero O, off-screen ejection, and final O", () => {
    const source = readFileSync(join(process.cwd(), "src", "landing", "three", "MorphingSignalPoints.tsx"), "utf8");
    expect(source).toContain("ejectedTarget");
    expect(source).toContain("Math.pow(heroExit, 1.65)");
    expect(source).toContain('return { from: "ejected", to: "ejected", mix: 1 }');
    expect(source).toContain('to: "finalO"');
    expect(source.match(/<points /g)).toHaveLength(1);
    expect(source).not.toMatch(/branchTraceTarget|parallelTraceTarget|checkpointTraceTarget|bendTraceTarget|recordPulseTraceTarget|scanTraceTarget/);

    expect(LANDING_SCENE_SIGNATURE_PHASES.hero).toBe("heroO");
    expect(LANDING_SCENE_SIGNATURE_PHASES.story).toBe("ejected");
    expect(LANDING_SCENE_SIGNATURE_PHASES.ai).toBe("ejected");
    expect(LANDING_SCENE_SIGNATURE_PHASES.final).toBe("finalO");
    expect(LANDING_SCENE_TRACE_MODES).toEqual({
      story: "branch",
      levels: "parallel",
      journey: "checkpoints",
      pivot: "bend",
      ai: "scan",
    });
  });

  it("anchors REC beside the Practice heading and gives the final O enough scroll runway", () => {
    const pageSource = readFileSync(join(process.cwd(), "src", "landing", "LandingPage.tsx"), "utf8");
    const timelineSource = readFileSync(join(process.cwd(), "src", "landing", "hooks", "useLandingScrollTimeline.ts"), "utf8");
    const css = readFileSync(join(process.cwd(), "src", "landing", "landing.css"), "utf8");

    expect(pageSource).toContain("landing-practice-heading-lockup");
    expect(pageSource).not.toContain("landing-practice-trace");
    expect(pageSource).toContain("landing-final-stage");
    expect(pageSource).toContain('<footer className="landing-tail">');
    expect(timelineSource).not.toContain('xPercent: 260');
    expect(timelineSource).toContain('scene === "hero"');
    expect(timelineSource).toContain('Math.max(0, -closestRect.top) / heroTravel');
    expect(css).toMatch(/\.landing-rec-handoff \{[^}]*left: calc\(100% \+ clamp\(/);
    expect(css).toContain("animation: landing-rec-ring 1.4s ease-in-out infinite");
    expect(css).toContain("@keyframes landing-rec-dot");
    expect(css).toMatch(/\.landing-final \.landing-copy h2\.landing-korean-heading \{ margin-inline: auto; \}/);
    expect(css).toMatch(/\.landing-final-stage \{[^}]*position: sticky;[^}]*height: 100svh;/);
    expect(css).toMatch(/\.landing-tail \{[^}]*min-height: 20svh;/);
  });

  it("moves a signal from left to right across the six-step Journey rail", () => {
    const timelineSource = readFileSync(join(process.cwd(), "src", "landing", "hooks", "useLandingScrollTimeline.ts"), "utf8");
    const css = readFileSync(join(process.cwd(), "src", "landing", "landing.css"), "utf8");

    expect(timelineSource).toContain('"--journey-trace-progress": "0%"');
    expect(timelineSource).toContain('"--journey-trace-progress": "100%"');
    expect(timelineSource).toContain('trigger: ".landing-step-list"');
    expect(timelineSource).toContain('end: "bottom 58%"');
    expect(css).toContain("--journey-trace-progress: 0%");
    expect(css).toMatch(/\.landing-step-list::after \{[^}]*width: var\(--journey-trace-progress\)/);
  });

  it("keeps Pivot and Practice surfaces above the signature field", () => {
    const css = readFileSync(join(process.cwd(), "src", "landing", "landing.css"), "utf8");
    expect(css).toContain(".landing-webgl-layer { position: fixed; inset: 0; z-index: 1;");
    expect(css).toContain(".landing-pointer-field { position: fixed; inset: 0; z-index: 3;");
    expect(css).toMatch(/\.landing-vignette \{[^}]*z-index: 2;/);
    expect(css).toContain(".landing-pivot-demo { position: relative; z-index: 12;");
    expect(css).toContain(".landing-practice-frame { position: relative; z-index: 12;");
    expect(css).toContain("@media (min-width: 1024px)");
    expect(css).toContain('grid-template-areas: "visual copy"');
    expect(css).toContain(".landing-levels { grid-template-columns:");
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

  it("uses the reference WebGL fluid physics with explicit lifecycle cleanup", () => {
    const componentSource = readFileSync(join(process.cwd(), "src", "landing", "components", "PointerSignalTrail.tsx"), "utf8");
    const fluidSource = readFileSync(join(process.cwd(), "src", "landing", "fluid", "agencyFluidCursor.ts"), "utf8");
    expect(componentSource).toContain("landing-fluid-cursor");
    expect(componentSource).toContain("disposeFluidCursor?.()");
    expect(fluidSource).toContain("DENSITY_DISSIPATION: 3.5");
    expect(fluidSource).toContain("VELOCITY_DISSIPATION: 1.5");
    expect(fluidSource).toContain("CURL: 3");
    expect(fluidSource).toContain("SPLAT_RADIUS: 0.6");
    expect(fluidSource).toContain("SPLAT_FORCE: 6500");
    expect(fluidSource).toContain("TRANSPARENT: true");
    expect(fluidSource).toContain("WEBGL_lose_context");
    expect(fluidSource).not.toContain("addEventListener('touch");
  });

  it("uses the approved messaging, simplified Pivot, and honest AI Coach positioning", async () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    expect(screen.getByText("적게 외우고, 질문에 맞게 바꿔 말합니다.")).toBeInTheDocument();
    expect(container.textContent).toContain("적게 준비하고,여러 질문에 돌려씁니다.");
    expect(container.textContent).toContain("같은 스크립트도목표에 맞게 밀도를 바꿉니다.");
    expect(container.textContent).toContain("SIX STEPS.ONE SYSTEM.");
    expect(container.textContent).not.toContain("ONE VOICE");
    expect(container.textContent).toContain("질문이 틀어져도처음부터 외우지 않습니다.");
    expect(container.textContent).toContain("말하고, 고치고,다시 말합니다.");
    expect(container.textContent).toContain("PREP LESS.PRACTICE MORE.");
    expect(screen.getByText("AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.")).toBeInTheDocument();
    expect(container.querySelector('[data-landing-scene="ai"]')).toBeInTheDocument();
    expect(container.querySelectorAll("[data-trace-mode]")).toHaveLength(4);
    expect(container.querySelector(".landing-pivot-arrow")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("질문 방향 변경");
    expect(container.textContent).not.toContain("PIVOT QUESTION");
    expect(container.textContent).not.toMatch(/AL 보장|고득점 보장|합격 보장/);
    expect(await screen.findByLabelText("실제 STEP 6 시험 화면 미리보기")).toBeInTheDocument();
  });

  it("reuses the shared OOM brand mark in landing and app navigation", () => {
    const landingSource = readFileSync(join(process.cwd(), "src", "landing", "components", "LandingNav.tsx"), "utf8");
    const sidebarSource = readFileSync(join(process.cwd(), "src", "components", "layout", "ExpandableSidebar.tsx"), "utf8");
    expect(landingSource).toContain("OomBrandMark");
    expect(sidebarSource).toContain("OomBrandMark");
    expect(sidebarSource).not.toContain("GraduationCap");
  });
});
