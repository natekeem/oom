import { describe, expect, it } from "vitest";
import { discoveredCourses, resolveTrainingContext } from "./training/courseRegistry";
import { TRAINING_LEVELS } from "./training/levels";
import {
  deriveScriptLearningSections,
  getCoreScriptText,
  normalizeScriptText,
  splitScriptParagraphs,
} from "./components/script/scriptLearningSections";

const dependentOpening = /^(?:and|but|so|because|that|this|these|those|it|they|he|she|after that|since then|as a result|then)\b/i;

describe("STEP 4 three-stage script pedagogy", () => {
  it("derives OPEN, SCENE, and CLOSE for every Course × Level storyline", () => {
    for (const course of discoveredCourses) {
      for (const level of TRAINING_LEVELS) {
        const context = resolveTrainingContext(course.id, level.id);
        for (const storyline of context.storylines) {
          const sections = deriveScriptLearningSections(storyline.active.englishScript, level.id);
          expect(sections.map((section) => section.id)).toEqual(["open", "scene", "close"]);
          expect(sections.map((section) => section.englishLabel)).toEqual(["OPEN", "SCENE", "CLOSE"]);
          for (const section of sections) {
            expect(section.segments.length, `${course.id}/${level.id}/${storyline.id}/${section.id}`).toBeGreaterThan(0);
            expect(section.segments.some((segment) => segment.kind === "core")).toBe(true);
          }
        }
      }
    }
  });

  it("turns every two-paragraph source into three sentence/function learning sections", () => {
    let twoParagraphSources = 0;
    for (const course of discoveredCourses) {
      for (const level of TRAINING_LEVELS) {
        const context = resolveTrainingContext(course.id, level.id);
        for (const storyline of context.storylines) {
          if (splitScriptParagraphs(storyline.active.englishScript).length !== 2) continue;
          twoParagraphSources += 1;
          expect(deriveScriptLearningSections(storyline.active.englishScript, level.id)).toHaveLength(3);
        }
      }
    }
    expect(twoParagraphSources).toBeGreaterThan(0);
  });

  it("preserves Advanced source order and keeps the complete ending in CORE", () => {
    for (const course of discoveredCourses) {
      const context = resolveTrainingContext(course.id, "advanced");
      for (const storyline of context.storylines) {
        const source = storyline.active.englishScript;
        const sections = deriveScriptLearningSections(source, "advanced");
        const reconstructed = sections.flatMap((section) => section.segments).map((segment) => segment.text).join(" ");
        const close = sections[2];
        const finalSourceSentence = normalizeScriptText(source).match(/[^.!?]+[.!?]+$/)?.[0].trim();

        expect(normalizeScriptText(reconstructed)).toBe(normalizeScriptText(source));
        expect(close.segments.at(-1)?.kind).toBe("core");
        expect(getCoreScriptText(sections).trim()).toMatch(/[.!?]$/);
        expect(getCoreScriptText(sections)).toContain(finalSourceSentence);
      }
    }
  });

  it("keeps optional expansion short, self-contained, and inside SCENE", () => {
    const optionalCounts = { advanced: 0, intermediate: 0, foundation: 0 };
    for (const course of discoveredCourses) {
      for (const level of TRAINING_LEVELS) {
        const context = resolveTrainingContext(course.id, level.id);
        for (const storyline of context.storylines) {
          const sections = deriveScriptLearningSections(storyline.active.englishScript, level.id);
          const scene = sections[1];
          const optional = sections.flatMap((section) =>
            section.segments.filter((segment) => segment.kind === "optional").map((segment) => ({ section: section.id, text: segment.text }))
          );
          optionalCounts[level.id] += optional.length;

          expect(optional.length).toBeLessThanOrEqual(level.id === "advanced" ? 2 : level.id === "intermediate" ? 1 : 0);
          expect(scene.segments[0].kind).toBe("core");
          expect(scene.segments.at(-1)?.kind).toBe("core");
          for (const item of optional) {
            expect(item.section).toBe("scene");
            expect(item.text.split(/\s+/).length).toBeLessThanOrEqual(34);
            expect(item.text).not.toMatch(dependentOpening);
          }
        }
      }
    }
    expect(optionalCounts.foundation).toBe(0);
    expect(optionalCounts.intermediate).toBeGreaterThan(0);
    expect(optionalCounts.advanced).toBeGreaterThan(0);
  });

  it("promotes only canonical variant facts and never creates a second story", () => {
    let promotedVariants = 0;
    for (const course of discoveredCourses) {
      const context = resolveTrainingContext(course.id, "advanced");
      for (const storyline of context.storylines) {
        const set = context.variantSets[storyline.id];
        for (const variant of set.variants) {
          expect(variant).toHaveProperty("requiredFacts");
          expect(variant).toHaveProperty("optionalFacts");
          expect(variant.newFacts).toEqual([]);
          for (const fact of variant.requiredFacts ?? []) {
            promotedVariants += 1;
            expect(variant.keep).toContain(fact);
          }
          for (const fact of variant.optionalFacts ?? []) {
            expect(storyline.core.facts).toContain(fact);
          }
        }
      }
    }
    expect(promotedVariants).toBeGreaterThan(0);
  });
});
