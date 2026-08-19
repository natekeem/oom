import {
  Bot,
  BookOpenCheck,
  BookOpenText,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  ClipboardList,
  GraduationCap,
  House,
  Mic,
  Moon,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { ViewId } from "./Sidebar";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";

type ExpandableSidebarProps = {
  activeView: ViewId;
  darkMode: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  onNavigate: (view: ViewId) => void;
  onToggleDarkMode: () => void;
};

type Item = { id: ViewId; label: string; icon?: LucideIcon };
type ExpandedSection = "guide" | "training" | "script" | "roleplay" | "none" | null;

const guideItems: Item[] = [
  { id: "exam-overview", label: "소개 · 등급" },
  { id: "exam-apply", label: "회원 · 신청 · 응시료" },
  { id: "exam-day", label: "신분증 · 입실 · 진행" },
  { id: "exam-results", label: "성적 · 인증서 · 쿠폰" },
  { id: "exam-faq", label: "자주 묻는 질문" },
];

const scriptSlotIds: ViewId[] = [
  "script-outdoor",
  "script-indoor",
  "script-sports",
  "script-home",
];

const roleplaySlotIds: ViewId[] = [
  "roleplay-travel",
  "roleplay-indoor",
  "roleplay-sports",
  "roleplay-home",
];

const sidebarQuotes = [
  "서베이 한 장면을 정해서 90초 동안 말해 보세요.",
  "오늘은 하나의 경험을 중심으로 자연스럽게 연결해 보세요.",
  "중요한 장면을 정하고 핵심 어휘를 먼저 떠올려 보세요.",
  "OPIc 말하기는 장면 중심으로 구성하는 연습이 가장 빠릅니다.",
];
const sidebarQuote = sidebarQuotes[Math.floor(Math.random() * sidebarQuotes.length)];

function NavigationButton({
  active,
  children,
  nested = false,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  nested?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        nested && "ml-2 w-[calc(100%-0.5rem)] py-1.5 pl-5 text-xs",
        active
          ? nested
            ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
            : "bg-indigo-600 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function CollapsibleSection({
  active,
  children,
  icon: Icon,
  label,
  nested = false,
  onNavigate,
  onToggle,
  open,
}: {
  active: boolean;
  children: ReactNode;
  icon: LucideIcon;
  label: string;
  nested?: boolean;
  onNavigate: () => void;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <div className={cn("space-y-1", nested && "ml-2 border-l border-zinc-200 pl-1 dark:border-zinc-800")}>
      <div
        className={cn(
          "flex items-center rounded-md",
          active
            ? nested
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
              : "bg-indigo-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        )}
      >
        <button
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300",
            nested && "py-1.5 text-xs"
          )}
          onClick={onNavigate}
          type="button"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </button>
        <button
          aria-label={`${label} 하위 메뉴 ${open ? "접기" : "펼치기"}`}
          className="mr-1 grid h-8 w-8 place-items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          onClick={onToggle}
          type="button"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open ? <div className="space-y-1 border-l border-zinc-200 dark:border-zinc-800">{children}</div> : null}
    </div>
  );
}

