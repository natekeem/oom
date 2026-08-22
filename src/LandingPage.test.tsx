import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "./landing/LandingPage";

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
});
