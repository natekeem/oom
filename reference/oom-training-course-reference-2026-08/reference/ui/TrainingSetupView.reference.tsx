import { useState } from "react";
import type {
  TrainingCourseDefinition,
  TrainingLevelDefinition,
  TrainingLevelId,
} from "../trainingTypes.reference";

type Props = {
  levels: TrainingLevelDefinition[];
  courses: TrainingCourseDefinition[];
  onConfirm: (selection: {
    levelId: TrainingLevelId;
    courseId: TrainingCourseDefinition["id"];
  }) => void;
};

/**
 * Reference UI only.
 * Match the repository's actual design tokens/classes.
 * Two decisions only: Level -> Course.
 * Do NOT add Story A/B.
 */
export function TrainingSetupView({ levels, courses, onConfirm }: Props) {
  const [levelId, setLevelId] = useState<TrainingLevelId | null>(null);
  const [courseId, setCourseId] =
    useState<TrainingCourseDefinition["id"] | null>(null);

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm font-medium">OPIc 실전 훈련하기</p>
        <h1 className="mt-2 text-3xl font-bold">목표 구간을 먼저 정하세요</h1>
        <p className="mt-2 text-sm opacity-70">
          같은 코스를 유지한 채 상위 구간으로 올라가면 같은 이야기에
          새로운 말하기 기능을 더할 수 있습니다.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {levels
          .slice()
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((level) => (
            <button
              key={level.id}
              type="button"
              aria-pressed={level.id === levelId}
              onClick={() => {
                setLevelId(level.id);
                setCourseId(null);
              }}
              className="rounded-2xl border p-5 text-left focus:outline-none focus:ring-2"
            >
              <div className="text-sm font-semibold">{level.displayName}</div>
              <div className="mt-1 text-xl font-bold">{level.targetLabel}</div>
              <div className="mt-3 text-sm opacity-70">
                난이도 {level.difficulty.label}
              </div>
            </button>
          ))}
      </div>

      {levelId && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">훈련 코스를 선택하세요</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                aria-pressed={course.id === courseId}
                onClick={() => setCourseId(course.id)}
                className="rounded-2xl border p-5 text-left focus:outline-none focus:ring-2"
              >
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold">{course.title}</div>
                  {course.recommendedBadge && (
                    <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                      {course.recommendedBadge}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm opacity-70">{course.subtitle}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!levelId || !courseId}
        onClick={() => levelId && courseId && onConfirm({ levelId, courseId })}
        className="rounded-xl border px-5 py-3 font-semibold disabled:opacity-50"
      >
        이 구성으로 학습 시작
      </button>
    </section>
  );
}
