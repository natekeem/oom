import { ArrowRight, BookOpenText, ChartNoAxesCombined, ClipboardList, Mic, SlidersHorizontal } from "lucide-react";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { discoveredCourses } from "../../training/courseRegistry";
import { TRAINING_LEVELS } from "../../training/levels";
import { TrainingSetupView } from "./TrainingSetupView";

const trainingSteps: Array<{ id: ViewId; title: string; description: string; icon: typeof ClipboardList; badge: string }> = [
  { id: "survey", title: "STEP 1. 서베이 고정", description: "실제형 설문에서 OOM 추천 조합을 확인하고, 연습 모드에서 직접 체크해 봅니다.", icon: ClipboardList, badge: "설문 통제" },
  { id: "difficulty", title: "STEP 2. 난이도 설정", description: "목표 등급과 현재 말하기 부담을 기준으로 5-5 설정을 이해합니다.", icon: SlidersHorizontal, badge: "난이도" },
  { id: "script-hub", title: "STEP 3. 만능 스크립트", description: "한 그룹에서 내 입에 붙는 한 장면을 선택하고 질문별로 변형합니다.", icon: BookOpenText, badge: "스토리" },
  { id: "roleplay-hub", title: "STEP 4. 롤플레이 공식", description: "문제 설명, 정보 질문, 대안 요청을 6단계 공식으로 연습합니다.", icon: ChartNoAxesCombined, badge: "문제 해결" },
  { id: "practice", title: "STEP 5. 실전 연습", description: "랜덤 질문, 타이머, 녹음과 텍스트 답변 피드백으로 실전 흐름을 반복합니다.", icon: Mic, badge: "실전" },
];

export function TrainingHub({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const { selection, select, clear } = useTrainingSelection();

  if (!selection) {
    return (
      <TrainingSetupView 
        levels={TRAINING_LEVELS} 
        courses={discoveredCourses} 
        onConfirm={select} 
      />
    );
  }

  const selectedLevel = TRAINING_LEVELS.find(l => l.id === selection.levelId);
  const selectedCourse = discoveredCourses.find(c => c.id === selection.courseId);

  return (
    <div className="space-y-6">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">현재 선택된 학습 구성</p>
          <p className="mt-1 font-bold text-zinc-950 dark:text-white">
            {selectedLevel?.displayName} {selectedLevel?.targetGrades[0]} · {selectedCourse?.title}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={clear}>
          구간/코스 변경
        </Button>
      </section>

      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">OPIc 실전 훈련하기</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">서베이부터 실전 답변까지, 같은 흐름으로 반복합니다.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">OOM의 훈련은 답변을 많이 모으는 방식보다, 선택한 서베이와 한 장면의 스토리를 일관되게 연결하는 방식입니다. STEP 1부터 순서대로 진행해도 되고, 오늘 필요한 단계부터 바로 들어가도 됩니다.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trainingSteps.map((step, index) => {
          const Icon = step.icon;
          return <Card className="flex h-full flex-col p-5" key={step.id}><div className="flex items-center justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Icon className="h-5 w-5" /></span><Badge tone={index < 2 ? "indigo" : index === 4 ? "emerald" : "amber"}>{step.badge}</Badge></div><h2 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">{step.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{step.description}</p><Button className="mt-6 w-full" onClick={() => onNavigate(step.id)} variant="secondary">이 단계 열기 <ArrowRight className="h-4 w-4" /></Button></Card>;
        })}
      </section>

      <Card className="border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"><p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">오늘의 권장 루틴</p><p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200">처음이라면 STEP 1 → 2 → 3 순서로 기준을 고정하고, 그 다음 STEP 5에서 90초 답변을 녹음해 보세요. 롤플레이는 별도 암기 목록이 아니라 요청과 대안 제시의 순서를 몸에 익히는 훈련입니다.</p></Card>
    </div>
  );
}
