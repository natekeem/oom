import {
  Bot,
  BookOpenCheck,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  House,
  Mic,
  SlidersHorizontal,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { ViewId } from "./Sidebar";
import { OomBrandMark } from "../brand/OomBrandMark";

type UnifiedSidebarProps = {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
};

type NavigationItem = { id: ViewId; label: string; icon: LucideIcon };

const primaryItems: NavigationItem[] = [
  { id: "home", label: "홈 / 전략 개요", icon: House },
  { id: "survey", label: "STEP 1. 서베이 고정", icon: ClipboardList },
  { id: "difficulty", label: "STEP 2. 난이도 설정", icon: SlidersHorizontal },
];

const examItems: Array<{ id: ViewId; label: string }> = [
  { id: "exam-overview", label: "소개 · 등급" },
  { id: "exam-apply", label: "회원 · 신청 · 응시료" },
  { id: "exam-day", label: "신분증 · 입실 · 진행" },
  { id: "exam-results", label: "성적 · 인증서 · 쿠폰" },
];

const scriptItems: Array<{ id: ViewId; label: string }> = [
  { id: "script-outdoor", label: "야외 / 여행" },
  { id: "script-indoor", label: "실내 / 휴식" },
  { id: "script-sports", label: "운동 / 취미" },
  { id: "script-home", label: "집 / 거주지" },
];

const secondaryItems: NavigationItem[] = [
  { id: "roleplay", label: "STEP 4. 롤플레이 공식", icon: ChartNoAxesCombined },
  { id: "practice", label: "STEP 5. 실전 연습", icon: Mic },
  { id: "ai-settings", label: "AI 피드백 / 설정", icon: Bot },
];

function NavigationButton({ active, children, nested = false, onClick }: { active: boolean; children: ReactNode; nested?: boolean; onClick: () => void }) {
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
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function UnifiedSidebar({ activeView, mobileOpen = false, onClose, onNavigate }: UnifiedSidebarProps) {
  const navigate = (view: ViewId) => {
    onNavigate(view);
    onClose?.();
  };
  const scriptActive = scriptItems.some((item) => item.id === activeView);
  const examActive = examItems.some((item) => item.id === activeView);

  const content = (
    <div className="flex h-full flex-col bg-zinc-50 px-3 py-5 dark:bg-zinc-950">
      <div className="mb-7 flex items-center justify-between px-2">
        <button aria-label="홈으로 이동" className="flex items-center gap-3 text-left" onClick={() => navigate("home")} type="button">
          <OomBrandMark className="text-indigo-600 dark:text-indigo-300" size="md" />
          <span>
            <span className="block text-sm font-semibold text-zinc-950 dark:text-white">OOM</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">OPIc On Me</span>
          </span>
        </button>
        {onClose ? <button aria-label="메뉴 닫기" className="rounded p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 lg:hidden" onClick={onClose} type="button"><X className="h-5 w-5" /></button> : null}
      </div>

      <nav aria-label="OOM 메뉴" className="space-y-1">
        {primaryItems.slice(0, 1).map((item) => {
          const Icon = item.icon;
          return <NavigationButton active={activeView === item.id} key={item.id} onClick={() => navigate(item.id)}><Icon className="h-4 w-4" />{item.label}</NavigationButton>;
        })}
        <NavigationButton active={examActive} onClick={() => navigate("exam-overview")}><BookOpenCheck className="h-4 w-4" />OPIc 수험 가이드</NavigationButton>
        <div className="mt-1 space-y-1 border-l border-zinc-200 dark:border-zinc-800">
          {examItems.map((item) => <NavigationButton active={activeView === item.id} key={item.id} nested onClick={() => navigate(item.id)}><ChevronRight className="h-3.5 w-3.5" />{item.label}</NavigationButton>)}
        </div>
        {primaryItems.slice(1).map((item) => {
          const Icon = item.icon;
          return <NavigationButton active={activeView === item.id} key={item.id} onClick={() => navigate(item.id)}><Icon className="h-4 w-4" />{item.label}</NavigationButton>;
        })}

        <NavigationButton active={scriptActive} onClick={() => navigate("script-outdoor")}><ClipboardList className="h-4 w-4" />STEP 3. 만능 스크립트</NavigationButton>
        <div className="mt-1 space-y-1 border-l border-zinc-200 dark:border-zinc-800">
          {scriptItems.map((item) => <NavigationButton active={activeView === item.id} key={item.id} nested onClick={() => navigate(item.id)}><ChevronRight className="h-3.5 w-3.5" />{item.label}</NavigationButton>)}
        </div>

        <div className="pt-4">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return <NavigationButton active={activeView === item.id} key={item.id} onClick={() => navigate(item.id)}><Icon className="h-4 w-4" />{item.label}</NavigationButton>;
          })}
        </div>
      </nav>

      <div className="mt-auto rounded-md border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300"><Sparkles className="h-4 w-4" />오늘의 한 문장</div>
        <p className="mt-1.5 text-xs leading-5 text-indigo-700/80 dark:text-indigo-200/80">한 장면을 정해서, 90초 동안 말해 보세요. ✨</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 lg:block">{content}</aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="메뉴 배경 닫기" className="absolute inset-0 bg-zinc-950/40" onClick={onClose} type="button" />
          <aside aria-label="모바일 메뉴" className="relative h-full w-72 max-w-[85vw] border-r border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">{content}</aside>
        </div>
      ) : null}
    </>
  );
}
