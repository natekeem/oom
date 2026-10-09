function normalizePathname(pathname: string) {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || "/";
  if (withoutQuery === "/") return "/";
  return `/${withoutQuery.replace(/^\/+|\/+$/g, "")}/`;
}

/**
 * These routes only become useful after a learner explicitly chooses a Course
 * and Level in STEP 1. They remain public application routes, but they are not
 * stable search landing pages because their contents depend on browser state.
 */
export const SELECTION_DEPENDENT_PATHS = [
  "/training/survey/",
  "/training/difficulty/",
  "/training/scripts/",
  "/training/scripts/self-introduction/",
  "/training/scripts/outdoor/",
  "/training/scripts/indoor/",
  "/training/scripts/sports/",
  "/training/scripts/home/",
  "/roleplay/",
  "/roleplay/formula/",
  "/roleplay/travel/",
  "/roleplay/indoor/",
  "/roleplay/sports/",
  "/roleplay/home/",
  "/practice/",
  "/practice/quick/",
  "/practice/mock/",
] as const;

const selectionDependentPathSet = new Set<string>(SELECTION_DEPENDENT_PATHS);

export function isSelectionDependentPath(pathname: string) {
  return selectionDependentPathSet.has(normalizePathname(pathname));
}

/**
 * AdSense is intentionally limited to stable editorial pages. Ownership is
 * verified separately with google-adsense-account metadata and ads.txt, so
 * application, account, pricing, legal, and navigation pages do not need to
 * load the Auto ads script.
 */
export function isAdEligiblePath(pathname: string) {
  const normalized = normalizePathname(pathname);
  const isMagazineArticle = /^\/magazine\/[^/]+\/$/.test(normalized);
  const isExamGuide = normalized === "/exam-guide/" || normalized.startsWith("/exam-guide/");
  return isMagazineArticle || isExamGuide;
}
