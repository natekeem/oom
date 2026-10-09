import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MagazineList } from "./components/magazine/MagazineList";
import { magazineArticles } from "./data/magazine";

describe("Magazine editorial listing", () => {
  it("publishes 30 unique, truthfully dated articles in newest-first order", () => {
    expect(magazineArticles).toHaveLength(30);
    expect(new Set(magazineArticles.map((article) => article.id)).size).toBe(30);
    expect(new Set(magazineArticles.map((article) => article.title)).size).toBe(30);
    expect(new Set(magazineArticles.map((article) => article.image)).size).toBe(30);

    const publishedDates = magazineArticles.map((article) => article.publishedAt);
    expect(publishedDates).toEqual([...publishedDates].sort((left, right) => right.localeCompare(left)));
    for (const article of magazineArticles) {
      expect(article.publishedAt <= article.modifiedAt).toBe(true);
      expect(Date.parse(`${article.modifiedAt}T00:00:00+09:00`)).toBeLessThanOrEqual(Date.now());
      expect(article.sources.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps every 2026-07-12 guide on a dedicated cover", () => {
    const julyGuides = magazineArticles.filter((article) => article.publishedAt === "2026-07-12");
    expect(julyGuides).toHaveLength(10);
    expect(new Set(julyGuides.map((article) => article.image)).size).toBe(10);
  });

  it("keeps the new editorial expansion substantive instead of summary-only", () => {
    const newArticles = magazineArticles.filter((article) => article.publishedAt === "2026-10-09");
    expect(newArticles).toHaveLength(15);
    expect(new Set(newArticles.map((article) => article.image)).size).toBe(15);

    for (const article of newArticles) {
      expect(article.sections.length).toBeGreaterThanOrEqual(4);
      expect(article.sections.flatMap((section) => section.paragraphs).length).toBeGreaterThanOrEqual(8);
      expect(article.sections.some((section) => section.example)).toBe(true);
      expect(article.sections.some((section) => section.bullets)).toBe(true);
      expect(article.creationNote.length).toBeGreaterThan(40);
    }
  });

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
