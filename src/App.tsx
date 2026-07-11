import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AiSettingsView } from "./components/ai/AiSettingsView";
import { DifficultyGuide } from "./components/difficulty/DifficultyGuide";
import { ExamGuideDashboard } from "./components/guide/ExamGuideDashboard";
import { ExamGuideHub } from "./components/guide/ExamGuideHub";
import { ExamGuideOverview } from "./components/guide/ExamGuideOverview";
import { ExamGuideDay } from "./components/guide/ExamGuideDay";
import { ExamGuideFaq } from "./components/guide/ExamGuideFaq";
import { HomeView } from "./components/home/HomeView";
import { AppShell } from "./components/layout/AppShell";
import type { ViewId } from "./components/layout/Sidebar";
import { LegalPageView } from "./components/legal/LegalPageView";
import { PracticeView } from "./components/practice/PracticeView";
import { RoleplayHub } from "./components/roleplay/RoleplayHub";
import { RoleplayFormulaView } from "./components/roleplay/RoleplayFormulaView";
import { RoleplayViewV2 } from "./components/roleplay/RoleplayViewV2";
import { ScriptDashboardV2 } from "./components/script/ScriptDashboardV2";
import { ScriptHub } from "./components/script/ScriptHub";
import { BackgroundSurveySheet } from "./components/survey/BackgroundSurveySheet";
import { TrainingHub } from "./components/training/TrainingHub";
import { Toast } from "./components/ui/Toast";
import { MagazineList } from "./components/magazine/MagazineList";
import { MagazineDetail } from "./components/magazine/MagazineDetail";
import type { LlmSettings, ToastMessage } from "./types";

const SETTINGS_KEY = "oom-llm-settings";
const THEME_KEY = "oom-theme";
const defaultSettings: LlmSettings = { endpoint: "", apiKey: "", model: "", mode: "openai-compatible", authType: "bearer", customBodyTemplate: '{"model":{model},"messages":{messages},"temperature":0.4}' };
const scriptViewById: Record<string, ViewId> = {
  "outdoor-travel": "script-outdoor",
  "indoor-rest": "script-indoor",
  "sports-hobby": "script-sports",
  "home-residence": "script-home",
};
const nextViewById: Partial<Record<ViewId, { view: ViewId; label: string }>> = {
  home: { view: "training-hub", label: "실전 훈련" },
  survey: { view: "difficulty", label: "STEP 2" },
  difficulty: { view: "script-outdoor", label: "STEP 3" },
  "script-outdoor": { view: "roleplay-hub", label: "STEP 4" },
  "script-indoor": { view: "roleplay-hub", label: "STEP 4" },
  "script-sports": { view: "roleplay-hub", label: "STEP 4" },
  "script-home": { view: "roleplay-hub", label: "STEP 4" },
  roleplay: { view: "practice", label: "STEP 5" },
  practice: { view: "ai-settings", label: "AI 설정" },
};

