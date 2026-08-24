import { Gauge, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import type { ViewId } from "../layout/Sidebar";
import type { ResolvedTrainingContext } from "../../training/types";
import { TRAINING_LEVELS, formatTrainingPreset } from "../../training/levels";
import { VoiceSettings } from "./VoiceSettings";

function DifficultyGuideContent({
  resolved,
}: {
  resolved: ResolvedTrainingContext;
}) {
  const currentLevel = resolved.level;
  const recommendedStart = currentLevel.difficulty.initial;
  const recommendedEnd = currentLevel.difficulty.second;

  const [start, setStart] = useState<number>(recommendedStart);
  const [end, setEnd] = useState<number>(recommendedEnd);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Gauge className="h-5 w-5" />
          <span className="text-sm font-semibold">STEP 3. 난이도 설정</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          질문 폭과 말하기 안정성의 균형을 잡습니다.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          낮은 난이도만 선택하면 복잡한 답변을 연습할 기회가 부족할 수 있습니다. 반대로 6-6은 길고
          추상적인 질문이 많아 초반에는 부담이 될 수 있습니다.{" "}
          <span className="font-semibold">참고: 난이도 설정만으로 등급이 결정되지는 않습니다.</span>
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
              {currentLevel.displayName} ({currentLevel.targetLabel}) 추천 설정
            </p>
          </div>
          <motion.p
            animate={{ scale: [1, 1.03, 1] }}
            className="mt-5 text-5xl font-bold text-indigo-700 dark:text-indigo-300"
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            {recommendedStart} <span className="text-indigo-300 dark:text-indigo-700">→</span>{" "}
            {recommendedEnd}
          </motion.p>
          <p className="mt-4 text-sm leading-6 text-indigo-800 dark:text-indigo-200">
            {currentLevel.disclaimer}
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">시험 난이도 선택 시뮬레이션</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            이 조작은 난이도 구조를 이해하기 위한 미리 보기이며, 현재 OOM Course × Level 학습 구성은 변경하지 않습니다.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <DifficultySlider
              label="첫 번째 난이도"
              onChange={setStart}
              recommended={recommendedStart}
              value={start}
            />
            <DifficultySlider
              label="두 번째 난이도"
              onChange={setEnd}
              recommended={recommendedEnd}
              value={end}
            />
          </div>
          <div className="mt-6 rounded-md bg-zinc-50 p-4 dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              현재 선택:{" "}
              <strong className="text-zinc-950 dark:text-white">
                {start} → {end}
              </strong>
            </p>
            {start === recommendedStart && end === recommendedEnd ? (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                추천 설정입니다. 스크립트 확장 연습을 시작하기 좋습니다.
              </p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                실제 시험 전에는 {recommendedStart} → {recommendedEnd}로도 한 번 모의 연습해 보세요.
              </p>
            )}
          </div>
        </Card>
      </div>
      <VoiceSettings />
      <section className="grid gap-5 lg:grid-cols-3">
        {TRAINING_LEVELS.map((level) => {
          const active = level.id === currentLevel.id;
          return <Card className={`p-5 ${active ? "border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-300 dark:border-indigo-700 dark:bg-indigo-950/30" : "opacity-70"}`} key={level.id}>
            <div className="flex flex-wrap items-center gap-2"><Badge tone={active ? "indigo" : "default"}>{active ? "현재 선택" : "참고"}</Badge><span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{formatTrainingPreset(level)}</span></div>
            <ul className="mt-4 space-y-3">
              {level.learningFocus.map((item) => (
                <li
                  className="flex gap-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
                  key={item}
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>;
        })}
      </section>
    </div>
  );
}

export function DifficultyGuide({ onNavigate }: { onNavigate?: (view: ViewId) => void }) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 3. 난이도 설정">
      {(resolved) => <DifficultyGuideContent resolved={resolved} />}
    </TrainingSelectionGuard>
  );
}

function DifficultySlider({
  label,
  value,
  recommended,
  onChange,
}: {
  label: string;
  value: number;
  recommended: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {label}
        <Badge tone={value === recommended ? "indigo" : "default"}>{value}</Badge>
      </span>
      <input
        aria-label={label}
        className="mt-4 w-full accent-indigo-600"
        max="6"
        min="1"
        onChange={(event) => onChange(Number(event.target.value))}
        step="1"
        type="range"
        value={value}
      />
      <span className="mt-1 flex justify-between text-[11px] text-zinc-400">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <span
            className={recommended === num ? "font-bold text-indigo-500" : ""}
            key={num}
          >
            {num}
          </span>
        ))}
      </span>
    </label>
  );
}
