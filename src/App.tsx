import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Toast } from "./components/ui/Toast";
import type { ViewId } from "./components/layout/Sidebar";
import { viewIdForPath, viewPathForId } from "./lib/routes";
import { HomeView } from "./components/home/HomeView";
import { ExamGuideHub } from "./components/guide/ExamGuideHub";
import { ExamGuideOverview } from "./components/guide/ExamGuideOverview";
import { ExamGuideDay } from "./components/guide/ExamGuideDay";
import { ExamGuideDashboard } from "./components/guide/ExamGuideDashboard";
import { ExamGuideFaq } from "./components/guide/ExamGuideFaq";
import { BackgroundSurveySheet } from "./components/survey/BackgroundSurveySheet";
import { DifficultyGuide } from "./components/difficulty/DifficultyGuide";
import { ScriptHub } from "./components/script/ScriptHub";
import { ScriptDashboardV2 } from "./components/script/ScriptDashboardV2";
import { RoleplayHub } from "./components/roleplay/RoleplayHub";
import { RoleplayViewV2 } from "./components/roleplay/RoleplayViewV2";
import { PracticeView } from "./components/practice/PracticeView";
import { AiSettingsView } from "./components/ai/AiSettingsView";
import { MagazineList } from "./components/magazine/MagazineList";
import { MagazineDetail } from "./components/magazine/MagazineDetail";
import { LegalPageView } from "./components/legal/LegalPageView";
import { TrainingHub } from "./components/training/TrainingHub";
import { TrainingSetupView } from "./components/training/TrainingSetupView";
import { TrainingSelectionProvider, useTrainingSelection } from "./training/TrainingSelectionContext";
import { discoveredCourses } from "./training/courseRegistry";
import { TRAINING_LEVELS } from "./training/levels";
import type { LlmSettings, ToastMessage } from "./types";

const SETTINGS_KEY = "oom-llm-settings";
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
  const [darkMode, setDarkMode] = useState(
    () =>
      window.localStorage.getItem(THEME_KEY) === "dark" ||
      (window.localStorage.getItem(THEME_KEY) === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const activeView = viewIdForPath(location.pathname);
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
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const showToast = (title: string, description?: string, tone: ToastMessage["tone"] = "info") =>
    setToast({ id: Date.now(), title, description, tone });

  const saveSettings = () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    showToast(
      "AI 설정을 브라우저에 저장했습니다.",
      "공유 PC에서는 사용 후 설정을 지워 주세요.",
      "success"
    );
  };

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
      <Route path="/" element={<HomeView />} />
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
        element={<PracticeView onNavigate={onNavigate} onToast={showToast} settings={settings} />}
      />
      <Route
        path="/practice/"
        element={<PracticeView onNavigate={onNavigate} onToast={showToast} settings={settings} />}
      />
      <Route
        path="/ai-settings"
        element={<AiSettingsView onChange={setSettings} onSave={saveSettings} settings={settings} />}
      />
      <Route
        path="/ai-settings/"
        element={<AiSettingsView onChange={setSettings} onSave={saveSettings} settings={settings} />}
      />
      <Route path="/magazine" element={<MagazineList />} />
      <Route path="/magazine/" element={<MagazineList />} />
      <Route path="/magazine/:id" element={<MagazineDetail />} />
      <Route path="/magazine/:id/" element={<MagazineDetail />} />
      <Route path="/about" element={<LegalPageView pageId="about" />} />
      <Route path="/about/" element={<LegalPageView pageId="about" />} />
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
            {screen}
          </motion.div>
        </AnimatePresence>
        <Toast onDismiss={() => setToast(null)} toast={toast} />
      </AppShell>
    </TrainingSelectionProvider>
  );
}