function loadSettings(): LlmSettings {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaultSettings, ...(JSON.parse(stored) as Partial<LlmSettings>) } : defaultSettings;
  } catch { return defaultSettings; }
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState<LlmSettings>(loadSettings);
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem(THEME_KEY) === "dark" || (window.localStorage.getItem(THEME_KEY) === null && window.matchMedia("(prefers-color-scheme: dark)").matches));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Map paths to ViewId for app shell and navigation state
  const viewIdForPath = (path: string): ViewId => {
    const p = path.replace(/\/*$/, "");
    if (p === "" || p === "/") return "home";
    if (p === "/exam-guide") return "exam-guide";
    if (p === "/exam-guide/overview") return "exam-overview";
    if (p === "/exam-guide/apply") return "exam-apply";
    if (p === "/exam-guide/day") return "exam-day";
    if (p === "/exam-guide/results") return "exam-results";
    if (p === "/exam-guide/faq") return "exam-faq";
    if (p === "/training") return "training-hub";
    if (p === "/training/survey") return "survey";
    if (p === "/training/difficulty") return "difficulty";
    if (p === "/training/scripts") return "script-hub";
    if (p === "/training/scripts/outdoor") return "script-outdoor";
    if (p === "/training/scripts/indoor") return "script-indoor";
    if (p === "/training/scripts/sports") return "script-sports";
    if (p === "/training/scripts/home") return "script-home";
    if (p === "/roleplay" || p === "/roleplay/hub") return "roleplay-hub";
    if (p === "/roleplay/formula") return "roleplay-formula";
    if (p === "/roleplay/travel") return "roleplay-travel";
    if (p === "/roleplay/indoor") return "roleplay-indoor";
    if (p === "/roleplay/sports") return "roleplay-sports";
    if (p === "/roleplay/home") return "roleplay-home";
    if (p === "/practice") return "practice";
    if (p === "/ai-settings") return "ai-settings";
    if (p === "/magazine" || p.startsWith("/magazine/")) return "magazine-list";
    if (p === "/about") return "about";
    if (p === "/privacy") return "privacy";
    if (p === "/contact") return "contact";
    if (p === "/terms") return "terms";
    if (p === "/image-credits") return "image-credits";
    return "home";
  };

  const viewPathForId: Record<ViewId, string> = {
    home: "/",
    "exam-guide": "/exam-guide",
    "exam-overview": "/exam-guide/overview",
    "exam-apply": "/exam-guide/apply",
    "exam-day": "/exam-guide/day",
    "exam-results": "/exam-guide/results",
    "exam-faq": "/exam-guide/faq",
    "training-hub": "/training",
    survey: "/training/survey",
    difficulty: "/training/difficulty",
    "script-hub": "/training/scripts",
    "script-outdoor": "/training/scripts/outdoor",
    "script-indoor": "/training/scripts/indoor",
    "script-sports": "/training/scripts/sports",
    "script-home": "/training/scripts/home",
    roleplay: "/roleplay",
    "roleplay-hub": "/roleplay",
    "roleplay-formula": "/roleplay/formula",
    "roleplay-travel": "/roleplay/travel",
    "roleplay-indoor": "/roleplay/indoor",
    "roleplay-sports": "/roleplay/sports",
    "roleplay-home": "/roleplay/home",
    practice: "/practice",
    "ai-settings": "/ai-settings",
    "magazine-list": "/magazine",
    about: "/about",
    privacy: "/privacy",
    contact: "/contact",
    terms: "/terms",
    "image-credits": "/image-credits",
  };

  const activeView = viewIdForPath(location.pathname);

  useEffect(() => { document.documentElement.classList.toggle("dark", darkMode); window.localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light"); }, [darkMode]);
  useEffect(() => { window.scrollTo(0, 0); document.querySelector("main")?.scrollTo?.(0, 0); }, [location.pathname]);
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(null), 4400); return () => window.clearTimeout(timeout); }, [toast]);
  const showToast = (title: string, description?: string, tone: ToastMessage["tone"] = "info") => setToast({ id: Date.now(), title, description, tone });
  const saveSettings = () => { window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); showToast("AI 설정을 브라우저에 저장했습니다.", "공유 PC에서는 사용 후 설정을 지워 주세요.", "success"); };
  const onNavigate = (view: ViewId) => navigate(viewPathForId[view]);

  const screen = (
    <Routes>
      <Route path="/" element={<HomeView onNavigate={onNavigate} />} />
      <Route path="/exam-guide" element={<ExamGuideHub onNavigate={onNavigate} />} />
      <Route path="/exam-guide/overview" element={<ExamGuideOverview onSectionChange={(v) => navigate(viewPathForId[v])} />} />
      <Route path="/exam-guide/day" element={<ExamGuideDay onSectionChange={(v) => navigate(viewPathForId[v])} />} />
      <Route path="/exam-guide/apply" element={<ExamGuideDashboard initialSection={"exam-apply"} onNavigate={onNavigate} onSectionChange={(v) => navigate(viewPathForId[v])} />} />
      <Route path="/exam-guide/results" element={<ExamGuideDashboard initialSection={"exam-results"} onNavigate={onNavigate} onSectionChange={(v) => navigate(viewPathForId[v])} />} />
      <Route path="/exam-guide/faq" element={<ExamGuideFaq onSectionChange={(v) => navigate(viewPathForId[v])} />} />

      <Route path="/training" element={<TrainingHub onNavigate={onNavigate} />} />
      <Route path="/training/survey" element={<BackgroundSurveySheet />} />
      <Route path="/training/difficulty" element={<DifficultyGuide />} />
      <Route path="/training/scripts" element={<ScriptHub onNavigate={onNavigate} />} />
      <Route path="/training/scripts/outdoor" element={<ScriptDashboardV2 initialScriptId={"outdoor-travel"} key={"outdoor-travel"} onScriptChange={(nextScriptId) => navigate(viewPathForId[scriptViewById[nextScriptId]])} onToast={showToast} settings={settings} />} />
      <Route path="/training/scripts/indoor" element={<ScriptDashboardV2 initialScriptId={"indoor-rest"} key={"indoor-rest"} onScriptChange={(nextScriptId) => navigate(viewPathForId[scriptViewById[nextScriptId]])} onToast={showToast} settings={settings} />} />
      <Route path="/training/scripts/sports" element={<ScriptDashboardV2 initialScriptId={"sports-hobby"} key={"sports-hobby"} onScriptChange={(nextScriptId) => navigate(viewPathForId[scriptViewById[nextScriptId]])} onToast={showToast} settings={settings} />} />
      <Route path="/training/scripts/home" element={<ScriptDashboardV2 initialScriptId={"home-residence"} key={"home-residence"} onScriptChange={(nextScriptId) => navigate(viewPathForId[scriptViewById[nextScriptId]])} onToast={showToast} settings={settings} />} />

      <Route path="/roleplay" element={<RoleplayHub onNavigate={onNavigate} />} />
      <Route path="/roleplay/formula" element={<RoleplayFormulaView onNavigate={onNavigate} />} />
      <Route path="/roleplay/travel" element={<RoleplayViewV2 initialGroup={"야외 / 여행"} key={"roleplay-travel"} onToast={showToast} settings={settings} />} />
      <Route path="/roleplay/indoor" element={<RoleplayViewV2 initialGroup={"실내 / 휴식"} key={"roleplay-indoor"} onToast={showToast} settings={settings} />} />
      <Route path="/roleplay/sports" element={<RoleplayViewV2 initialGroup={"운동 / 취미"} key={"roleplay-sports"} onToast={showToast} settings={settings} />} />
      <Route path="/roleplay/home" element={<RoleplayViewV2 initialGroup={"집 / 거주지"} key={"roleplay-home"} onToast={showToast} settings={settings} />} />

      <Route path="/practice" element={<PracticeView onToast={showToast} settings={settings} />} />
      <Route path="/ai-settings" element={<AiSettingsView onChange={setSettings} onSave={saveSettings} settings={settings} />} />
      <Route path="/magazine" element={<MagazineList />} />
      <Route path="/magazine/:id" element={<MagazineDetail />} />
      <Route path="/about" element={<LegalPageView pageId="about" />} />
      <Route path="/privacy" element={<LegalPageView pageId="privacy" />} />
      <Route path="/contact" element={<LegalPageView pageId="contact" />} />
      <Route path="/terms" element={<LegalPageView pageId="terms" />} />
      <Route path="/image-credits" element={<LegalPageView pageId="image-credits" />} />
    </Routes>
  );
  const isStepView = ["training-hub", "survey", "difficulty", "script-hub", "script-outdoor", "script-indoor", "script-sports", "script-home", "roleplay", "roleplay-hub", "roleplay-formula", "roleplay-travel", "roleplay-indoor", "roleplay-sports", "roleplay-home", "practice"].includes(activeView);
  const nextStep = nextViewById[activeView];
  return <AppShell activeView={activeView} darkMode={darkMode} mobileOpen={mobileOpen} nextStep={nextStep ? { label: nextStep.label, onClick: () => navigate(viewPathForId[nextStep.view]) } : undefined} onCloseMobileMenu={() => setMobileOpen(false)} onNavigate={onNavigate} onToggleDarkMode={() => setDarkMode((value) => !value)} onToggleMobileMenu={() => setMobileOpen((value) => !value)} showTrainingHeader={isStepView}><AnimatePresence mode="wait"><motion.div animate={{ opacity: 1, y: 0 }} className={isStepView ? "step-page" : undefined} exit={{ opacity: 0, y: -6 }} initial={{ opacity: 0, y: 8 }} key={location.pathname} transition={{ duration: 0.2 }}>{screen}</motion.div></AnimatePresence><Toast onDismiss={() => setToast(null)} toast={toast} /></AppShell>;
}
