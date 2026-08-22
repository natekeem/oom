import { cn } from "../../lib/utils";

type OomBrandMarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "compact" | "wordmark";
};

const sizeClasses = {
  sm: "[--oom-mark-size:1.75rem]",
  md: "[--oom-mark-size:2.25rem]",
  lg: "[--oom-mark-size:2.75rem]",
};

export function OomBrandMark({ className, size = "md", variant = "compact" }: OomBrandMarkProps) {
  return (
    <span
      aria-label="OOM · OPIc On Me"
      className={cn("inline-flex items-center gap-2.5", sizeClasses[size], className)}
      role="img"
    >
      <svg
        aria-hidden="true"
        className="h-[var(--oom-mark-size)] w-[var(--oom-mark-size)] shrink-0"
        fill="none"
        viewBox="0 0 40 40"
      >
        <circle cx="20" cy="20" r="18.25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="7.25" stroke="currentColor" strokeWidth="2" />
        <path d="M20 3.25v4.5M20 32.25v4.5" stroke="currentColor" strokeLinecap="round" strokeOpacity=".45" />
      </svg>
      {variant === "wordmark" ? (
        <span aria-hidden="true" className="leading-none">
          <span className="block text-sm font-extrabold tracking-[0.18em]">OOM</span>
          <span className="mt-1 block text-[0.62rem] font-medium tracking-[0.08em] opacity-65">OPIc On Me</span>
        </span>
      ) : null}
    </span>
  );
}
