import {
  ArrowRight,
  BookOpenText,
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardList,
  Compass,
  Layers3,
  Mic,
  Route as RouteIcon,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { discoveredCourses } from "../../training/courseRegistry";
import { TRAINING_LEVELS } from "../../training/levels";

const trainingSteps: Array<{
  id: ViewId;
  stepNum: string;
  title: string;
  description: string;
  icon: typeof ClipboardList;
  badge: string;
}> = [
  {
    id: "training-setup",
    stepNum: "STEP 1",
    title: "목표 구간 · 코스 설정",
    description: "목표 등급과 사용할 이야기 세트를 정합니다.",
    icon: SlidersHorizontal,
    badge: "설정",
  },
  {
    id: "survey",
    stepNum: "STEP 2",
    title: "서베이 고정",
    description: "현재 코스가 최대한 재사용되도록 추천 서베이를 기억합니다.",
    icon: ClipboardList,
    badge: "설문 통제",
  },
  {
    id: "difficulty",
    stepNum: "STEP 3",
    title: "난이도 설정",
    description: "목표 구간에 맞는 답변 밀도와 권장 난이도를 이해합니다.",
    icon: SlidersHorizontal,
    badge: "난이도",
  },
  {
    id: "script-hub",
    stepNum: "STEP 4",
    title: "만능 스크립트",
    description: "몇 개의 핵심 장면을 질문별로 바꿔 말하는 법을 익힙니다.",
    icon: BookOpenText,
    badge: "스토리",
  },
  {
    id: "roleplay-hub",
    stepNum: "STEP 5",
    title: "롤플레이 공식",
    description: "상황 → 문제 → 질문 → 대안의 순서를 익혀 돌발 질문에 대응합니다.",
    icon: ChartNoAxesCombined,
    badge: "돌발 해결",
  },
  {
    id: "practice",
    stepNum: "STEP 6",
    title: "실전 연습",
    description: "랜덤 질문에 직접 말하고 녹음과 AI 피드백으로 점검합니다.",
    icon: Mic,
    badge: "실전",
  },
];

export function TrainingHub({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const { selection } = useTrainingSelection();

  const activeSavedLevel = selection
    ? TRAINING_LEVELS.find((l) => l.id === selection.levelId)
    : null;
  const activeSavedCourse = selection
    ? discoveredCourses.find((c) => c.id === selection.courseId)
    : null;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Layers3 className="h-5 w-5" />
          <Badge tone="indigo">OPIc 실전 훈련하기</Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          최소한의 스토리로, 더 많은 질문에 답하는 6 STEP 훈련
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          많은 답변을 외우는 대신 서베이를 전략적으로 고정하고, 하나의 장면을 여러 질문에 재사용하며,
          같은 이야기를 목표 등급에 맞게 성장시키는 훈련입니다.
        </p>
      </div>

      {/* Purpose / Concept / Method Compact Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Compass className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-white">훈련 목적</h2>
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            준비해야 할 이야기 수를 줄이고 같은 경험을 여러 질문에 활용합니다.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-white">코스 & 레벨 컨셉</h2>
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            <strong>Course</strong>는 서베이와 스토리 맥락을, <strong>Level</strong>은 발화 밀도와 난이도를 결정합니다.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <RouteIcon className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-white">학습 방법</h2>
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            목표/코스 설정 → 서베이 고정 → 난이도 이해 → 스토리 재사용 → 롤플레이 공식 → 실전 녹음/피드백
          </p>
        </Card>
      </div>

      {/* Active Selection Summary Card */}
      {selection && activeSavedLevel && activeSavedCourse ? (
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
                권장 난이도: <strong>{activeSavedLevel.difficulty.label}</strong> · {activeSavedCourse.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onNavigate("training-setup")}
                variant="secondary"
              >
                설정 변경
              </Button>
              <Button onClick={() => onNavigate("survey")}>
                STEP 2 서베이 고정으로 계속 <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                훈련을 시작하기 전에 목표 구간과 코스를 먼저 설정하세요.
              </p>
              <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                STEP 1에서 설정한 목표에 맞추어 맞춤 서베이, 스크립트 발화량, 롤플레이 및 실전 문제가 제공됩니다.
              </p>
            </div>
            <Button className="shrink-0" onClick={() => onNavigate("training-setup")}>
              STEP 1 목표/코스 설정하기 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* 6 STEP Roadmap Grid */}
      <section className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            OPIc 실전 훈련 6 STEP 로드맵
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            목표 구간과 코스를 정한 후 순서대로 진행하거나 원하는 단계로 바로 이동할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trainingSteps.map((step, index) => {
            const Icon = step.icon;
            const isStep1 = step.id === "training-setup";
            const needsSetup = !selection && !isStep1;

            return (
              <Card
                className={`flex h-full flex-col p-5 transition-colors ${
                  isStep1 && !selection
                    ? "border-indigo-400 bg-indigo-50/30 dark:border-indigo-600 dark:bg-indigo-950/20"
                    : ""
                }`}
                key={step.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-md ${
                      isStep1 && !selection
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={isStep1 && !selection ? "indigo" : "default"}>{step.stepNum}</Badge>
                    {needsSetup ? (
                      <Badge tone="amber">설정 필요</Badge>
                    ) : (
                      <Badge tone={index < 2 ? "default" : index === 5 ? "emerald" : "indigo"}>
                        {step.badge}
                      </Badge>
                    )}
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
                  variant={isStep1 && !selection ? "primary" : "secondary"}
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
