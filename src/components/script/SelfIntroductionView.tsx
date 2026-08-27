import { ArrowRight, BookOpenText } from "lucide-react";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";
import type { ViewId } from "../layout/Sidebar";
import { ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { SELF_INTRODUCTION_COPY } from "../../data/training/selfIntroduction";
import { SelfIntroductionWarmup } from "./SelfIntroductionWarmup";

type SelfIntroductionViewProps = {
  onNavigate?: (view: ViewId) => void;
  onToast: (title: string, description?: string, tone?: "success" | "error" | "info") => void;
};

export function SelfIntroductionView({ onNavigate, onToast }: SelfIntroductionViewProps) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 4. 만능 스크립트">
      {(resolved) => (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BookOpenText className="h-5 w-5" />
              <span className="text-sm font-semibold">STEP 4. 워밍업 · 자기소개</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
              첫 목소리와 호흡을 가볍게 맞춰 보세요.
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              메인 평가 문항이 아닌 짧은 워밍업입니다. 현재 Level 예시에서 내 상황에 맞는 단어만 바꾸며 15–30초 정도 편안하게 말해 보세요.
            </p>
          </div>

          <SelfIntroductionWarmup
            levelId={resolved.level.id}
            levelLabel={resolved.level.displayName}
            onError={(message) => onToast("자기소개 음성 재생 실패", message, "error")}
          />

          <Card
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            data-testid="self-introduction-guide-card"
          >
            <div className="min-w-0 max-w-3xl">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                문장을 외우기보다 내 말로 바꾸는 기준이 필요하신가요?
              </p>
              <div className="mt-1 space-y-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                <p>{SELF_INTRODUCTION_COPY.guide}</p>
                <p>{SELF_INTRODUCTION_COPY.helper}</p>
              </div>
            </div>
            <ButtonLink
              className="w-full shrink-0 justify-center sm:w-auto"
              size="sm"
              to={SELF_INTRODUCTION_COPY.magazinePath}
              variant="secondary"
            >
              자기소개 가이드 읽기 <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </Card>
        </div>
      )}
    </TrainingSelectionGuard>
  );
}
