import { ArrowRight, BookOpenText, CircleHelp, Layers3 } from "lucide-react";
import { useTrainingSelection } from "../../training/TrainingSelectionContext";
import { resolveTrainingContext } from "../../training/courseRegistry";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const scriptSlotViewIds: ViewId[] = [
  "script-outdoor",
  "script-indoor",
  "script-sports",
  "script-home",
];

export function ScriptHub({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  const { selection } = useTrainingSelection();
  let resolved = selection ? resolveTrainingContext(selection.courseId, selection.levelId) : null;

  if (!resolved) {
    resolved = resolveTrainingContext("course-1", "advanced");
  }

  const displayScripts = resolved.storylines.map((s, idx) => ({
    id: s.id,
    slotIndex: idx,
    group: s.group,
    title: s.title,
    strategy: s.core.anchorScene,
    surveyBadges: s.surveyOptionIds,
    levelName: resolved.level.displayName,
  }));

  return (
    <div className="space-y-6">
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">STEP 3. 만능 스크립트</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
          질문을 통째로 외우지 말고, 핵심 장면을 연습하세요.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          {resolved.course.title} ({resolved.level.displayName})의 4개 핵심 스토리를 연습하고,
          질문에 따라 유연하게 변형합니다. 선택지가 늘어나는 것이지 외워야 할 양이 두 배가 되는
          것은 아닙니다.
        </p>
      </section>

      <Card className="border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
        <div className="flex gap-3">
          <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" />
          <div>
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">몇 문제에 쓰나요?</p>
            <p className="mt-1 text-sm leading-6 text-indigo-800 dark:text-indigo-200">
              OPIc은 전체 약 12~15문항으로 진행되지만, 스크립트 그룹별 고정 문항 수나 순서는 공개된
              값이 아닙니다. 같은 서베이 그룹에서도 묘사·루틴·최근 경험·비교·문제 해결처럼 질문의
              입구가 바뀔 수 있어, OOM은 한 장면을 여러 질문에 연결하는 방식으로 구성했습니다.
            </p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {displayScripts.map((script, idx) => (
          <Card className="flex h-full flex-col p-5" key={script.id}>
            <div className="flex items-center justify-between gap-3">
              <Badge tone="indigo">{script.group}</Badge>
              <Badge tone="amber">{script.levelName}</Badge>
            </div>
            <h2 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">{script.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {script.strategy}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {script.surveyBadges.slice(0, 4).map((badge) => (
                <Badge key={badge} tone="emerald">
                  {badge}
                </Badge>
              ))}
            </div>
            <Button
              className="mt-6 w-full"
              onClick={() => onNavigate(scriptSlotViewIds[idx] ?? "script-outdoor")}
              variant="secondary"
            >
              {script.group} 스크립트 보기 <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </section>

      <Card className="border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex gap-3">
          <Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">단일 스토리 방식</p>
            <p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
              선택한 코스와 레벨에 맞는 최적의 메인 스토리가 제공됩니다. 질문별 변형과 답변
              설계도만 반복하면 됩니다.
            </p>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => onNavigate(scriptSlotViewIds[0])}>
          <BookOpenText className="h-4 w-4" />
          {displayScripts[0]?.group ?? "첫 번째"}부터 시작
        </Button>
      </div>
    </div>
  );
}
