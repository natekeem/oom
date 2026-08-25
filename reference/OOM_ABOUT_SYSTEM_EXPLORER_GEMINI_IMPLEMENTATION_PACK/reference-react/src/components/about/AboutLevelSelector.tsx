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
    <section
      className={[
        "about-input-card about-input-card--level",
        focused ? "is-focused" : "",
      ].join(" ")}
      aria-labelledby="about-level-heading"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-level-option]")) return;
        onFocusPanel();
      }}
    >
      <div className="about-input-card__header">
        <span>LEVEL</span>
        <span>HOW MUCH</span>
      </div>

      <h2 id="about-level-heading">얼마나 깊게 말할지</h2>
      <p>같은 장면의 길이와 구체성을 목표에 맞게 조절합니다.</p>

      <div className="about-option-list" aria-label="Level 선택">
        {levels.map((level) => {
          const selected = level.id === selectedId;

          return (
            <button
              key={level.id}
              type="button"
              data-level-option
              className={[
                "about-option",
                selected ? "is-selected" : "",
              ].join(" ")}
              aria-pressed={selected}
              onClick={() => onSelect(level.id)}
            >
              <span>
                {level.sectionLabel} · {level.label}
              </span>
              <small>{level.targetSecondsLabel}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
