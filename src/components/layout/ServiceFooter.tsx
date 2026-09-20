import { Link } from "react-router-dom";
import { viewPathForId } from "../../lib/routes";
import { cn } from "../../lib/utils";
import type { FooterVariant, PageWidth } from "./layoutConfig";
import { pageFrameClasses } from "./PageContainer";

const groups = [
  { title: "학습", links: [["exam-guide", "OPIc 수험 가이드"], ["training-hub", "실전 훈련"], ["magazine-list", "오픽 매거진"]] },
  { title: "서비스", links: [["pricing", "요금제"], ["mypage", "마이페이지"], ["about", "소개"]] },
  { title: "정책 · 정보", links: [["privacy", "개인정보처리방침"], ["terms", "이용약관"], ["editorial-policy", "편집 원칙"]] },
] as const;

const linkClass = "inline-flex min-h-8 items-center rounded-sm text-xs leading-4 transition-colors hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:min-h-6";

export function ServiceFooter({
  variant = "public",
  width = "default",
  landing = false,
  className,
}: {
  variant?: FooterVariant;
  width?: PageWidth;
  landing?: boolean;
  className?: string;
}) {
  if (variant === "none") return null;

  return (
    <footer
      className={cn(
        "mt-auto shrink-0 border-t",
        landing
          ? "relative z-10 w-full border-white/10 bg-zinc-950 text-zinc-400"
          : "border-zinc-200/70 text-zinc-600 dark:border-zinc-800/70 dark:text-zinc-400",
        className
      )}
      data-footer-variant="public"
    >
      <div className={cn("mx-auto w-full py-3", landing ? "landing-footer-content" : pageFrameClasses[width])}>
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:gap-6">
          <div>
            <Link to={viewPathForId.home} className={`${linkClass} font-semibold`}>OOM · 오픽온미</Link>
            <p className="text-xs leading-5">외울 건 줄이고, 실전은 더 많이.</p>
          </div>
          <nav aria-label="서비스 정보" className="grid grid-cols-3 gap-3 sm:gap-6">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className={`mb-1 text-xs font-medium ${landing ? "text-zinc-300" : "text-zinc-700 dark:text-zinc-300"}`}>{group.title}</h2>
                <ul>
                  {group.links.map(([view, label]) => (
                    <li key={view}><Link to={viewPathForId[view]} className={linkClass}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 text-xs">
          <p>© {new Date().getFullYear()} OOM · 오픽온미</p>
          <nav aria-label="문의 및 출처" className="flex gap-4">
            <Link to={viewPathForId.contact} className={linkClass}>문의</Link>
            <Link to={viewPathForId["image-credits"]} className={linkClass}>이미지 출처</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
