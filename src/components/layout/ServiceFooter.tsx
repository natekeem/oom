import { Link } from "react-router-dom";
import { viewPathForId } from "../../lib/routes";
import { cn } from "../../lib/utils";
import type { FooterVariant } from "./layoutConfig";

const groups = [
  {
    title: "학습",
    links: [
      ["exam-guide", "OPIc 수험 가이드"],
      ["training-hub", "실전 훈련"],
      ["magazine-list", "오픽 매거진"],
    ],
  },
  {
    title: "서비스",
    links: [
      ["pricing", "요금제"],
      ["mypage", "마이페이지"],
      ["about", "소개"],
    ],
  },
  {
    title: "정책 · 정보",
    links: [
      ["privacy", "개인정보처리방침"],
      ["terms", "이용약관"],
      ["editorial-policy", "편집 원칙"],
      ["image-credits", "이미지 출처"],
      ["contact", "문의"],
    ],
  },
] as const;

export function ServiceFooter({
  variant = "public",
  landing = false,
  className,
}: {
  variant?: FooterVariant;
  landing?: boolean;
  className?: string;
}) {
  if (variant === "none") return null;

  if (variant === "app") {
    return (
      <footer
        className={cn(
          "mt-auto shrink-0 border-t border-zinc-200 bg-zinc-50 px-4 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 sm:px-6 lg:px-9",
          className
        )}
        data-footer-variant="app"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} OOM · 오픽온미</p>
          <nav aria-label="서비스 정보" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link
              to={viewPathForId.privacy}
              className="transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-indigo-400"
            >
              개인정보처리방침
            </Link>
            <Link
              to={viewPathForId.terms}
              className="transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-indigo-400"
            >
              이용약관
            </Link>
            <Link
              to={viewPathForId.contact}
              className="transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-indigo-400"
            >
              문의
            </Link>
            <Link
              to={viewPathForId.about}
              className="transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-indigo-400"
            >
              소개
            </Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        landing
          ? "relative z-10 w-full border-t border-white/10 bg-zinc-950 px-5 py-9 text-zinc-400 sm:px-9"
          : "mt-auto shrink-0 border-t border-zinc-200 bg-zinc-50 px-4 py-8 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 sm:px-6 lg:px-9",
        className
      )}
      data-footer-variant="public"
    >
      <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          <Link
            to={viewPathForId.home}
            className="inline-block rounded-sm text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            OOM · 오픽온미
          </Link>
          <p className="text-xs leading-6">외울 건 줄이고, 실전은 더 많이.</p>
          <p className="text-xs">© {new Date().getFullYear()} 오픽온미</p>
        </div>
        <nav aria-label="서비스 정보" className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2
                className={`mb-3 text-xs font-bold ${
                  landing ? "text-zinc-200" : "text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {group.title}
              </h2>
              <ul className="space-y-1">
                {group.links.map(([view, label]) => (
                  <li key={view}>
                    <Link
                      to={viewPathForId[view]}
                      className="inline-block rounded-sm py-1.5 text-xs leading-5 transition-colors hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
