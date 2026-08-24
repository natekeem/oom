import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { SIDEBAR_EXPANDED_STORAGE_KEY } from "./components/layout/ExpandableSidebar";
import { Toast } from "./components/ui/Toast";
import type { ViewId } from "./components/layout/Sidebar";
import { viewIdForPath, viewPathForId } from "./lib/routes";
import { TrainingSelectionProvider, useTrainingSelection } from "./training/TrainingSelectionContext";
import { discoveredCourses } from "./training/courseRegistry";
import { TRAINING_LEVELS } from "./training/levels";
import type { LlmSettings, SttSettings, ToastMessage } from "./types";

const ExamGuideHub = lazy(() => import("./components/guide/ExamGuideHub").then((module) => ({ default: module.ExamGuideHub })));
const LandingPage = lazy(() => import("./landing/LandingPage").then((module) => ({ default: module.LandingPage })));
const BackgroundSurveySheet = lazy(() => import("./components/survey/BackgroundSurveySheet").then((module) => ({ default: module.BackgroundSurveySheet })));
const DifficultyGuide = lazy(() => import("./components/difficulty/DifficultyGuide").then((module) => ({ default: module.DifficultyGuide })));
const TrainingHub = lazy(() => import("./components/training/TrainingHub").then((module) => ({ default: module.TrainingHub })));
const TrainingSetupView = lazy(() => import("./components/training/TrainingSetupView").then((module) => ({ default: module.TrainingSetupView })));
const ExamGuideOverview = lazy(() => import("./components/guide/ExamGuideOverview").then((module) => ({ default: module.ExamGuideOverview })));
const ExamGuideScreen = lazy(() => import("./components/guide/ExamGuideScreen").then((module) => ({ default: module.ExamGuideScreen })));
const ExamGuideDay = lazy(() => import("./components/guide/ExamGuideDay").then((module) => ({ default: module.ExamGuideDay })));
const ExamGuideDashboard = lazy(() => import("./components/guide/ExamGuideDashboard").then((module) => ({ default: module.ExamGuideDashboard })));
const ExamGuideFaq = lazy(() => import("./components/guide/ExamGuideFaq").then((module) => ({ default: module.ExamGuideFaq })));
const ScriptHub = lazy(() => import("./components/script/ScriptHub").then((module) => ({ default: module.ScriptHub })));
const ScriptDashboardV2 = lazy(() => import("./components/script/ScriptDashboardV2").then((module) => ({ default: module.ScriptDashboardV2 })));
const RoleplayHub = lazy(() => import("./components/roleplay/RoleplayHub").then((module) => ({ default: module.RoleplayHub })));
const RoleplayViewV2 = lazy(() => import("./components/roleplay/RoleplayViewV2").then((module) => ({ default: module.RoleplayViewV2 })));
const PracticeView = lazy(() => import("./components/practice/PracticeView").then((module) => ({ default: module.PracticeView })));
const AiSettingsView = lazy(() => import("./components/ai/AiSettingsView").then((module) => ({ default: module.AiSettingsView })));
const MagazineList = lazy(() => import("./components/magazine/MagazineList").then((module) => ({ default: module.MagazineList })));
const MagazineDetail = lazy(() => import("./components/magazine/MagazineDetail").then((module) => ({ default: module.MagazineDetail })));
const HomeView = lazy(() => import("./components/home/HomeView").then((module) => ({ default: module.HomeView })));
const LegalPageView = lazy(() => import("./components/legal/LegalPageView").then((module) => ({ default: module.LegalPageView })));

const SETTINGS_KEY = "oom-llm-settings";
const STT_SETTINGS_KEY = "oom-stt-settings";
const THEME_KEY = "oom-theme";
const ADSENSE_SCRIPT_ID = "oom-adsense-script";
const ADSENSE_CLIENT = "ca-pub-8734087248170812";
const defaultSettings: LlmSettings = {
  endpoint: "",
  apiKey: "",
  model: "",
  mode: "openai-compatible",
  authType: "bearer",
  customBodyTemplate: '{"model":{model},"messages":{messages},"temperature":0.4}',
};

const defaultSttSettings: SttSettings = {
  endpoint: "",
  apiKey: "",
  model: "",
  authType: "bearer",
  autoTranscribe: true,
};

const scriptSlotViewIds: ViewId[] = [
  "script-outdoor",
  "script-indoor",
  "script-sports",
  "script-home",
];

