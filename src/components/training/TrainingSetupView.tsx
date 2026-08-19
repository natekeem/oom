import { useState } from 'react';
import type { TrainingLevelDefinition, TrainingCourseDefinition, TrainingLevelId, TrainingCourseId } from '../../training/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type Props = {
  levels: TrainingLevelDefinition[];
  courses: TrainingCourseDefinition[];
  onConfirm: (selection: { levelId: TrainingLevelId; courseId: TrainingCourseId }) => void;
};

export function TrainingSetupView({ levels, courses, onConfirm }: Props) {
  const [levelId, setLevelId] = useState<TrainingLevelId | null>(null);
  const [courseId, setCourseId] = useState<TrainingCourseId | null>(null);

  const sortedLevels = [...levels].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-8">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">OPIc 실전 훈련하기</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">목표 구간을 먼저 정하세요</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">자신에게 맞는 목표 구간과 코스를 선택하여 훈련을 시작하세요. (추후 변경 가능)</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-zinc-950 dark:text-white mb-4">1. 목표 구간 선택</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {sortedLevels.map(level => {
            const isSelected = levelId === level.id;
            return (
              <button
                key={level.id}
                aria-pressed={isSelected}
                onClick={() => setLevelId(level.id)}
                className={`flex h-full flex-col p-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md border shadow-sm ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30" 
                    : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="font-bold text-zinc-950 dark:text-white">{level.displayName}</span>
                  <Badge tone="indigo">{level.targetLabel}</Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-auto">난이도 설정: {level.difficulty.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {levelId && (
        <section>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white mb-4">2. 학습 코스 선택</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map(course => {
              const isSelected = courseId === course.id;
              return (
                <button
                  key={course.id}
                  aria-pressed={isSelected}
                  onClick={() => setCourseId(course.id)}
                  className={`flex h-full flex-col p-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md border shadow-sm ${
                    isSelected 
                      ? "border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30" 
                      : "border-zinc-200 bg-white hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-zinc-950 dark:text-white">{course.title}</span>
                    {course.recommendedBadge && <Badge tone="emerald">{course.recommendedBadge}</Badge>}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{course.subtitle}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button 
          className="w-full md:w-auto" 
          disabled={!levelId || !courseId}
          onClick={() => {
            if (levelId && courseId) onConfirm({ levelId, courseId });
          }}
        >
          이 구성으로 학습 시작
        </Button>
      </div>
    </div>
  );
}