export function ExpandableSidebar({
  activeView,
  darkMode,
  mobileOpen = false,
  onClose,
  onNavigate,
  onToggleDarkMode,
}: ExpandableSidebarProps) {
  const { selection } = useTrainingSelection();
  const resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;

  const scriptItems: Item[] = (resolved?.storylines ?? [
    { id: "outdoor-travel", group: "그룹 1" },
    { id: "indoor-rest", group: "그룹 2" },
    { id: "sports-hobby", group: "그룹 3" },
    { id: "home-residence", group: "그룹 4" },
  ]).map((s, idx) => ({
    id: scriptSlotIds[idx] ?? "script-outdoor",
    label: s.group,
  }));

  const roleplayItems: Item[] = (resolved?.roleplays ?? [
    { id: "roleplay-1", group: "그룹 1" },
    { id: "roleplay-2", group: "그룹 2" },
    { id: "roleplay-3", group: "그룹 3" },
    { id: "roleplay-4", group: "그룹 4" },
  ]).map((rp, idx) => ({
    id: roleplaySlotIds[idx] ?? "roleplay-travel",
    label: rp.group,
  }));

  const guideActive = activeView === "exam-guide" || guideItems.some((item) => item.id === activeView);
  const scriptActive = activeView === "script-hub" || scriptItems.some((item) => item.id === activeView);
  const roleplayActive =
    activeView === "roleplay-hub" ||
    activeView === "roleplay-formula" ||
    roleplayItems.some((item) => item.id === activeView);
  const trainingActive =
    activeView === "training-hub" ||
    activeView === "training-setup" ||
    activeView === "survey" ||
    activeView === "difficulty" ||
    scriptActive ||
    roleplayActive ||
    activeView === "practice" ||
    activeView === "roleplay";

  const [expanded, setExpanded] = useState<ExpandedSection>(null);
  const activeChildExpansion: ExpandedSection = scriptItems.some((item) => item.id === activeView)
    ? "script"
    : roleplayItems.some((item) => item.id === activeView) || activeView === "roleplay-formula"
    ? "roleplay"
    : guideItems.some((item) => item.id === activeView)
    ? "guide"
    : null;
  const visibleExpanded = activeChildExpansion ?? expanded;
  const guideOpen = visibleExpanded === null ? guideActive : visibleExpanded === "guide";
  const trainingOpen =
    visibleExpanded === null
      ? trainingActive
      : visibleExpanded === "training" || visibleExpanded === "script" || visibleExpanded === "roleplay";
  const scriptOpen = visibleExpanded === null ? scriptActive : visibleExpanded === "script";
  const roleplayOpen = visibleExpanded === null ? roleplayActive : visibleExpanded === "roleplay";
  const navigate = (view: ViewId) => {
    onNavigate(view);
    onClose?.();
  };

  const content = (
    <div className="flex h-full flex-col bg-zinc-50 px-3 py-5 dark:bg-zinc-950">
      <div className="mb-7 flex items-center justify-between px-2">
        <button
          aria-label="홈으로 이동"
          className="flex items-center gap-3 text-left"
          onClick={() => navigate("home")}
          type="button"
        >
          <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-zinc-950 dark:text-white">오픽온미</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">OOM - OPIc On Me</span>
          </span>
        </button>
        {onClose ? (
          <button
            aria-label="메뉴 닫기"
            className="rounded p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav aria-label="OOM 메뉴" className="space-y-1">
        <NavigationButton active={activeView === "home"} onClick={() => navigate("home")}>
          <House className="h-4 w-4" />
          홈 / 전략 개요
        </NavigationButton>

        <CollapsibleSection
          active={guideActive}
          icon={BookOpenCheck}
          label="OPIc 수험 가이드"
          onNavigate={() => {
            setExpanded("guide");
            navigate("exam-guide");
          }}
          onToggle={() => setExpanded(guideOpen ? "none" : "guide")}
          open={guideOpen}
        >
          {guideItems.map((item) => (
            <NavigationButton
              active={activeView === item.id}
              key={item.id}
              nested
              onClick={() => {
                setExpanded("guide");
                navigate(item.id);
              }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              {item.label}
            </NavigationButton>
          ))}
        </CollapsibleSection>
        <CollapsibleSection
          active={trainingActive}
          icon={CirclePlay}
          label="OPIc 실전 훈련하기"
          onNavigate={() => {
            setExpanded("training");
            navigate("training-hub");
          }}
          onToggle={() => setExpanded(trainingOpen ? "none" : "training")}
          open={trainingOpen}
        >
          <NavigationButton
            active={activeView === "training-setup"}
            nested
            onClick={() => {
              setExpanded("training");
              navigate("training-setup");
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            STEP 1. 목표 구간 · 코스 설정
          </NavigationButton>
          <NavigationButton
            active={activeView === "survey"}
            nested
            onClick={() => {
              setExpanded("training");
              navigate("survey");
            }}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            STEP 2. 서베이 고정
          </NavigationButton>
          <NavigationButton
            active={activeView === "difficulty"}
            nested
            onClick={() => {
              setExpanded("training");
              navigate("difficulty");
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            STEP 3. 난이도 설정
          </NavigationButton>
          <CollapsibleSection
            active={scriptActive}
            icon={BookOpenText}
            label="STEP 4. 만능 스크립트"
            nested
            onNavigate={() => {
              setExpanded("script");
              navigate("script-hub");
            }}
            onToggle={() => setExpanded(scriptOpen ? "training" : "script")}
            open={scriptOpen}
          >
            {scriptItems.map((item) => (
              <NavigationButton
                active={activeView === item.id}
                key={item.id}
                nested
                onClick={() => {
                  setExpanded("script");
                  navigate(item.id);
                }}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                {item.label}
              </NavigationButton>
            ))}
          </CollapsibleSection>
          <CollapsibleSection
            active={roleplayActive}
            icon={ChartNoAxesCombined}
            label="STEP 5. 롤플레이 공식"
            nested
            onNavigate={() => {
              setExpanded("roleplay");
              navigate("roleplay-hub");
            }}
            onToggle={() => setExpanded(roleplayOpen ? "training" : "roleplay")}
            open={roleplayOpen}
          >
            {roleplayItems.map((item) => (
              <NavigationButton
                active={activeView === item.id}
                key={item.id}
                nested
                onClick={() => {
                  setExpanded("roleplay");
                  navigate(item.id);
                }}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                {item.label}
              </NavigationButton>
            ))}
          </CollapsibleSection>
          <NavigationButton
            active={activeView === "practice"}
            nested
            onClick={() => {
              setExpanded("training");
              navigate("practice");
            }}
          >
            <Mic className="h-3.5 w-3.5" />
            STEP 6. 실전 연습
          </NavigationButton>
        </CollapsibleSection>
        <NavigationButton active={activeView === "magazine-list"} onClick={() => navigate("magazine-list")}>
          <BookOpenText className="h-4 w-4" />
          오픽 매거진
        </NavigationButton>
        <NavigationButton active={activeView === "ai-settings"} onClick={() => navigate("ai-settings")}>
          <Bot className="h-4 w-4" />
          AI 피드백 / 설정
        </NavigationButton>
      </nav>
      <div className="mt-auto space-y-2">
        <button
          aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          onClick={onToggleDarkMode}
          type="button"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {darkMode ? "라이트 모드" : "다크 모드"}
        </button>
        <div className="rounded-md border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            오늘의 한 문장
          </div>
          <p className="mt-1.5 text-xs leading-5 text-indigo-700/80 dark:text-indigo-200/80">
            {sidebarQuote}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 lg:block">
        {content}
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="메뉴 배경 닫기"
            className="absolute inset-0 bg-zinc-950/40"
            onClick={onClose}
            type="button"
          />
          <aside
            aria-label="모바일 메뉴"
            className="relative h-full w-72 max-w-[85vw] border-r border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}