const roleplaySlotViewIds: ViewId[] = [
  "roleplay-travel",
  "roleplay-indoor",
  "roleplay-sports",
  "roleplay-home",
];

const nextViewById: Partial<Record<ViewId, { view: ViewId; label: string }>> = {
  home: { view: "training-hub", label: "훈련 허브" },
  "training-setup": { view: "survey", label: "STEP 2" },
  survey: { view: "difficulty", label: "STEP 3" },
  difficulty: { view: "script-outdoor", label: "STEP 4" },
  "script-outdoor": { view: "roleplay-hub", label: "STEP 5" },
  "script-indoor": { view: "roleplay-hub", label: "STEP 5" },
  "script-sports": { view: "roleplay-hub", label: "STEP 5" },
  "script-home": { view: "roleplay-hub", label: "STEP 5" },
  roleplay: { view: "practice", label: "STEP 6" },
  "roleplay-hub": { view: "practice", label: "STEP 6" },
  "roleplay-formula": { view: "practice", label: "STEP 6" },
  "roleplay-travel": { view: "practice", label: "STEP 6" },
  "roleplay-indoor": { view: "practice", label: "STEP 6" },
  "roleplay-sports": { view: "practice", label: "STEP 6" },
  "roleplay-home": { view: "practice", label: "STEP 6" },
  practice: { view: "ai-settings", label: "AI 설정" },
};

