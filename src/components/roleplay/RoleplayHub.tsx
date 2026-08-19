import { ArrowRight, ChartNoAxesCombined, CircleHelp, House, MapPinned, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const roleplaySlotViewIds: ViewId[] = [
  "roleplay-travel",
  "roleplay-indoor",
  "roleplay-sports",
  "roleplay-home",
];

const slotIcons: LucideIcon[] = [MapPinned, CircleHelp, Trophy, House];

export function RoleplayHub({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const { selection } = useTrainingSelection();
  let resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;

  if (!resolved) {
    resolved = resolveTrainingContext("course-1", "advanced");
  }

  return (
    <div className="space-y-6">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">STEP 4. 롤플레이 공식</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          문제를 설명하고, 대안을 요청하고, 정중하게 마무리합니다.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          {resolved.course.title} ({resolved.level.displayName})의 롤플레이 상황을 6단계 공식으로 해결하는
          연습입니다. 서로 다른 서비스 상황을 공식과 함께 반복 훈련하세요.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="flex h-full flex-col p-5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <ChartNoAxesCombined className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">공식 · 출제 구조</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            6단계 공식, 만능 표현, 전체 질문 구성에서의 롤플레이 대비법
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => onNavigate("roleplay-formula")}
            variant="secondary"
          >
            공식 및 출제 구조 보기 <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        {resolved.roleplays.map((rp, idx) => {
          const Icon = slotIcons[idx] ?? CircleHelp;
          const viewId = roleplaySlotViewIds[idx] ?? "roleplay-travel";
          return (
            <Card className="flex h-full flex-col p-5" key={rp.id}>
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <Icon className="h-5 w-5" />
                </span>
                <Badge tone="indigo">{rp.group}</Badge>
              </div>
              <h2 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">{rp.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{rp.situation}</p>
              <Button className="mt-6 w-full" onClick={() => onNavigate(viewId)} variant="secondary">
                {rp.group} 롤플레이 보기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}
      </section>

      <Card className="border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">연습 권장량</p>
            <p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
              {resolved.course.title} 코스의 대표 상황들을 반복하세요. 모든 상황을 암기하기보다 문제
              설명, 정보 질문, 대안 요청의 순서를 자동화하는 것이 핵심입니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
