import type { ViewId } from "../components/layout/Sidebar";

export const viewPathForId: Record<ViewId, string> = {
  home: "/",
  "exam-guide": "/exam-guide/",
  "exam-overview": "/exam-guide/overview/",
  "exam-screen": "/exam-guide/screen/",
  "exam-apply": "/exam-guide/apply/",
  "exam-day": "/exam-guide/day/",
  "exam-results": "/exam-guide/results/",
  "exam-faq": "/exam-guide/faq/",
  "training-hub": "/training/",
  "training-setup": "/training/setup/",
  survey: "/training/survey/",
  difficulty: "/training/difficulty/",
  "script-hub": "/training/scripts/",
  "script-self-introduction": "/training/scripts/self-introduction/",
  "script-outdoor": "/training/scripts/outdoor/",
  "script-indoor": "/training/scripts/indoor/",
  "script-sports": "/training/scripts/sports/",
  "script-home": "/training/scripts/home/",
  "roleplay-hub": "/roleplay/",
  "roleplay-formula": "/roleplay/formula/",
  "roleplay-travel": "/roleplay/travel/",
  "roleplay-indoor": "/roleplay/indoor/",
  "roleplay-sports": "/roleplay/sports/",
  "roleplay-home": "/roleplay/home/",
  practice: "/practice/",
  "practice-quick": "/practice/quick/",
  "practice-mock": "/practice/mock/",
  "ai-settings": "/ai-settings/",
  "magazine-list": "/magazine/",
  about: "/about/",
  privacy: "/privacy/",
  contact: "/contact/",
  terms: "/terms/",
  "editorial-policy": "/editorial-policy/",
  "image-credits": "/image-credits/",
};

export function viewIdForPath(path: string): ViewId {
  const normalized = path.replace(/\/*$/, "");
  if (normalized === "" || normalized === "/") return "home";
  if (normalized === "/exam-guide") return "exam-guide";
  if (normalized === "/exam-guide/overview") return "exam-overview";
  if (normalized === "/exam-guide/screen") return "exam-screen";
  if (normalized === "/exam-guide/apply") return "exam-apply";
  if (normalized === "/exam-guide/day") return "exam-day";
  if (normalized === "/exam-guide/results") return "exam-results";
  if (normalized === "/exam-guide/faq") return "exam-faq";
  if (normalized === "/training/setup") return "training-setup";
  if (normalized === "/training") return "training-hub";
  if (normalized === "/training/survey") return "survey";
  if (normalized === "/training/difficulty") return "difficulty";
  if (normalized === "/training/scripts") return "script-hub";
  if (normalized === "/training/scripts/self-introduction") return "script-self-introduction";
  if (normalized === "/training/scripts/outdoor") return "script-outdoor";
  if (normalized === "/training/scripts/indoor") return "script-indoor";
  if (normalized === "/training/scripts/sports") return "script-sports";
  if (normalized === "/training/scripts/home") return "script-home";
  if (normalized === "/roleplay" || normalized === "/roleplay/hub") return "roleplay-hub";
  if (normalized === "/roleplay/formula") return "roleplay-formula";
  if (normalized === "/roleplay/travel") return "roleplay-travel";
  if (normalized === "/roleplay/indoor") return "roleplay-indoor";
  if (normalized === "/roleplay/sports") return "roleplay-sports";
  if (normalized === "/roleplay/home") return "roleplay-home";
  if (normalized === "/practice/quick") return "practice-quick";
  if (normalized === "/practice/mock") return "practice-mock";
  if (normalized === "/practice") return "practice";
  if (normalized === "/ai-settings") return "ai-settings";
  if (normalized === "/magazine" || normalized.startsWith("/magazine/")) return "magazine-list";
  if (normalized === "/about") return "about";
  if (normalized === "/privacy") return "privacy";
  if (normalized === "/contact") return "contact";
  if (normalized === "/terms") return "terms";
  if (normalized === "/editorial-policy") return "editorial-policy";
  if (normalized === "/image-credits") return "image-credits";
  return "home";
}
