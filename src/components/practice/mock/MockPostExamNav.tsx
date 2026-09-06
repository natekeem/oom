import { BarChart3, FileText, Headphones } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Card } from "../../ui/Card";

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
    <Card className="p-1.5" data-step-accent="none">
      <div aria-label="모의고사 결과 보기" className="grid grid-cols-3 gap-1" role="tablist">
        {items.map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <button
              aria-selected={selected}
              className={cn(
                "flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:gap-2 sm:text-sm",
                selected
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
              )}
              key={id}
              onClick={() => onChange(id)}
              role="tab"
              type="button"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
