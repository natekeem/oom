import {
  ArrowRight,
  BookOpenText,
  ChartNoAxesCombined,
  ClipboardList,
  Mic,
  SlidersHorizontal,
} from "lucide-react";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { discoveredCourses } from "../../training/courseRegistry";
import { TRAINING_LEVELS } from "../../training/levels";
import { TrainingSetupView } from "./TrainingSetupView";

const subsequentSteps: Array<{
  id: ViewId;
  stepNum: string;
  title: string;
  description: string;
  icon: typeof ClipboardList;
  badge: string;
}> = [
  {
    id: "survey",
    stepNum: "STEP 2",
    title: "서베이 고정",
    description: "실제형 설문에서 현재 코스 맞춤 추천 조합을 확인하고 직접 연습합니다.",
    icon: ClipboardList,
    badge: "설문 통제",
  },
  {
    id: "difficulty",
    stepNum: "STEP 3",
    title: "난이도 설정",
    description: "선택한 구간에 맞는 난이도(5-5, 4-4, 3-3) 설정과 평가 기준을 파악합니다.",
    icon: SlidersHorizontal,
    badge: "난이도",
  },
  {
    id: "script-hub",
    stepNum: "STEP 4",
    title: "만능 스크립트",
    description: "코스별 4대 핵심 장면을 훈련하고 질문 변형 및 답변 설계도를 익힙니다.",
    icon: BookOpenText,
    badge: "스토리",
  },
  {
    id: "roleplay-hub",
    stepNum: "STEP 5",
    title: "롤플레이 공식",
    description: "6단계 문제 해결 공식, 만능 표현과 코스별 실전 돌발 상황을 대비합니다.",
    icon: ChartNoAxesCombined,
    badge: "돌발 해결",
  },
  {
    id: "practice",
    stepNum: "STEP 6",
    title: "실전 연습",
    description: "랜덤 질문, 90초 타이머, 실시간 녹음 및 AI 맞춤 피드백으로 최종 훈련합니다.",
    icon: Mic,
    badge: "실전",
  },
];

export function TrainingHub({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const { selection, select } = useTrainingSelection();

  return (
    <div className="space-y-8">
      <TrainingSetupView
        courses={discoveredCourses}
        currentSelection={selection}
        levels={TRAINING_LEVELS}
        onConfirm={select}
        onContinueToNextStep={() => onNavigate("survey")}
      />

      <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            OPIc 실전 훈련 6 STEP 로드맵
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            목표 구간과 코스를 정한 후 순서대로 진행하거나 원하는 단계로 바로 이동할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subsequentSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card className="flex h-full flex-col p-5" key={step.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="indigo">{step.stepNum}</Badge>
                    <Badge tone={index < 2 ? "default" : index === 4 ? "emerald" : "amber"}>
                      {step.badge}
                    </Badge>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {step.description}
                </p>
                <Button
                  className="mt-6 w-full"
                  onClick={() => onNavigate(step.id)}
                  variant="secondary"
                >
                  {step.stepNum} 이동 <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
