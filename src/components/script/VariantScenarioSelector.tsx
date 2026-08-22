import type { ScriptVariant } from "../../types";
import { Badge } from "../ui/Badge";

type VariantScenarioSelectorProps = {
  ariaLabel: string;
  variants: ScriptVariant[];
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
};

export function VariantScenarioSelector({
  ariaLabel,
  variants,
  selectedVariantId,
  onSelect,
}: VariantScenarioSelectorProps) {
  return (
    <div
      aria-label={ariaLabel}
      className="mt-5 flex snap-x gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4"
    >
      {variants.map((variant, index) => {
        const active = variant.id === selectedVariantId;
        return (
          <button
            aria-pressed={active}
            className={`min-w-40 snap-start rounded-md border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:min-w-0 ${
              active
                ? "border-indigo-500 bg-indigo-50 shadow-sm dark:border-indigo-500 dark:bg-indigo-950"
                : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
            }`}
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            type="button"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-wide text-zinc-400">#{index + 1}</span>
              <Badge tone={active ? "indigo" : "default"}>{variant.questionType}</Badge>
            </div>
            <p className="mt-2 text-xs font-bold leading-5 text-zinc-900 dark:text-white">{variant.label}</p>
          </button>
        );
      })}
    </div>
  );
}
