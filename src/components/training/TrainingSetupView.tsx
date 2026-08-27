import { ArrowRight, CheckCircle2, RotateCcw, SlidersHorizontal } from "lucide-react";
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
import { formatTrainingPreset } from "../../training/levels";

type Props = {
  levels: TrainingLevelDefinition[];
  courses: TrainingCourseDefinition[];
  currentSelection?: { levelId: TrainingLevelId; courseId: TrainingCourseId } | null;
  onConfirm: (selection: { levelId: TrainingLevelId; courseId: TrainingCourseId }) => void;
  onContinueToNextStep?: () => void;
  onReset?: () => void;
};

export function TrainingSetupView({
  levels,
  courses,
  currentSelection,
  onConfirm,
  onContinueToNextStep,
  onReset,
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

  const handleReset = () => {
    if (onReset) {
      onReset();
      setLevelId(null);
      setCourseId(null);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <SlidersHorizontal className="h-5 w-5" />
          <Badge tone="indigo">STEP 1. 목표 구간 · 코스 설정</Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          목표 구간과 학습 코스를 먼저 설정합니다.
        </h1>
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          목표 등급에 따라 서베이 추천 조합과 스크립트 발화량, 롤플레이 및 실전 연습 질문이 자동으로 구성됩니다.
          훈련 도중 언제든지 설정을 변경할 수 있습니다.
        </p>
      </div>

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
                {formatTrainingPreset(activeSavedLevel)} · 권장 난이도 <strong>{activeSavedLevel.difficulty.label}</strong>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onReset ? (
                <Button
                  onClick={handleReset}
                  variant="ghost"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  설정 초기화
                </Button>
              ) : null}
              <Button
                onClick={() => {
                  setLevelId(currentSelection.levelId);
                  setCourseId(currentSelection.courseId);
                  setIsEditing(true);
                }}
                variant="secondary"
              >
                목표/코스 변경
              </Button>
              {onContinueToNextStep ? (
                <Button onClick={onContinueToNextStep}>
                  STEP 2 추천 서베이 익히기로 이동 <ArrowRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      {(!currentSelection || isEditing) && (
        <>
          <section>
            <div className="mb-4 flex items-center justify-between">
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
                        ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 dark:border-indigo-500 dark:bg-indigo-950/40"
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
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">이런 분께 추천</p>
                    <ul className="mt-2 space-y-1.5">
                      {level.recommendedFor.map((item) => (
                        <li className="flex gap-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400" key={item}>
                          <span aria-hidden="true">·</span>{item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      권장 난이도 {level.difficulty.label} · OOM 연습 목표 {level.targetSeconds[0]}~{level.targetSeconds[1]}초
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">{level.disclaimer}</p>
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
                          ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/40"
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
                      <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{course.displaySummary}</p>
                      <p className="mt-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300">이런 분께 추천</p>
                      <ul className="mt-1.5 space-y-1">
                        {course.recommendedFor.map((item) => (
                          <li className="text-xs leading-5 text-zinc-500 dark:text-zinc-400" key={item}>· {item}</li>
                        ))}
                      </ul>
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
    </div>
  );
}
