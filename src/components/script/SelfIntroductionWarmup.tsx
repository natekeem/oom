import { Mic2 } from "lucide-react";
import { Card } from "../ui/Card";
import {
  getSelfIntroduction,
  SELF_INTRODUCTION_COPY,
} from "../../data/training/selfIntroduction";
import type { TrainingLevelId } from "../../training/types";
import { TtsControls } from "./TtsControls";

type SelfIntroductionWarmupProps = {
  levelId: TrainingLevelId;
  levelLabel: string;
  onError: (message: string) => void;
};

export function SelfIntroductionWarmup({
  levelId,
  levelLabel,
  onError,
}: SelfIntroductionWarmupProps) {
  const content = getSelfIntroduction(levelId);

  return (
    <Card className="p-5 sm:p-6" data-testid="self-introduction-warmup">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Mic2 className="h-4 w-4" />
            <p className="text-[10px] font-extrabold tracking-[0.18em]">
              {SELF_INTRODUCTION_COPY.eyebrow}
            </p>
          </div>
          <h2 className="mt-1 text-lg font-bold text-zinc-950 dark:text-white sm:text-xl">
            {SELF_INTRODUCTION_COPY.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {SELF_INTRODUCTION_COPY.summary}
          </p>
        </div>
        <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          20–30초
        </span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-stretch">
        <section
          className="h-full min-w-0 rounded-md border border-zinc-200 bg-zinc-50/75 p-4 dark:border-zinc-800 dark:bg-zinc-950/70"
          data-testid="self-introduction-example-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
              현재 Level 예시 · {levelLabel}
            </p>
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
              {content.durationLabel}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            {content.description}
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-700 dark:text-zinc-200">
            {content.example}
          </p>
        </section>

        <div className="min-w-0 xl:h-full">
          <TtsControls
            audioLabel="WARM-UP AUDIO"
            className="xl:flex xl:h-full xl:flex-col xl:justify-center"
            levelId={levelId}
            onError={onError}
            playerActionLabel="자기소개 예시"
            requestPlayLabel="자기소개 예시 재생"
            showRateControl={false}
            testId="self-introduction-audio-controls"
            text={content.example}
          />
        </div>
      </div>
    </Card>
  );
}
