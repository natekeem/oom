import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRight, Menu, Moon, Sun } from "lucide-react";
import { Button } from "../ui/Button";
import { type ViewId, getViewTitle } from "./Sidebar";
import { ExpandableSidebar } from "./ExpandableSidebar";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";

type AppShellProps = {
  activeView: ViewId;
  children: ReactNode;
  darkMode: boolean;
  mobileOpen: boolean;
  nextStep?: { label: string; onClick: () => void };
  onNavigate: (view: ViewId) => void;
  onToggleDarkMode: () => void;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  showTrainingHeader: boolean;
};

const progressMap: Partial<Record<ViewId, number>> = {
  "training-setup": 0,
  survey: 20,
  difficulty: 40,
  "script-hub": 60,
  "script-self-introduction": 60,
  "script-outdoor": 60,
  "script-indoor": 60,
  "script-sports": 60,
  "script-home": 60,
  "roleplay-hub": 80,
  "roleplay-formula": 80,
  "roleplay-travel": 80,
  "roleplay-indoor": 80,
  "roleplay-sports": 80,
  "roleplay-home": 80,
  practice: 100,
};

const mobileTrainingLabels: Partial<Record<ViewId, string>> = {
  "training-hub": "실전 훈련 · 6 STEP",
  "training-setup": "STEP 1 · 목표 설정",
  survey: "STEP 2 · 추천 서베이",
  difficulty: "STEP 3 · 난이도",
  "script-hub": "STEP 4 · 스크립트",
  "script-self-introduction": "STEP 4 · 자기소개",
  "script-outdoor": "STEP 4 · 스크립트",
  "script-indoor": "STEP 4 · 스크립트",
  "script-sports": "STEP 4 · 스크립트",
  "script-home": "STEP 4 · 스크립트",
  "roleplay-hub": "STEP 5 · 롤플레이",
  "roleplay-formula": "STEP 5 · 롤플레이",
  "roleplay-travel": "STEP 5 · 시나리오",
  "roleplay-indoor": "STEP 5 · 시나리오",
  "roleplay-sports": "STEP 5 · 시나리오",
  "roleplay-home": "STEP 5 · 시나리오",
  practice: "STEP 6 · 실전 연습",
};

export function AppShell({
  activeView,
  children,
  darkMode,
  mobileOpen,
  nextStep,
  onNavigate,
  onToggleDarkMode,
  onToggleMobileMenu,
  onCloseMobileMenu,
  showTrainingHeader,
}: AppShellProps) {
  const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const wasMobileOpenRef = useRef(false);
  const { selection } = useTrainingSelection();
  const resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;

  const isOverview = activeView === "training-hub";
  const progress = progressMap[activeView];
  const themeLabel = darkMode ? "라이트 모드로 전환" : "다크 모드로 전환";

  useEffect(() => {
    const main = mainRef.current;
    if (main) {
      main.inert = mobileOpen;
      if (mobileOpen) main.setAttribute("aria-hidden", "true");
      else main.removeAttribute("aria-hidden");
    }
    if (!mobileOpen && wasMobileOpenRef.current) {
      mobileMenuTriggerRef.current?.focus();
    }
    wasMobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  const mobileControls = (
    <div className="fixed right-4 top-4 z-30 flex gap-2 lg:hidden">
      <Button
        aria-controls="oom-mobile-navigation"
        aria-expanded={mobileOpen}
        aria-label="메뉴 열기"
        className="h-11 w-11 bg-zinc-100/90 shadow-sm backdrop-blur dark:bg-zinc-900/90"
        onClick={onToggleMobileMenu}
        ref={mobileMenuTriggerRef}
        size="icon"
        variant="secondary"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        aria-label={themeLabel}
        className="h-11 w-11 bg-zinc-100/90 shadow-sm backdrop-blur dark:bg-zinc-900/90"
        onClick={onToggleDarkMode}
        size="icon"
        variant="secondary"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 lg:flex lg:h-screen lg:overflow-hidden">
      <ExpandableSidebar
        activeView={activeView}
        darkMode={darkMode}
        mobileOpen={mobileOpen}
        onClose={onCloseMobileMenu}
        onNavigate={onNavigate}
        onToggleDarkMode={onToggleDarkMode}
      />
      <main
        className="oom-main-scroll flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen lg:min-h-0 lg:overflow-y-auto"
        ref={mainRef}
      >
        {showTrainingHeader ? (
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-100/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6 lg:px-9">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <Button
                aria-controls="oom-mobile-navigation"
                aria-expanded={mobileOpen}
                aria-label="메뉴 열기"
                className="h-11 w-11 lg:hidden"
                onClick={onToggleMobileMenu}
                ref={mobileMenuTriggerRef}
                size="icon"
                variant="ghost"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  <span className="sm:hidden">{mobileTrainingLabels[activeView] ?? getViewTitle(activeView, resolved)}</span>
                  <span className="hidden sm:inline">{getViewTitle(activeView, resolved)}</span>
                </p>
                {!isOverview && typeof progress === "number" ? (
                  <div className="mt-2 h-1 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded bg-indigo-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ) : null}
              </div>
              {!isOverview && typeof progress === "number" ? (
                <span className="hidden text-xs font-medium text-zinc-500 lg:block">
                  훈련 진행 {progress}%
                </span>
              ) : isOverview ? (
                <span className="hidden text-xs font-medium text-indigo-600 dark:text-indigo-400 lg:block">
                  6 STEP 로드맵
                </span>
              ) : null}
              {nextStep ? (
                <>
                  <Button
                    aria-label={`다음 단계: ${nextStep.label}`}
                    className="h-11 px-3 sm:hidden"
                    onClick={nextStep.onClick}
                    size="sm"
                    variant="secondary"
                  >
                    <span>{nextStep.label.match(/STEP\s*\d+/i)?.[0] ?? "다음"}</span><ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label={`다음 단계: ${nextStep.label}`}
                    className="hidden sm:inline-flex"
                    onClick={nextStep.onClick}
                    size="sm"
                    variant="secondary"
                  >
                    <span className="hidden lg:inline">다음:</span>
                    {nextStep.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : null}
              <Button
                aria-label={themeLabel}
                onClick={onToggleDarkMode}
                size="icon"
                variant="ghost"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>
        ) : (
          mobileControls
        )}
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
          {children}
        </div>
        <footer className="border-t border-zinc-200 bg-zinc-50 px-4 py-5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 sm:px-6 lg:px-9">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 오픽온미</p>
            <nav aria-label="서비스 정보" className="flex flex-wrap gap-x-4 gap-y-2">
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/"
              >
                홈
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/exam-guide/"
              >
                수험 가이드
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/training/"
              >
                실전 훈련
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/magazine/"
              >
                매거진
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/about/"
              >
                소개
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/privacy/"
              >
                개인정보처리방침
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/terms/"
              >
                이용약관
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/editorial-policy/"
              >
                편집 원칙
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/image-credits/"
              >
                이미지 출처
              </a>
              <a
                className="rounded-sm hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-white"
                href="/contact/"
              >
                문의
              </a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
