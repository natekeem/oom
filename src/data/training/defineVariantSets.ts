import type { ScriptVariantSet } from "../../types";

/**
 * Makes the NEW-fact contract explicit for every authored variant.
 * Unlisted facts are not permission to invent a second story; authors must add
 * the smallest prompt-required fact here and keep the anchor intact.
 */
export function defineVariantSets<T extends Record<string, ScriptVariantSet>>(sets: T): T {
  return Object.fromEntries(
    Object.entries(sets).map(([storylineId, set]) => [
      storylineId,
      {
        ...set,
        variants: set.variants.map((variant) => {
          const requiredFacts = [...new Set(variant.requiredFacts ?? [])];
          return {
            ...variant,
            requiredFacts,
            optionalFacts: [...new Set(variant.optionalFacts ?? [])].filter(
              (fact) => !requiredFacts.includes(fact)
            ),
            newFacts: [...new Set(variant.newFacts ?? [])],
          };
        }),
      },
    ])
  ) as T;
}
