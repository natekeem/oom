import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { PageWidth } from "./layoutConfig";

export type PageContainerProps = {
  children: ReactNode;
  className?: string;
  width?: PageWidth;
};

const widthClasses: Record<PageWidth, string> = {
  narrow: "max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
  default: "max-w-7xl px-4 py-6 sm:px-6 lg:px-9 lg:py-8",
  wide: "max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
  immersive: "max-w-none w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-6",
};

export function PageContainer({
  children,
  className,
  width = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "oom-content-shell mx-auto w-full min-w-0 flex-1 flex flex-col",
        widthClasses[width],
        className
      )}
      data-page-width={width}
    >
      {children}
    </div>
  );
}
