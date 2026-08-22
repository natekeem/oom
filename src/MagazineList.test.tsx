import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MagazineList } from "./components/magazine/MagazineList";
import { magazineArticles } from "./data/magazine";

describe("Magazine editorial listing", () => {
  it("uses one full-width 3:2 landscape ratio with cover cropping", () => {
    const { container } = render(<MemoryRouter><MagazineList /></MemoryRouter>);
    const covers = Array.from(container.querySelectorAll<HTMLImageElement>("[data-magazine-cover]"));

    expect(covers).toHaveLength(magazineArticles.length);
    covers.forEach((cover) => {
      expect(cover).toHaveAttribute("data-image-ratio", "3:2");
      expect(cover).toHaveClass("aspect-[3/2]", "h-full", "w-full", "object-cover");
    });

    const grid = covers[0]?.closest(".grid");
    expect(grid).toHaveClass("md:grid-cols-2", "xl:grid-cols-3");
  });

  it("preserves every article route and applies optional crop positioning", () => {
    render(<MemoryRouter><MagazineList /></MemoryRouter>);

    magazineArticles.forEach((article) => {
      expect(screen.getByRole("link", { name: `${article.title} 기사 읽기` })).toHaveAttribute("href", `/magazine/${article.id}/`);
    });

    const positionedArticle = magazineArticles.find((article) => article.id === "opic-im-to-ih-practice-plan");
    const positionedCover = screen.getByAltText(positionedArticle?.imageAlt ?? "");
    expect(positionedArticle?.imagePosition).toBe("center 54%");
    expect(positionedCover).toHaveStyle({ objectPosition: "center 54%" });
  });
});
