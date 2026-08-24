import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "./Badge";

type PageIntroProps = {
  className?: string;
  description: string;
  icon: LucideIcon;
  tag: string;
  title: string;
};

export function PageIntro({
  className,
  description,
  icon: Icon,
  tag,
  title,
}: PageIntroProps) {
  return (
    <header
      className={cn(
        "max-w-4xl border-l-4 border-indigo-500 py-1 pl-4 dark:border-indigo-400",
        className
      )}
      data-page-intro
    >
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
        <Badge tone="indigo">{tag}</Badge>
      </div>
      <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
        {description}
      </p>
    </header>
  );
}
