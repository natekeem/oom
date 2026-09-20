import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { PageWidth } from "./layoutConfig";

export type PageContainerProps = {
  children: ReactNode;
  className?: string;
  width?: PageWidth;
};

export const pageFrameClasses: Record<PageWidth, string> = {
  narrow: "max-w-4xl px-4 sm:px-6 lg:px-8",
  default: "max-w-7xl px-4 sm:px-6 lg:px-9",
  wide: "max-w-[1440px] px-4 sm:px-6 lg:px-8",
  immersive: "max-w-none w-full px-3 sm:px-5 lg:px-8",
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
        pageFrameClasses[width],
        width === "immersive" ? "py-4 sm:py-6" : "py-6 lg:py-8",
        className
      )}
      data-page-width={width}
    >
      {children}
    </div>
  );
}
