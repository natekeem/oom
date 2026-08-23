import type { AboutLevelOption } from "./types";

type Props<TLevelId extends string> = {
  levels: AboutLevelOption<TLevelId>[];
  selectedId: TLevelId;
  focused: boolean;
  onFocusPanel: () => void;
  onSelect: (id: TLevelId) => void;
};

export function AboutLevelSelector<TLevelId extends string>({
  levels,
  selectedId,
  focused,
  onFocusPanel,
  onSelect,
}: Props<TLevelId>) {
  return (
    <article
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-[17px] border p-4 transition-[border,background-color] duration-200 ${
        focused 
          ? "border-emerald-500 bg-emerald-50/50 dark:border-[#45c895] dark:bg-[#121d1a]" 
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#11131a]"
      }`}
      aria-labelledby="about-level-heading"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-level-option]")) return;
        onFocusPanel();
      }}
    >
      <div
        className={`pointer-events-none absolute -bottom-[105px] -right-[100px] h-[170px] w-[170px] rounded-full border transition-colors duration-200 ${
          focused ? "border-emerald-500/20 dark:border-[#45c895]/20" : "border-transparent"
        }`}
      />
      <div className="flex items-center justify-between text-zinc-500 dark:text-[#a1a8b6]">
        <b className="text-[10px] tracking-[0.15em]">LEVEL</b>
        <span className="rounded-full border border-zinc-200 px-1.5 py-0.5 text-[8px] tracking-[0.1em] dark:border-[#303440] dark:text-[#858c9b]">HOW MUCH</span>
      </div>

      <h2 id="about-level-heading" className="mt-2 text-[20px] font-bold tracking-tight text-zinc-900 dark:text-white">얼마나 깊게 말할지</h2>
      <p className="text-[11px] leading-[1.45] text-zinc-600 dark:text-[#858d9d]">같은 장면의 길이와 구체성을 목표에 맞게 조절합니다.</p>

      <div className="mt-auto flex flex-col gap-1.5 pt-2.5" aria-label="Level 선택">
        {levels.map((level) => {
          const selected = level.id === selectedId;

          return (
            <button
              key={level.id}
              type="button"
              data-level-option
              className={`relative z-10 flex w-full items-center justify-between overflow-hidden rounded-lg border px-2.5 py-2 text-left transition duration-150 min-w-0 ${
                selected
                  ? "border-emerald-500 bg-emerald-100 text-emerald-900 dark:border-[#47c393] dark:bg-[#16231f] dark:text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-[#2d3039] dark:bg-[#161820] dark:text-[#aeb3c0] dark:hover:border-[#4d5260] dark:hover:bg-[#191b24] dark:hover:text-white"
              }`}
              aria-pressed={selected}
              onClick={() => onSelect(level.id)}
            >
              <div className="flex w-full min-w-0 items-center justify-between gap-2">
                <strong className="truncate text-[11px] font-bold">
                  {level.sectionLabel} · {level.label}
                </strong>
                <small className="shrink-0 text-[9px] text-zinc-500 dark:text-[#7f8797]">
                  {level.targetSecondsLabel}
                </small>
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}
