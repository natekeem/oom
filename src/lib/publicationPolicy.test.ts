import { describe, expect, it } from "vitest";
import {
  isAdEligiblePath,
  isSelectionDependentPath,
  SELECTION_DEPENDENT_PATHS,
} from "./publicationPolicy";

describe("publication policy", () => {
  it("keeps all selection-dependent application routes out of search inventory", () => {
    expect(SELECTION_DEPENDENT_PATHS).toHaveLength(17);
    for (const path of SELECTION_DEPENDENT_PATHS) {
      expect(isSelectionDependentPath(path)).toBe(true);
      expect(isSelectionDependentPath(path.slice(0, -1))).toBe(true);
    }

    expect(isSelectionDependentPath("/training/")).toBe(false);
    expect(isSelectionDependentPath("/training/setup/")).toBe(false);
  });

  it("loads AdSense only on stable editorial routes", () => {
    for (const path of [
      "/magazine/opic-answer-checklist/",
      "/exam-guide/",
      "/exam-guide/apply/",
    ]) {
      expect(isAdEligiblePath(path)).toBe(true);
    }

    for (const path of [
      "/",
      "/magazine/",
      "/pricing/",
      "/training/",
      "/training/setup/",
      "/training/difficulty/",
      "/roleplay/",
      "/practice/mock/",
      "/about/",
    ]) {
      expect(isAdEligiblePath(path)).toBe(false);
    }
  });
});
