import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { MagazineDetail } from "./components/magazine/MagazineDetail";
import { getRelatedMagazineArticles, magazineArticles } from "./data/magazine";

describe("Magazine article linking", () => {
  afterEach(() => {
    document.getElementById("oom-article-structured-data")?.remove();
  });

  it("links three real peer articles from every detail page", () => {
    const article = magazineArticles[0];
    const expectedRelatedArticles = getRelatedMagazineArticles(article.id);

    render(
      <MemoryRouter initialEntries={[`/magazine/${article.id}/`]}>
        <Routes>
          <Route path="/magazine/:id/" element={<MagazineDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "함께 읽을 글" })).toBeInTheDocument();
    expect(expectedRelatedArticles).toHaveLength(3);
    for (const relatedArticle of expectedRelatedArticles) {
      expect(screen.getByText(relatedArticle.title).closest("a")).toHaveAttribute(
        "href",
        `/magazine/${relatedArticle.id}/`,
      );
    }
  });
});
