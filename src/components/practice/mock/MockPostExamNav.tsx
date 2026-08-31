import { BarChart3, FileText, Headphones } from "lucide-react";
import { cn } from "../../../lib/utils";

export type MockPostExamView = "summary" | "review" | "report";

const items = [
  { id: "summary" as const, label: "결과 요약", icon: BarChart3 },
  { id: "review" as const, label: "답변 복기", icon: Headphones },
  { id: "report" as const, label: "훈련 리포트", icon: FileText },
];

export function MockPostExamNav({
  active,
  onChange,
}: {
  active: MockPostExamView;
  onChange: (view: MockPostExamView) => void;
}) {
  return (
    <nav
      aria-label="모의고사 결과 화면"
      className="flex w-full gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {items.map(({ id, label, icon: Icon }) => (
        <button
          aria-current={active === id ? "page" : undefined}
          className={cn(
            "inline-flex h-10 min-w-max flex-1 items-center justify-center gap-2 rounded-md px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            active === id
              ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white",
          )}
          key={id}
          onClick={() => onChange(id)}
          type="button"
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
