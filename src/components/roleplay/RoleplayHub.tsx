import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleHelp,
  House,
  Layers,
  MapPinned,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { essentialRoleplayPhrases, roleplayFormula } from "../../data/roleplays";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";

const roleplaySlotViewIds: ViewId[] = [
  "roleplay-travel",
  "roleplay-indoor",
  "roleplay-sports",
  "roleplay-home",
];

const slotIcons: LucideIcon[] = [MapPinned, CircleHelp, Trophy, House];

const flowSteps = [
  {
    step: "01",
    title: "상황 파악",
    description: "Eva의 음성을 듣고 내가 누구에게, 어떤 목적으로 이야기하는지 파악합니다.",
  },
  {
    step: "02",
    title: "정보 질문",
    description: "상황에 맞는 3~4가지 질문을 던지거나 예약/구매 조건을 확인합니다.",
  },
  {
    step: "03",
    title: "문제 발생",
    description: "예약 오류, 고장, 일정 변경 등 문제가 생겼음을 상대방에게 정중히 알립니다.",
  },
  {
    step: "04",
    title: "대안 제시",
    description: "내가 원하는 해결책과 차선책(대안 1, 대안 2)을 구체적으로 제안합니다.",
  },
];

export function RoleplayHub({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <TrainingSelectionGuard onNavigate={onNavigate} stepName="STEP 5. 롤플레이 공식">
      {(resolved) => (
        <div className="space-y-8">
          {/* Header */}
          <section className="border-l-4 border-indigo-500 pl-4">
            <Badge tone="indigo">STEP 5. 롤플레이 공식</Badge>
            <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
              문제를 설명하고, 대안을 요청하고, 정중하게 마무리합니다.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              롤플레이는 긴 문장을 통째로 외우는 문제가 아닙니다. 상황 → 문제 → 질문 → 대안의
              순서를 익히면 어떤 돌발 상황에서도 동일한 6단계 공식을 활용할 수 있습니다.
            </p>
          </section>

          {/* 1. 롤플레이란 & 2. 대표 출제 구조 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                1. 롤플레이란? & 대표 출제 흐름
              </h2>
            </div>
            <Card className="p-5 sm:p-6">
              <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                OPIc 롤플레이는 일상 또는 서비스 상황에서 상대방에게 정보를 묻거나 발생한 문제를 해결하는 기능형 문항입니다.
                정해진 스크립트를 그대로 말하기보다 <strong>상대방에게 대안을 제안하는 흐름</strong>이 평가의 핵심입니다.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {flowSteps.map((f, i) => (
                  <div
                    className="relative rounded-md border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                    key={f.step}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {f.step}
                      </span>
                      {i < flowSteps.length - 1 ? (
                        <span className="text-xs text-zinc-400">→</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-bold text-zinc-950 dark:text-white">
                      {f.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 3. 6단계 만능 공식 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <ChartNoAxesCombined className="h-5 w-5" />
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                2. 6단계 만능 해결 공식
              </h2>
            </div>
            <Card className="p-5 sm:p-6">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {roleplayFormula.map((item, index) => (
                  <div
                    className="flex gap-3 rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    key={item.title}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-indigo-600 text-xs font-bold text-white">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 4. 필수 만능 표현 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                3. 자주 쓰는 롤플레이 만능 표현
              </h2>
            </div>
            <Card className="p-5 sm:p-6">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                어떤 롤플레이 문제에서도 자연스럽게 연결할 수 있는 만능 템플릿 문구입니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {essentialRoleplayPhrases.map((phrase) => (
                  <Badge key={phrase} tone="emerald">
                    {phrase}
                  </Badge>
                ))}
              </div>
            </Card>
          </section>

          {/* 5. 현재 코스의 실전 롤플레이 시나리오 */}
          <section className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Bot className="h-5 w-5" />
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  4. {resolved.course.title} 코스 실전 시나리오 ({resolved.level.displayName})
                </h2>
              </div>
              <Badge tone="indigo">
                {resolved.roleplays.length}개 시나리오 준비됨
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resolved.roleplays.map((rp, idx) => {
                const Icon = slotIcons[idx] ?? CircleHelp;
                const viewId = roleplaySlotViewIds[idx] ?? "roleplay-travel";
                return (
                  <Card className="flex h-full flex-col p-5 shadow-sm" key={rp.id}>
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <Badge tone="indigo">{rp.group}</Badge>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">
                      {rp.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {rp.situation}
                    </p>
                    <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                        목표 구간 예시: <strong>{resolved.level.targetLabel}</strong> ({resolved.level.displayName})
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => onNavigate(viewId)}
                        variant="secondary"
                      >
                        {rp.group} 시나리오 훈련 <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Practice tip */}
          <Card className="border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  롤플레이 학습 팁
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
                  완벽한 문법보다 문제를 분명히 설명하고(Problem), 상대방에게 최소 2가지 대안(Alternative 1, 2)을
                  질문 형태로 제시하는 태도가 가장 높은 점수를 받습니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </TrainingSelectionGuard>
  );
}
