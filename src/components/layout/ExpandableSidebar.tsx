import { AuthNavigationLabel } from "../../auth/AuthNavigation";
import {
  ChevronDown,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { ViewId } from "./Sidebar";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";
import { OomBrandMark } from "../brand/OomBrandMark";
import { topLevelNavigation } from "./topLevelNavigation";
import { useAdminAccess } from "../../features/admin/useAdminAccess";

type ExpandableSidebarProps = {
  activeView: ViewId;
  darkMode: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  onNavigate: (view: ViewId) => void;
  onToggleDarkMode: () => void;
};

type Item = { id: ViewId; label: string; icon?: LucideIcon };

export const SIDEBAR_EXPANDED_STORAGE_KEY = "oom.sidebar.expanded";
export const SIDEBAR_COLLAPSED_STORAGE_KEY = "oom-sidebar-collapsed-v1";

const guideItems: Item[] = [
  { id: "exam-overview", label: "소개 · 등급" },
  { id: "exam-screen", label: "시험 화면 · 조작법" },
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

const practiceItems: Item[] = [
  { id: "practice-quick", label: "빠른 연습" },
  { id: "practice-mock", label: "실전 모의고사" },
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
  icon: Icon,
  label,
  depth = 0,
  onClick,
}: {
  active: boolean;
  icon?: LucideIcon;
  label: ReactNode;
  depth?: 0 | 1 | 2;
  onClick: () => void;
}) {
  const titleAttr = typeof label === "string" ? label : undefined;
  return (
    <button
      aria-current={active ? "page" : undefined}
      title={titleAttr}
      className={cn(
        "flex items-center text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        depth === 0
          ? "h-9 w-full rounded-md px-3 text-sm"
          : depth === 1
          ? "ml-2 h-[32px] w-[calc(100%-0.5rem)] rounded-md pl-4 pr-3 text-sm"
          : "ml-4 h-[30px] w-[calc(100%-1rem)] rounded-md pl-6 pr-3 text-xs",
        active
          ? depth > 0
            ? "bg-indigo-50/80 font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-200"
            : "bg-indigo-600 font-medium text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      )}
      onClick={onClick}
      type="button"
    >
      {depth === 0 && Icon && <Icon className="mr-2 h-[18px] w-[18px] shrink-0" />}
      {depth === 1 && (
        <div
          className={cn(
            "mr-2 h-1 w-1 shrink-0 rounded-full",
            active ? "bg-indigo-600 dark:bg-indigo-400" : "bg-zinc-400 dark:bg-zinc-600"
          )}
        />
      )}
      {depth === 2 && (
        <div
          className={cn(
            "mr-[7px] h-[3px] w-[3px] shrink-0 rounded-full",
            active ? "bg-indigo-600 dark:bg-indigo-400" : "bg-zinc-400 dark:bg-zinc-600"
          )}
        />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function CollapsibleSection({
  active,
  children,
  icon: Icon,
  label,
  depth = 0,
  onNavigate,
  onToggle,
  open,
}: {
  active: boolean;
  children: ReactNode;
  icon?: LucideIcon;
  label: string;
  depth?: 0 | 1;
  onNavigate: () => void;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <div className="w-full space-y-0.5">
      <div
        className={cn(
          "flex items-center rounded-md transition-colors",
          depth === 0 ? "w-full" : "ml-2 w-[calc(100%-0.5rem)]",
          active
            ? depth > 0
              ? "bg-indigo-50/80 font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-200"
              : "bg-indigo-600 font-medium text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        )}
      >
        <button
          aria-current={active ? "page" : undefined}
          title={label}
          className={cn(
            "flex min-w-0 flex-1 items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300",
            depth === 0 ? "h-9 px-3 text-sm" : "h-[32px] pl-4 text-sm"
          )}
          onClick={onNavigate}
          type="button"
        >
          {depth === 0 && Icon && <Icon className="mr-2 h-[18px] w-[18px] shrink-0" />}
          {depth === 1 && (
            <div
              className={cn(
                "mr-2 h-1 w-1 shrink-0 rounded-full",
                active ? "bg-indigo-600 dark:bg-indigo-400" : "bg-zinc-400 dark:bg-zinc-600",
                open && !active && "bg-zinc-500 dark:bg-zinc-400"
              )}
            />
          )}
          <span className="truncate">{label}</span>
        </button>
        <button
          aria-expanded={open}
          aria-label={`${label} 하위 메뉴 ${open ? "접기" : "펼치기"}`}
          className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          onClick={onToggle}
          type="button"
        >
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open ? <div className="space-y-0.5 pb-0.5 pt-0.5">{children}</div> : null}
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
  const mobileDialogRef = useRef<HTMLElement | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { selection } = useTrainingSelection();
  const resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;
  const { status: adminStatus } = useAdminAccess();
  const isAdmin = adminStatus === "authorized";
  const isAdminActive = activeView.startsWith("admin-");

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setQuoteOpen(false);
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  const scriptItems: Item[] = [
    { id: "script-self-introduction", label: "워밍업 · 자기소개" },
    ...(resolved?.storylines ?? [
      { id: "outdoor-travel", group: "그룹 1" },
      { id: "indoor-rest", group: "그룹 2" },
      { id: "sports-hobby", group: "그룹 3" },
      { id: "home-residence", group: "그룹 4" },
    ]).map((s, idx) => ({
      id: scriptSlotIds[idx] ?? "script-outdoor",
      label: s.group,
    })),
  ];

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
  const practiceActive = activeView === "practice" || practiceItems.some((item) => item.id === activeView);
  const trainingActive =
    activeView === "training-hub" ||
    activeView === "training-setup" ||
    activeView === "survey" ||
    activeView === "difficulty" ||
    scriptActive ||
    roleplayActive ||
    practiceActive;

  const activeAncestors = new Set<string>();
  if (scriptActive) {
    activeAncestors.add("script");
    activeAncestors.add("training");
  } else if (roleplayActive) {
    activeAncestors.add("roleplay");
    activeAncestors.add("training");
  } else if (practiceActive) {
    activeAncestors.add("practice");
    activeAncestors.add("training");
  } else if (guideActive) {
    activeAncestors.add("guide");
  } else if (trainingActive) {
    activeAncestors.add("training");
  }

  const expandSmartly = (prev: Set<string>, section: string, forceKeepDescendants = false) => {
    if (mobileOpen) {
      const next = new Set<string>();
      next.add(section);
      if (section === "script" || section === "roleplay" || section === "practice") next.add("training");
      return next;
    }

    const next = new Set(prev);
    if (section === "guide") {
      next.add("guide");
      next.delete("training");
      next.delete("script");
      next.delete("roleplay");
      next.delete("practice");
    } else if (section === "training") {
      next.add("training");
      next.delete("guide");
      if (!forceKeepDescendants) {
        next.delete("script");
        next.delete("roleplay");
        next.delete("practice");
      }
    } else if (section === "script") {
      next.add("script");
      next.delete("roleplay");
      next.delete("practice");
      next.add("training");
      next.delete("guide");
    } else if (section === "roleplay") {
      next.add("roleplay");
      next.delete("script");
      next.delete("practice");
      next.add("training");
      next.delete("guide");
    } else if (section === "practice") {
      next.add("practice");
      next.delete("script");
      next.delete("roleplay");
      next.add("training");
      next.delete("guide");
    }
    return next;
  };

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem(SIDEBAR_EXPANDED_STORAGE_KEY);
      if (stored) {
        const parsed = new Set<string>(JSON.parse(stored));
        const next = new Set<string>();

        const hasRoute = activeAncestors.size > 0;
        let routeTarget = "";
        if (activeAncestors.has("script")) routeTarget = "script";
        else if (activeAncestors.has("roleplay")) routeTarget = "roleplay";
        else if (activeAncestors.has("practice")) routeTarget = "practice";
        else if (activeAncestors.has("guide")) routeTarget = "guide";
        else if (activeAncestors.has("training")) routeTarget = "training";

        let restoredTarget = "";
        if (parsed.has("script")) restoredTarget = "script";
        else if (parsed.has("roleplay")) restoredTarget = "roleplay";
        else if (parsed.has("practice")) restoredTarget = "practice";
        else if (parsed.has("guide")) restoredTarget = "guide";
        else if (parsed.has("training")) restoredTarget = "training";

        const target = hasRoute ? routeTarget : restoredTarget;

        if (target) {
          if (target === "script") {
            next.add("script");
            next.add("training");
          } else if (target === "roleplay") {
            next.add("roleplay");
            next.add("training");
          } else if (target === "practice") {
            next.add("practice");
            next.add("training");
          } else if (target === "guide") {
            next.add("guide");
          } else if (target === "training") {
            next.add("training");
          }
        }

        for (const a of activeAncestors) next.add(a);
        return next;
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
    return new Set(activeAncestors);
  });

  useEffect(() => {
    sessionStorage.setItem(SIDEBAR_EXPANDED_STORAGE_KEY, JSON.stringify([...expanded]));
  }, [expanded]);

  const [prevActiveView, setPrevActiveView] = useState(activeView);
  if (activeView !== prevActiveView) {
    setPrevActiveView(activeView);
    setExpanded((prev) => {
      let next = new Set(prev);
      let changed = false;

      if (activeAncestors.size > 0) {
        let targetSection = "";
        if (activeAncestors.has("script")) targetSection = "script";
        else if (activeAncestors.has("roleplay")) targetSection = "roleplay";
        else if (activeAncestors.has("practice")) targetSection = "practice";
        else if (activeAncestors.has("guide")) targetSection = "guide";
        else if (activeAncestors.has("training")) targetSection = "training";

        if (targetSection && !next.has(targetSection)) {
          next = expandSmartly(next, targetSection, true);
        }
      }

      for (const anc of activeAncestors) {
        if (!next.has(anc)) {
          next.add(anc);
          changed = true;
        }
      }

      if (prev.size !== next.size) changed = true;
      else {
        for (const item of prev) if (!next.has(item)) changed = true;
      }

      return changed ? next : prev;
    });
  }

  const isSectionOpen = (section: string) => expanded.has(section);

  const guideOpen = isSectionOpen("guide");
  const trainingOpen = isSectionOpen("training");
  const scriptOpen = isSectionOpen("script");
  const roleplayOpen = isSectionOpen("roleplay");
  const practiceOpen = isSectionOpen("practice");

  const handleToggle = (section: string) => {
    setExpanded((prev) => {
      if (mobileOpen) {
        const next = new Set<string>();
        if (!prev.has(section)) {
          next.add(section);
          if (section === "script" || section === "roleplay" || section === "practice") next.add("training");
        }
        return next;
      }

      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
        if (section === "training") {
          next.delete("script");
          next.delete("roleplay");
          next.delete("practice");
        }
        return next;
      } else {
        return expandSmartly(prev, section);
      }
    });
  };

  const navigate = (view: ViewId) => {
    onNavigate(view);
    onClose?.();
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const dialog = mobileDialogRef.current;
    const firstTarget =
      dialog?.querySelector<HTMLElement>("[data-mobile-close]") ??
      dialog?.querySelector<HTMLElement>("button, a, [tabindex]:not([tabindex='-1'])");
    firstTarget?.focus();
  }, [mobileOpen]);

  const trapMobileFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose?.();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => element.getAttribute("aria-hidden") !== "true");
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // ---------------------------------------------------------------------------
  // Expanded Nav List (for desktop expanded and mobile drawer)
  // ---------------------------------------------------------------------------
  const expandedNav = (
    <nav aria-label="OOM 메뉴" className="space-y-0.5">
      <NavigationButton
        active={activeView === "about"}
        depth={0}
        icon={topLevelNavigation.about.icon}
        label={topLevelNavigation.about.label}
        onClick={() => navigate("about")}
      />

      <CollapsibleSection
        active={guideActive}
        depth={0}
        icon={topLevelNavigation.examGuide.icon}
        label={topLevelNavigation.examGuide.label}
        onNavigate={() => {
          setExpanded((prev) => expandSmartly(prev, "guide"));
          navigate("exam-guide");
        }}
        onToggle={() => handleToggle("guide")}
        open={guideOpen}
      >
        {guideItems.map((item) => (
          <NavigationButton
            active={activeView === item.id}
            depth={1}
            key={item.id}
            label={item.label}
            onClick={() => {
              setExpanded((prev) => expandSmartly(prev, "guide"));
              navigate(item.id);
            }}
          />
        ))}
      </CollapsibleSection>

      <CollapsibleSection
        active={trainingActive}
        depth={0}
        icon={topLevelNavigation.training.icon}
        label={topLevelNavigation.training.label}
        onNavigate={() => {
          setExpanded((prev) => expandSmartly(prev, "training"));
          navigate("training-hub");
        }}
        onToggle={() => handleToggle("training")}
        open={trainingOpen}
      >
        <NavigationButton
          active={activeView === "training-setup"}
          depth={1}
          label="STEP 1. 목표 설정"
          onClick={() => {
            setExpanded((prev) => expandSmartly(prev, "training"));
            navigate("training-setup");
          }}
        />
        <NavigationButton
          active={activeView === "survey"}
          depth={1}
          label="STEP 2. 추천 서베이 익히기"
          onClick={() => {
            setExpanded((prev) => expandSmartly(prev, "training"));
            navigate("survey");
          }}
        />
        <NavigationButton
          active={activeView === "difficulty"}
          depth={1}
          label="STEP 3. 난이도 설정"
          onClick={() => {
            setExpanded((prev) => expandSmartly(prev, "training"));
            navigate("difficulty");
          }}
        />
        <CollapsibleSection
          active={scriptActive}
          depth={1}
          label="STEP 4. 만능 스크립트"
          onNavigate={() => {
            setExpanded((prev) => expandSmartly(prev, "script"));
            navigate("script-hub");
          }}
          onToggle={() => handleToggle("script")}
          open={scriptOpen}
        >
          {scriptItems.map((item) => (
            <NavigationButton
              active={activeView === item.id}
              depth={2}
              key={item.id}
              label={item.label}
              onClick={() => {
                setExpanded((prev) => expandSmartly(prev, "script"));
                navigate(item.id);
              }}
            />
          ))}
        </CollapsibleSection>
        <CollapsibleSection
          active={roleplayActive}
          depth={1}
          label="STEP 5. 롤플레이 공식"
          onNavigate={() => {
            setExpanded((prev) => expandSmartly(prev, "roleplay"));
            navigate("roleplay-hub");
          }}
          onToggle={() => handleToggle("roleplay")}
          open={roleplayOpen}
        >
          {roleplayItems.map((item) => (
            <NavigationButton
              active={activeView === item.id}
              depth={2}
              key={item.id}
              label={item.label}
              onClick={() => {
                setExpanded((prev) => expandSmartly(prev, "roleplay"));
                navigate(item.id);
              }}
            />
          ))}
        </CollapsibleSection>
        <CollapsibleSection
          active={practiceActive}
          depth={1}
          label="STEP 6. 실전 연습"
          onNavigate={() => {
            setExpanded((prev) => expandSmartly(prev, "practice"));
            navigate("practice");
          }}
          onToggle={() => handleToggle("practice")}
          open={practiceOpen}
        >
          {practiceItems.map((item) => (
            <NavigationButton
              active={activeView === item.id}
              depth={2}
              key={item.id}
              label={item.label}
              onClick={() => {
                setExpanded((prev) => expandSmartly(prev, "practice"));
                navigate(item.id);
              }}
            />
          ))}
        </CollapsibleSection>
      </CollapsibleSection>

      <NavigationButton
        active={activeView === "magazine-list"}
        depth={0}
        icon={topLevelNavigation.magazine.icon}
        label={topLevelNavigation.magazine.label}
        onClick={() => navigate("magazine-list")}
      />
      <NavigationButton
        active={activeView === "ai-settings"}
        depth={0}
        icon={topLevelNavigation.aiSettings.icon}
        label={topLevelNavigation.aiSettings.label}
        onClick={() => navigate("ai-settings")}
      />
    </nav>
  );

  // ---------------------------------------------------------------------------
  // Collapsed Nav List (icon-only for desktop collapsed)
  // ---------------------------------------------------------------------------
  const collapsedNav = (
    <nav aria-label="OOM 메뉴" className="space-y-1 py-1">
      <button
        aria-current={activeView === "about" ? "page" : undefined}
        aria-label={topLevelNavigation.about.label}
        title={topLevelNavigation.about.label}
        className={cn(
          "grid h-10 w-10 mx-auto place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          activeView === "about"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        )}
        onClick={() => navigate("about")}
        type="button"
      >
        <topLevelNavigation.about.icon className="h-5 w-5 shrink-0" />
      </button>

      <button
        aria-current={guideActive ? "page" : undefined}
        aria-label={topLevelNavigation.examGuide.label}
        title={topLevelNavigation.examGuide.label}
        className={cn(
          "grid h-10 w-10 mx-auto place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          guideActive
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        )}
        onClick={() => navigate("exam-guide")}
        type="button"
      >
        <topLevelNavigation.examGuide.icon className="h-5 w-5 shrink-0" />
      </button>

      <button
        aria-current={trainingActive ? "page" : undefined}
        aria-label={topLevelNavigation.training.label}
        title={topLevelNavigation.training.label}
        className={cn(
          "grid h-10 w-10 mx-auto place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          trainingActive
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        )}
        onClick={() => navigate("training-hub")}
        type="button"
      >
        <topLevelNavigation.training.icon className="h-5 w-5 shrink-0" />
      </button>

      <button
        aria-current={activeView === "magazine-list" ? "page" : undefined}
        aria-label={topLevelNavigation.magazine.label}
        title={topLevelNavigation.magazine.label}
        className={cn(
          "grid h-10 w-10 mx-auto place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          activeView === "magazine-list"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        )}
        onClick={() => navigate("magazine-list")}
        type="button"
      >
        <topLevelNavigation.magazine.icon className="h-5 w-5 shrink-0" />
      </button>

      <button
        aria-current={activeView === "ai-settings" ? "page" : undefined}
        aria-label={topLevelNavigation.aiSettings.label}
        title={topLevelNavigation.aiSettings.label}
        className={cn(
          "grid h-10 w-10 mx-auto place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          activeView === "ai-settings"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        )}
        onClick={() => navigate("ai-settings")}
        type="button"
      >
        <topLevelNavigation.aiSettings.icon className="h-5 w-5 shrink-0" />
      </button>
    </nav>
  );

  // ---------------------------------------------------------------------------
  // Desktop Content (expanded vs collapsed)
  // ---------------------------------------------------------------------------
  const desktopContent = (
    <div className="flex h-full flex-col justify-between p-3">
      {/* 1. Brand Header */}
      <div className="shrink-0 mb-4 px-1">
        {isCollapsed ? (
          <button
            aria-label="오픽온미 홈으로 이동"
            title="오픽온미 홈"
            className="flex h-10 w-full items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={() => navigate("home")}
            type="button"
          >
            <OomBrandMark className="text-indigo-600 dark:text-indigo-300" size="md" />
          </button>
        ) : (
          <div className="flex items-center justify-between px-1">
            <button
              aria-label="홈으로 이동"
              className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              onClick={() => navigate("home")}
              type="button"
            >
              <OomBrandMark className="text-indigo-600 dark:text-indigo-300" size="md" />
              <span>
                <span className="block text-sm font-semibold text-zinc-950 dark:text-white">오픽온미</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">OOM - OPIc On Me</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Scrollable Nav Area */}
      <div className="oom-sidebar-scroll flex-1 min-h-0 overflow-y-auto">
        {isCollapsed ? collapsedNav : expandedNav}
      </div>

      {/* 3. Pinned Bottom Utilities */}
      <div
        data-sidebar-utilities
        className="shrink-0 mt-auto space-y-1 border-t border-zinc-200/80 pt-3 dark:border-zinc-800/80"
      >
        {isCollapsed ? (
          <>
            {isAdmin && (
              <button
                aria-current={isAdminActive ? "page" : undefined}
                aria-label="관리자 콘솔"
                title="관리자 콘솔"
                className={cn(
                  "grid h-10 w-10 mx-auto place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  isAdminActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                )}
                onClick={() => navigate("admin-dashboard")}
                type="button"
              >
                <ShieldCheck className="h-4 w-4" />
              </button>
            )}
            <button
              aria-current={activeView === "mypage" ? "page" : undefined}
              aria-label="마이페이지"
              title="마이페이지"
              className={cn(
                "grid h-10 w-10 mx-auto place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                activeView === "mypage"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              )}
              onClick={() => navigate("mypage")}
              type="button"
            >
              <UserRound className="h-4 w-4" />
            </button>
            <button
              aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              title={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              className="grid h-10 w-10 mx-auto place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              onClick={onToggleDarkMode}
              type="button"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              aria-label="사이드바 펼치기"
              title="사이드바 펼치기"
              className="grid h-10 w-10 mx-auto place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              onClick={handleToggleCollapse}
              type="button"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <div className="relative" data-sidebar-quote>
              <button
                aria-label={`오늘의 한 문장: ${sidebarQuote}`}
                aria-expanded={quoteOpen}
                aria-controls="sidebar-daily-sentence"
                title={`오늘의 한 문장: ${sidebarQuote}`}
                className="grid h-10 w-10 mx-auto place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                onClick={() => setQuoteOpen((open) => !open)}
                onBlur={() => setQuoteOpen(false)}
                onKeyDown={(event) => { if (event.key === "Escape") setQuoteOpen(false); }}
                type="button"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <p
                id="sidebar-daily-sentence"
                hidden={!quoteOpen}
                className="absolute bottom-0 left-full z-30 ml-3 w-56 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {sidebarQuote}
              </p>
            </div>
          </>
        ) : (
          <>
            {isAdmin && (
              <NavigationButton
                active={isAdminActive}
                depth={0}
                icon={ShieldCheck}
                label="관리자 콘솔"
                onClick={() => navigate("admin-dashboard")}
              />
            )}
            <NavigationButton
              active={activeView === "mypage"}
              depth={0}
              icon={topLevelNavigation.mypage.icon}
              label={<AuthNavigationLabel />}
              onClick={() => navigate("mypage")}
            />
            <button
              aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              className="flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              onClick={onToggleDarkMode}
              type="button"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {darkMode ? "라이트 모드" : "다크 모드"}
            </button>
            <button
              aria-label="사이드바 접기"
              title="사이드바 접기"
              className="flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              onClick={handleToggleCollapse}
              type="button"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
              <span>사이드바 접기</span>
            </button>
            <div data-sidebar-quote className="rounded-md bg-zinc-100/70 px-3 py-2 dark:bg-zinc-900/60">
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                오늘의 한 문장
              </div>
              <p className="mt-1 text-xs leading-4 text-zinc-600 dark:text-zinc-400">
                {sidebarQuote}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Mobile Drawer Content (always expanded, independent of desktop collapse)
  // ---------------------------------------------------------------------------
  const mobileContent = (
    <div className="flex h-full flex-col bg-zinc-50 px-3 py-5 dark:bg-zinc-950">
      <div className="mb-6 flex items-center justify-between px-2">
        <button
          aria-label="홈으로 이동"
          className="flex items-center gap-3 text-left"
          onClick={() => navigate("home")}
          type="button"
        >
          <OomBrandMark className="text-indigo-600 dark:text-indigo-300" size="md" />
          <span>
            <span className="block text-sm font-semibold text-zinc-950 dark:text-white">오픽온미</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">OOM - OPIc On Me</span>
          </span>
        </button>
        {onClose ? (
          <button
            aria-label="메뉴 닫기"
            data-mobile-close
            className="rounded p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="oom-sidebar-scroll flex-1 min-h-0 overflow-y-auto">
        {expandedNav}
      </div>

      <div className="mt-auto shrink-0 space-y-2 border-t border-zinc-200/80 pt-3 dark:border-zinc-800/80">
        {isAdmin && (
          <NavigationButton
            active={isAdminActive}
            depth={0}
            icon={ShieldCheck}
            label="관리자 콘솔"
            onClick={() => navigate("admin-dashboard")}
          />
        )}
        <NavigationButton
          active={activeView === "mypage"}
          depth={0}
          icon={topLevelNavigation.mypage.icon}
          label={<AuthNavigationLabel />}
          onClick={() => navigate("mypage")}
        />
        <button
          aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          className="flex h-8 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          onClick={onToggleDarkMode}
          type="button"
        >
          {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {darkMode ? "라이트 모드" : "다크 모드"}
        </button>
        <div className="rounded-md border border-indigo-100 bg-indigo-50 p-2.5 dark:border-indigo-900 dark:bg-indigo-950">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            오늘의 한 문장
          </div>
          <p className="mt-1 text-xs leading-4 text-indigo-700/80 dark:text-indigo-200/80">
            {sidebarQuote}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:z-30 lg:h-[100dvh] lg:shrink-0 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 transition-[width] duration-200 ease-in-out motion-reduce:transition-none",
          isCollapsed ? "lg:w-[68px]" : "lg:w-60"
        )}
        data-sidebar-collapsed={isCollapsed}
      >
        {desktopContent}
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
            aria-modal="true"
            className="oom-sidebar-scroll relative h-full w-72 max-w-[85vw] overflow-y-auto border-r border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            id="oom-mobile-navigation"
            onKeyDown={trapMobileFocus}
            ref={mobileDialogRef}
            role="dialog"
          >
            {mobileContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
