import type { ViewId } from "./Sidebar";

export type PageWidth = "narrow" | "default" | "wide" | "immersive";
export type FooterVariant = "public" | "app" | "none";

export type RouteLayoutMeta = {
  width: PageWidth;
  footer: FooterVariant;
};

/**
 * Centrally determines the page container width variant and footer variant
 * for each route / view in OOM.
 */
export function getRouteLayoutMeta(viewId: ViewId, pathname = ""): RouteLayoutMeta {
  // 1. Immersive mode: Full Mock Practice (full workspace focus, suppressed footer)
  if (viewId === "practice-mock") {
    return { width: "immersive", footer: "none" };
  }

  // 2. Magazine article detail: text-focused reading
  const isMagazineDetail = /^\/magazine\/[^/]+\/?$/.test(pathname);
  if (isMagazineDetail) {
    return { width: "narrow", footer: "public" };
  }

  // 3. Text-heavy legal / trust pages
  if (
    viewId === "privacy" ||
    viewId === "terms" ||
    viewId === "contact" ||
    viewId === "editorial-policy" ||
    viewId === "image-credits"
  ) {
    return { width: "narrow", footer: "public" };
  }

  // 4. Auth callback (centered compact card)
  if (viewId === "auth-callback") {
    return { width: "narrow", footer: "app" };
  }

  // 5. Complex learning UI (STEP 1~6 and Hubs)
  if (
    viewId === "training-hub" ||
    viewId === "training-setup" ||
    viewId === "survey" ||
    viewId === "difficulty" ||
    viewId === "script-hub" ||
    viewId === "script-self-introduction" ||
    viewId === "script-outdoor" ||
    viewId === "script-indoor" ||
    viewId === "script-sports" ||
    viewId === "script-home" ||
    viewId === "roleplay-hub" ||
    viewId === "roleplay-formula" ||
    viewId === "roleplay-travel" ||
    viewId === "roleplay-indoor" ||
    viewId === "roleplay-sports" ||
    viewId === "roleplay-home" ||
    viewId === "practice" ||
    viewId === "practice-quick"
  ) {
    return { width: "wide", footer: "app" };
  }

  // 6. Internal App / Account Utility pages
  if (viewId === "mypage" || viewId === "ai-settings") {
    return { width: "default", footer: "app" };
  }

  // 7. Public content pages (Guides, Magazine Index, Pricing, About, Home)
  return { width: "default", footer: "public" };
}
