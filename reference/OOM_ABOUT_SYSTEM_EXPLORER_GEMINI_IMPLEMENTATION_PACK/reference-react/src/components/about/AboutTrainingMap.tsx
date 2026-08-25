import type { AboutFocusMode } from "./types";

type Props = {
  courseLabel: string;
  levelSectionLabel: string;
  levelLabel: string;
  targetSecondsLabel: string;
  focusMode: AboutFocusMode;
};

function moduleClass(
  category: "course" | "level" | "both",
  focusMode: AboutFocusMode,
) {
  const active =
    focusMode === "all" ||
    category === "both" ||
    category === focusMode;

  return ["about-map-module", active ? "is-active" : ""].join(" ");
}

export function AboutTrainingMap({
  courseLabel,
  levelSectionLabel,
  levelLabel,
  targetSecondsLabel,
  focusMode,
}: Props) {
  return (
    <section className="about-system-map" aria-label="OOM 훈련 시스템">
      <header className="about-system-map__header">
        <strong>OOM TRAINING SYSTEM</strong>
        <span>{focusMode.toUpperCase()} FOCUS</span>
      </header>

      <div className="about-context">
        <div>
          <b>TRAINING CONTEXT</b>
          <strong>
            {courseLabel} × {levelSectionLabel}
          </strong>
        </div>
        <small>
          {levelLabel} · {targetSecondsLabel}
        </small>
      </div>

      <div className="about-system-map__grid">
        <div>
          <article className={moduleClass("course", focusMode)}>
            <b>STEP 2</b>
            <strong>추천 서베이</strong>
            <small>Course가 준비할 범위를 정합니다.</small>
          </article>

          <article className={moduleClass("course", focusMode)}>
            <b>STORY POOL</b>
            <strong>핵심 장면</strong>
            <small>같은 story를 여러 질문에 재사용합니다.</small>
          </article>

          <article className={moduleClass("level", focusMode)}>
            <b>STEP 3</b>
            <strong>난이도</strong>
            <small>Level이 질문 복잡도를 조절합니다.</small>
          </article>
        </div>

        <div className="about-system-map__hub" aria-hidden="true">
          O
        </div>

        <div>
          <article className={moduleClass("both", focusMode)}>
            <b>STEP 4</b>
            <strong>스크립트 · 질문 변형</strong>
            <small>Course의 사실을 Level 밀도로 말합니다.</small>
          </article>

          <article className={moduleClass("level", focusMode)}>
            <b>ANSWER DENSITY</b>
            <strong>길이 · 구체성</strong>
            <small>
              {levelSectionLabel} · {targetSecondsLabel}
            </small>
          </article>

          <article className={moduleClass("both", focusMode)}>
            <b>STEP 6</b>
            <strong>실전 연습</strong>
            <small>Listen → Speak → Review → Retry</small>
          </article>
        </div>
      </div>

      <div className="about-system-map__bottom">
        <div className="about-step-rail">
          <b>6 STEP TRAINING PATH</b>
          <div>
            {["목표·코스", "서베이", "난이도", "스크립트", "롤플레이", "실전"].map(
              (label, index) => (
                <span key={label} className={focusMode === "all" ? "is-active" : ""}>
                  {index + 1}
                  <small>{label}</small>
                </span>
              ),
            )}
          </div>
        </div>

        <div
          className={[
            "about-ai-coach",
            focusMode === "level" || focusMode === "all" ? "is-active" : "",
          ].join(" ")}
        >
          <b>AI COACH</b>
          <div>
            <span>KEEP</span>
            <span>FIX</span>
            <span>RETRY</span>
          </div>
        </div>
      </div>
    </section>
  );
}
