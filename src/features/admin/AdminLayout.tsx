import {
  BookOpen,
  FileText,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAdminAccess } from "./useAdminAccess";

interface AdminLayoutProps {
  children: ReactNode;
}

const navTabs = [
  { path: "/admin/", label: "대시보드", icon: LayoutDashboard },
  { path: "/admin/users/", label: "사용자", icon: Users },
  { path: "/admin/learning/", label: "학습 운영", icon: BookOpen },
  { path: "/admin/audit/", label: "감사 로그", icon: FileText },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { adminUser, role, refresh } = useAdminAccess();

  const roleLabelMap: Record<string, { label: string; className: string }> = {
    owner: {
      label: "소유자",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60",
    },
    admin: {
      label: "관리자",
      className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300/60 dark:border-indigo-700/60",
    },
    support: {
      label: "운영 지원",
      className: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
    },
  };

  const currentRoleMeta = role ? roleLabelMap[role] : roleLabelMap.admin;

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
                관리자 콘솔
              </h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  currentRoleMeta.className
                )}
              >
                {currentRoleMeta.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              OOM 서비스 운영 · 지표 모니터링 · 사용자 관리
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {adminUser && (
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              접속 계정:{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                {adminUser.displayName || adminUser.userId.slice(0, 8)}
              </strong>
            </span>
          )}
          <button
            aria-label="데이터 새로고침"
            className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            onClick={() => void refresh()}
            title="데이터 새로고침"
            type="button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <nav
        aria-label="관리자 메뉴"
        className="flex space-x-1 border-b border-zinc-200/80 pb-px dark:border-zinc-800"
      >
        {navTabs.map((tab) => {
          const isActive =
            tab.path === "/admin/"
              ? location.pathname === "/admin" || location.pathname === "/admin/"
              : location.pathname.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-2 border-indigo-600 bg-white font-semibold text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-zinc-900 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
              )}
              key={tab.path}
              to={tab.path}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Page Content Area */}
      <main className="min-h-[400px]">
        {children}
      </main>
    </div>
  );
}
