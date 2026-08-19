import { ArrowRight, CircleHelp, Layers3 } from "lucide-react";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";

const scriptSlotViewIds: ViewId[] = [
  "script-outdoor",
  "script-indoor",
  "script-sports",
  "script-home",
];

export function ScriptHub({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 4. 만능 스크립트">
      {(resolved) => {
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
              <Badge tone="indigo">STEP 4. 만능 스크립트</Badge>
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

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {displayScripts.map((script) => {
                const targetView = scriptSlotViewIds[script.slotIndex] ?? "script-outdoor";
                return (
                  <Card className="flex h-full flex-col p-5" key={script.id}>
                    <div className="flex items-center justify-between">
                      <Badge tone="indigo">{script.group}</Badge>
                      <Badge tone="emerald">{script.levelName}</Badge>
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">
                      {script.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {script.strategy}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {script.surveyBadges.slice(0, 3).map((item) => (
                        <span
                          className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <Button
                      className="mt-6 w-full"
                      onClick={() => onNavigate(targetView)}
                      variant="secondary"
                    >
                      {script.group} 학습하기 <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Card>
                );
              })}
            </section>

            <Card className="border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950">
              <div className="flex items-start gap-3">
                <Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                    스크립트 훈련 3단계 안내
                  </p>
                  <p className="text-xs leading-5 text-indigo-800 dark:text-indigo-200">
                    1. <strong>메인 스토리</strong>: 60~90초 분량의 대표 답변을 먼저 소리 내어 연습합니다.<br />
                    2. <strong>질문별 변형</strong>: 질문의 시제나 초점이 바뀌었을 때 유지할 블록과 교체할 블록을 확인합니다.<br />
                    3. <strong>답변 설계도</strong>: 스크립트 전체를 외우지 않고 4단계 뼈대(Opening → Scene → Detail → Closing)만 떠올려 말해 봅니다.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );
      }}
    </TrainingSelectionGuard>
  );
}
