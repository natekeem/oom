import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import type {
  TrainingCourseDefinition,
  TrainingCourseId,
  TrainingLevelDefinition,
  TrainingLevelId,
} from "../../training/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type Props = {
  levels: TrainingLevelDefinition[];
  courses: TrainingCourseDefinition[];
  currentSelection?: { levelId: TrainingLevelId; courseId: TrainingCourseId } | null;
  onConfirm: (selection: { levelId: TrainingLevelId; courseId: TrainingCourseId }) => void;
  onContinueToNextStep?: () => void;
};

export function TrainingSetupView({
  levels,
  courses,
  currentSelection,
  onConfirm,
  onContinueToNextStep,
}: Props) {
  const [levelId, setLevelId] = useState<TrainingLevelId | null>(
    () => currentSelection?.levelId ?? null
  );
  const [courseId, setCourseId] = useState<TrainingCourseId | null>(
    () => currentSelection?.courseId ?? null
  );
  const [isEditing, setIsEditing] = useState(false);

  const sortedLevels = [...levels].sort((a, b) => a.displayOrder - b.displayOrder);

  const activeSavedLevel = currentSelection
    ? levels.find((l) => l.id === currentSelection.levelId)
    : null;
  const activeSavedCourse = currentSelection
    ? courses.find((c) => c.id === currentSelection.courseId)
    : null;

  const hasSelectionChanged =
    currentSelection &&
    (levelId !== currentSelection.levelId || courseId !== currentSelection.courseId);

  const handleSave = () => {
    if (levelId && courseId) {
      onConfirm({ levelId, courseId });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">STEP 1. 목표 구간 · 코스 설정</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          목표 구간과 학습 코스를 먼저 설정합니다.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          목표 등급에 따라 서베이 추천 조합과 스크립트 발화량, 롤플레이 및 실전 연습 질문이 자동으로 구성됩니다.
          훈련 도중 언제든지 설정을 변경할 수 있습니다.
        </p>
      </section>

      {currentSelection && activeSavedLevel && activeSavedCourse && !isEditing ? (
        <Card className="border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  현재 학습 설정
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xl font-bold text-zinc-950 dark:text-white">
                  {activeSavedLevel.displayName} · {activeSavedLevel.targetLabel}
                </p>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <p className="text-xl font-bold text-zinc-950 dark:text-white">
                  {activeSavedCourse.title}
                </p>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                난이도 권장 설정: <strong>{activeSavedLevel.difficulty.label}</strong> · {activeSavedCourse.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
              >
                목표/코스 변경
              </Button>
              {onContinueToNextStep ? (
                <Button onClick={onContinueToNextStep}>
                  STEP 2 서베이 고정으로 계속 <ArrowRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      {(!currentSelection || isEditing) && (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                1. 목표 구간 선택
              </h2>
              {isEditing && currentSelection ? (
                <Button
                  onClick={() => {
                    setLevelId(currentSelection.levelId);
                    setCourseId(currentSelection.courseId);
                    setIsEditing(false);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  변경 취소
                </Button>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {sortedLevels.map((level) => {
                const isSelected = levelId === level.id;
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`flex h-full flex-col rounded-md border p-5 text-left shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-indigo-500"
                        : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
                    }`}
                    key={level.id}
                    onClick={() => setLevelId(level.id)}
                    type="button"
                  >
                    <div className="mb-3 flex w-full items-center justify-between">
                      <span className="font-bold text-zinc-950 dark:text-white">
                        {level.displayName}
                      </span>
                      <Badge tone={isSelected ? "indigo" : "default"}>{level.targetLabel}</Badge>
                    </div>
                    <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      {level.disclaimer}
                    </p>
                    <p className="mt-4 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      권장 난이도: {level.difficulty.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {levelId && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-zinc-950 dark:text-white">
                2. 학습 코스 선택
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {courses.map((course) => {
                  const isSelected = courseId === course.id;
                  return (
                    <button
                      aria-pressed={isSelected}
                      className={`flex h-full flex-col rounded-md border p-5 text-left shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-950/40 ring-1 ring-emerald-500"
                          : "border-zinc-200 bg-white hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
                      }`}
                      key={course.id}
                      onClick={() => setCourseId(course.id)}
                      type="button"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="font-bold text-zinc-950 dark:text-white">
                          {course.title}
                        </span>
                        {course.recommendedBadge && (
                          <Badge tone="emerald">{course.recommendedBadge}</Badge>
                        )}
                      </div>
                      <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                        {course.subtitle}
                      </p>
                      <p className="mt-3 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {course.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <Button
              className="w-full md:w-auto"
              disabled={!levelId || !courseId}
              onClick={handleSave}
            >
              {currentSelection && hasSelectionChanged ? "설정 변경 저장" : "이 구성으로 학습 시작"}
            </Button>
            {currentSelection && isEditing ? (
              <Button
                onClick={() => {
                  setLevelId(currentSelection.levelId);
                  setCourseId(currentSelection.courseId);
                  setIsEditing(false);
                }}
                variant="secondary"
              >
                취소
              </Button>
            ) : null}
          </div>
        </>
      )}

      <Card className="border-indigo-100 bg-indigo-50/30 p-5 dark:border-indigo-950 dark:bg-indigo-950/20">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
              OOM 6 STEP 훈련 구조 안내
            </p>
            <p className="text-xs leading-5 text-indigo-800/90 dark:text-indigo-200/90">
              STEP 1 목표/코스 설정 → STEP 2 서베이 고정 → STEP 3 난이도 설정 → STEP 4 만능 스크립트 → STEP 5 롤플레이 공식 → STEP 6 실전 연습으로 이어집니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
