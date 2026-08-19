import { ShieldAlert, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";
import type { ResolvedTrainingContext } from "../../training/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { ViewId } from "../layout/Sidebar";

type TrainingSelectionGuardProps = {
  children: (resolved: ResolvedTrainingContext) => ReactNode;
  onNavigate?: (view: ViewId) => void;
  stepName?: string;
};

export function TrainingSelectionGuard({
  children,
  onNavigate,
  stepName = "실전 훈련",
}: TrainingSelectionGuardProps) {
  const { selection } = useTrainingSelection();

  if (!selection) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
            <Badge tone="amber">훈련 설정 필요</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
            먼저 STEP 1에서 목표 구간과 훈련 코스를 설정해 주세요.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            {stepName} 단계는 목표 구간(난이도/답변 밀도)과 학습 코스(서베이·스토리라인) 설정이 필요합니다.
            STEP 1에서 구간과 코스를 선택하시면 맞춤 콘텐츠로 바로 훈련을 시작할 수 있습니다.
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-bold text-zinc-950 dark:text-white">
                  학습 구성이 아직 선택되지 않았습니다
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  1구간(AL), 2구간(IH/IM3), 3구간(IM2/IM1) 중 목표를 선택하세요.
                </p>
              </div>
            </div>
            {onNavigate ? (
              <Button
                className="shrink-0"
                onClick={() => onNavigate("training-setup")}
              >
                STEP 1 설정하러 가기 <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <a
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                href="/training/setup/"
              >
                STEP 1 설정하러 가기 <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const resolved = resolveTrainingContext(selection.courseId, selection.levelId);
  return <>{children(resolved)}</>;
}
