import type { ReactNode } from "react";
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
  "script-outdoor": 60,
  "script-indoor": 60,
  "script-sports": 60,
  "script-home": 60,
  roleplay: 80,
  "roleplay-hub": 80,
  "roleplay-formula": 80,
  "roleplay-travel": 80,
  "roleplay-indoor": 80,
  "roleplay-sports": 80,
  "roleplay-home": 80,
  practice: 100,
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
  const { selection } = useTrainingSelection();
  const resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;

  const isOverview = activeView === "training-hub";
  const progress = progressMap[activeView];
  const themeLabel = darkMode ? "라이트 모드로 전환" : "다크 모드로 전환";

  const mobileControls = (
    <div className="fixed right-4 top-4 z-30 flex gap-2 lg:hidden">
      <Button
        aria-label="메뉴 열기"
        className="bg-zinc-100/90 shadow-sm backdrop-blur dark:bg-zinc-900/90"
        onClick={onToggleMobileMenu}
        size="icon"
        variant="secondary"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        aria-label={themeLabel}
        className="bg-zinc-100/90 shadow-sm backdrop-blur dark:bg-zinc-900/90"
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
      <main className="flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen lg:min-h-0 lg:overflow-y-auto">
        {showTrainingHeader ? (
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-100/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6 lg:px-9">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <Button
                aria-label="메뉴 열기"
                className="lg:hidden"
                onClick={onToggleMobileMenu}
                size="icon"
                variant="ghost"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {getViewTitle(activeView, resolved)}
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
                    className="sm:hidden"
                    onClick={nextStep.onClick}
                    size="icon"
                    variant="secondary"
                  >
                    <ArrowRight className="h-4 w-4" />
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
