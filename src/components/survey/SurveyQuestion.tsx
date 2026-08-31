import { Check } from "lucide-react";
import type { BackgroundSurveyOption, BackgroundSurveySection } from "../../data/fixedSurvey";

export type SurveyQuestionMode = "guide" | "practice";

type SurveyQuestionProps = {
  mode: SurveyQuestionMode;
  onChange: (section: BackgroundSurveySection, option: BackgroundSurveyOption) => void;
  section: BackgroundSurveySection;
  selected: Set<string>;
  recommendedSet: Set<string>;
  gridClass?: string;
  validationMessage?: string;
};

export function SurveyQuestion({
  mode,
  onChange,
  section,
  selected,
  recommendedSet,
  gridClass,
  validationMessage,
}: SurveyQuestionProps) {
  const isPractice = mode === "practice";

  return (
    <section
      aria-labelledby={`${section.id}-title`}
      className="border-b border-zinc-200 pb-6 last:border-b-0 dark:border-zinc-800"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-sm font-bold text-zinc-950 dark:text-white">{section.part}</p>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100" id={`${section.id}-title`}>
          {section.title}
          {section.minSelections ? (
            <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ({section.minSelections}개 이상)
            </span>
          ) : null}
        </h2>
      </div>
      <div className={`mt-4 grid gap-2.5 ${gridClass ?? "sm:grid-cols-2 xl:grid-cols-3"}`}>
        {section.options.map((item) => {
          const checked = selected.has(item.id);
          const isRecommended = recommendedSet.has(item.id);
          return (
            <label
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-xs leading-5 transition-colors ${
                !isPractice && isRecommended
                  ? "bg-indigo-50/80 font-semibold text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-100"
                  : checked
                    ? "bg-indigo-50/50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
              } ${isPractice ? "cursor-pointer" : "cursor-default"}`}
              key={item.id}
            >
              <input
                aria-label={item.label}
                checked={checked}
                className="sr-only"
                disabled={!isPractice}
                name={section.id}
                onChange={() => onChange(section, item)}
                type={section.selection === "single" ? "radio" : "checkbox"}
              />
              <span
                aria-hidden="true"
                className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors ${
                  section.selection === "single" ? "rounded-full" : "rounded-sm"
                } ${
                  checked
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950"
                }`}
              >
                {checked ? (
                  section.selection === "single" ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  )
                ) : null}
              </span>
              <span className="select-none">{item.label}</span>
            </label>
          );
        })}
      </div>
      {validationMessage ? (
        <p className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300">{validationMessage}</p>
      ) : null}
    </section>
  );
}