function loadSettings(): LlmSettings {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaultSettings, ...(JSON.parse(stored) as Partial<LlmSettings>) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function loadSttSettings(): SttSettings {
  try {
    const stored = window.localStorage.getItem(STT_SETTINGS_KEY);
    return stored ? { ...defaultSttSettings, ...(JSON.parse(stored) as Partial<SttSettings>) } : defaultSttSettings;
  } catch {
    return defaultSttSettings;
  }
}

function TrainingSetupRoute({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const { selection, select, clear } = useTrainingSelection();
  return (
    <TrainingSetupView
      courses={discoveredCourses}
      currentSelection={selection}
      levels={TRAINING_LEVELS}
      onConfirm={select}
      onContinueToNextStep={() => onNavigate("survey")}
      onReset={clear}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState<LlmSettings>(loadSettings);
  const [sttSettings, setSttSettings] = useState<SttSettings>(loadSttSettings);
  const [darkMode, setDarkMode] = useState(
    () =>
      window.localStorage.getItem(THEME_KEY) === "dark" ||
      (window.localStorage.getItem(THEME_KEY) === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const activeView = viewIdForPath(location.pathname);
  const isLanding = location.pathname === "/";
  const isMagazineDetail = /^\/magazine\/[^/]+\/?$/.test(location.pathname);
  const adExcluded =
    ["practice", "ai-settings", "about", "privacy", "contact", "terms", "editorial-policy", "image-credits"].includes(
      activeView
    ) || (activeView === "magazine-list" && !isMagazineDetail);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const existing = document.getElementById(ADSENSE_SCRIPT_ID);
    if (adExcluded) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
    return () => script.remove();
  }, [adExcluded]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector("main")?.scrollTo?.(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (isLanding) {
      window.sessionStorage.removeItem(SIDEBAR_EXPANDED_STORAGE_KEY);
    }
  }, [isLanding]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const showToast = (title: string, description?: string, tone: ToastMessage["tone"] = "info") =>
    setToast({ id: Date.now(), title, description, tone });

  const saveSettings = () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.localStorage.setItem(STT_SETTINGS_KEY, JSON.stringify(sttSettings));
    showToast(
      "AI 및 STT 설정을 브라우저에 저장했습니다.",
      "공유 PC에서는 사용 후 설정을 지워 주세요.",
      "success"
    );
  };

  if (isLanding) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#07090d]" aria-label="랜딩 페이지를 불러오는 중" />}>
        <LandingPage />
      </Suspense>
    );
  }

  const onNavigate = (view: ViewId) => navigate(viewPathForId[view]);

  const renderScriptSlot = (slotIndex: 0 | 1 | 2 | 3) => (
    <ScriptDashboardV2
      key={`script-slot-${slotIndex}`}
      onNavigate={onNavigate}
      onSlotChange={(slot) => onNavigate(scriptSlotViewIds[slot] ?? "script-outdoor")}
      onToast={showToast}
      settings={settings}
      slotIndex={slotIndex}
    />
  );

  const renderRoleplaySlot = (slotIndex: 0 | 1 | 2 | 3) => (
    <RoleplayViewV2
      key={`rp-slot-${slotIndex}`}
      onNavigate={onNavigate}
      onSlotChange={(slot) => onNavigate(roleplaySlotViewIds[slot] ?? "roleplay-travel")}
      onToast={showToast}
      settings={settings}
      slotIndex={slotIndex}
    />
  );

  const screen = (
    <Routes>
      <Route path="/exam-guide" element={<ExamGuideHub onNavigate={onNavigate} />} />
      <Route path="/exam-guide/" element={<ExamGuideHub onNavigate={onNavigate} />} />
      <Route
        path="/exam-guide/overview"
        element={<ExamGuideOverview onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />
      <Route
        path="/exam-guide/overview/"
        element={<ExamGuideOverview onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />
      <Route
        path="/exam-guide/screen"
        element={<ExamGuideScreen onNavigate={onNavigate} onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />
      <Route
        path="/exam-guide/screen/"
        element={<ExamGuideScreen onNavigate={onNavigate} onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />
      <Route
        path="/exam-guide/day"
        element={<ExamGuideDay onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />
      <Route
        path="/exam-guide/day/"
        element={<ExamGuideDay onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />
      <Route
        path="/exam-guide/apply"
        element={
          <ExamGuideDashboard
            initialSection={"exam-apply"}
            onNavigate={onNavigate}
            onSectionChange={(v) => navigate(viewPathForId[v])}
          />
        }
      />
      <Route
        path="/exam-guide/apply/"
        element={
          <ExamGuideDashboard
            initialSection={"exam-apply"}
            onNavigate={onNavigate}
            onSectionChange={(v) => navigate(viewPathForId[v])}
          />
        }
      />
      <Route
        path="/exam-guide/results"
        element={
          <ExamGuideDashboard
            initialSection={"exam-results"}
            onNavigate={onNavigate}
            onSectionChange={(v) => navigate(viewPathForId[v])}
          />
        }
      />
      <Route
        path="/exam-guide/results/"
        element={
          <ExamGuideDashboard
            initialSection={"exam-results"}
            onNavigate={onNavigate}
            onSectionChange={(v) => navigate(viewPathForId[v])}
          />
        }
      />
      <Route
        path="/exam-guide/faq"
        element={<ExamGuideFaq onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />
      <Route
        path="/exam-guide/faq/"
        element={<ExamGuideFaq onSectionChange={(v) => navigate(viewPathForId[v])} />}
      />

      <Route path="/training" element={<TrainingHub onNavigate={onNavigate} />} />
      <Route path="/training/" element={<TrainingHub onNavigate={onNavigate} />} />
      <Route path="/training/setup" element={<TrainingSetupRoute onNavigate={onNavigate} />} />
      <Route path="/training/setup/" element={<TrainingSetupRoute onNavigate={onNavigate} />} />
      <Route path="/training/survey" element={<BackgroundSurveySheet onNavigate={onNavigate} />} />
      <Route path="/training/survey/" element={<BackgroundSurveySheet onNavigate={onNavigate} />} />
      <Route path="/training/difficulty" element={<DifficultyGuide onNavigate={onNavigate} />} />
      <Route path="/training/difficulty/" element={<DifficultyGuide onNavigate={onNavigate} />} />
      <Route path="/training/scripts" element={<ScriptHub onNavigate={onNavigate} />} />
      <Route path="/training/scripts/" element={<ScriptHub onNavigate={onNavigate} />} />
      <Route path="/training/scripts/outdoor" element={renderScriptSlot(0)} />
      <Route path="/training/scripts/outdoor/" element={renderScriptSlot(0)} />
      <Route path="/training/scripts/indoor" element={renderScriptSlot(1)} />
      <Route path="/training/scripts/indoor/" element={renderScriptSlot(1)} />
      <Route path="/training/scripts/sports" element={renderScriptSlot(2)} />
      <Route path="/training/scripts/sports/" element={renderScriptSlot(2)} />
      <Route path="/training/scripts/home" element={renderScriptSlot(3)} />
      <Route path="/training/scripts/home/" element={renderScriptSlot(3)} />

      <Route path="/roleplay" element={<RoleplayHub onNavigate={onNavigate} />} />
      <Route path="/roleplay/" element={<RoleplayHub onNavigate={onNavigate} />} />
      <Route path="/roleplay/formula" element={<RoleplayHub onNavigate={onNavigate} />} />
      <Route path="/roleplay/formula/" element={<RoleplayHub onNavigate={onNavigate} />} />
      <Route path="/roleplay/travel" element={renderRoleplaySlot(0)} />
      <Route path="/roleplay/travel/" element={renderRoleplaySlot(0)} />
      <Route path="/roleplay/indoor" element={renderRoleplaySlot(1)} />
      <Route path="/roleplay/indoor/" element={renderRoleplaySlot(1)} />
      <Route path="/roleplay/sports" element={renderRoleplaySlot(2)} />
      <Route path="/roleplay/sports/" element={renderRoleplaySlot(2)} />
      <Route path="/roleplay/home" element={renderRoleplaySlot(3)} />
      <Route path="/roleplay/home/" element={renderRoleplaySlot(3)} />

      <Route
        path="/practice"
        element={
          <PracticeView
            onNavigate={onNavigate}
            onToast={showToast}
            settings={settings}
            sttSettings={sttSettings}
          />
        }
      />
      <Route
        path="/practice/"
        element={
          <PracticeView
            onNavigate={onNavigate}
            onToast={showToast}
            settings={settings}
            sttSettings={sttSettings}
          />
        }
      />
      <Route
        path="/ai-settings"
        element={
          <AiSettingsView
            onChange={setSettings}
            onSave={saveSettings}
            onSttChange={setSttSettings}
            settings={settings}
            sttSettings={sttSettings}
          />
        }
      />
      <Route
        path="/ai-settings/"
        element={
          <AiSettingsView
            onChange={setSettings}
            onSave={saveSettings}
            onSttChange={setSttSettings}
            settings={settings}
            sttSettings={sttSettings}
          />
        }
      />
      <Route path="/magazine" element={<MagazineList />} />
      <Route path="/magazine/" element={<MagazineList />} />
      <Route path="/magazine/:id" element={<MagazineDetail />} />
      <Route path="/magazine/:id/" element={<MagazineDetail />} />
      <Route path="/about" element={<HomeView />} />
      <Route path="/about/" element={<HomeView />} />
      <Route path="/privacy" element={<LegalPageView pageId="privacy" />} />
      <Route path="/privacy/" element={<LegalPageView pageId="privacy" />} />
      <Route path="/contact" element={<LegalPageView pageId="contact" />} />
      <Route path="/contact/" element={<LegalPageView pageId="contact" />} />
      <Route path="/terms" element={<LegalPageView pageId="terms" />} />
      <Route path="/terms/" element={<LegalPageView pageId="terms" />} />
      <Route path="/editorial-policy" element={<LegalPageView pageId="editorial-policy" />} />
      <Route path="/editorial-policy/" element={<LegalPageView pageId="editorial-policy" />} />
      <Route path="/image-credits" element={<LegalPageView pageId="image-credits" />} />
      <Route path="/image-credits/" element={<LegalPageView pageId="image-credits" />} />
    </Routes>
  );

  const isStepView = [
    "training-hub",
    "training-setup",
    "survey",
    "difficulty",
    "script-hub",
    "script-outdoor",
    "script-indoor",
    "script-sports",
    "script-home",
    "roleplay",
    "roleplay-hub",
    "roleplay-formula",
    "roleplay-travel",
    "roleplay-indoor",
    "roleplay-sports",
    "roleplay-home",
    "practice",
  ].includes(activeView);

  const nextStep = nextViewById[activeView];

  return (
    <TrainingSelectionProvider>
      <AppShell
        activeView={activeView}
        darkMode={darkMode}
        mobileOpen={mobileOpen}
        nextStep={
          nextStep
            ? {
                label: nextStep.label,
                onClick: () => navigate(viewPathForId[nextStep.view]),
              }
            : undefined
        }
        onCloseMobileMenu={() => setMobileOpen(false)}
        onNavigate={onNavigate}
        onToggleDarkMode={() => setDarkMode((value) => !value)}
        onToggleMobileMenu={() => setMobileOpen((value) => !value)}
        showTrainingHeader={isStepView}
      >
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={isStepView ? "step-page" : undefined}
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 8 }}
            key={location.pathname}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<div className="py-12 text-center text-sm text-zinc-500">화면을 불러오는 중...</div>}>
              {screen}
            </Suspense>
          </motion.div>
        </AnimatePresence>
        <Toast onDismiss={() => setToast(null)} toast={toast} />
      </AppShell>
    </TrainingSelectionProvider>
  );
}
