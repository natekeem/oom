import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Layers,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TrainingSelectionGuard } from "../training/TrainingSelectionGuard";

const formulaSteps = [
  { step: "01", kind: "OPTIONAL", name: "상황 시작 (Situation)", desc: "필요하면 인사와 현재 상황을 짧게 밝힙니다.", cue: "Hi, I'm calling about / I'm here because..." },
  { step: "02", kind: "CORE", name: "문제 설명 (Problem)", desc: "문제 또는 목적을 1~2문장으로 분명히 말합니다.", cue: "Unfortunately, there seems to be a problem with..." },
  { step: "03", kind: "CORE", name: "정보 질문 (Question)", desc: "필요한 정보나 해결 조건을 질문합니다.", cue: "Could you check if / Do you know what happened to...?" },
  { step: "04", kind: "CORE", name: "첫 번째 대안 (Alternative 1)", desc: "원하는 다음 행동을 구체적으로 요청합니다.", cue: "Is it possible to / Would you be able to...?" },
  { step: "05", kind: "OPTIONAL", name: "두 번째 대안 (Alternative 2)", desc: "첫 요청이 어렵다면 차선책을 제안합니다.", cue: "If that's not possible, could I instead...?" },
  { step: "06", kind: "OPTIONAL", name: "감사/마무리 (Closing)", desc: "상황에 맞으면 감사하며 대화를 닫습니다.", cue: "Thank you for your help. Please let me know." },
];

const essentialPhrases = [
  { category: "상황 시작 & 전화", phrase: "Hi, I'm calling because I have a quick question about my reservation." },
  { category: "문제 설명", phrase: "Unfortunately, my schedule suddenly changed and I won't be able to make it." },
  { category: "정중한 질문", phrase: "Could you please check if there are any available slots later this week?" },
  { category: "대안 요청 (1)", phrase: "Is it possible to reschedule this to tomorrow afternoon instead?" },
  { category: "대안 요청 (2)", phrase: "If that is not an option, could I get a credit or a refund?" },
  { category: "마무리 감사", phrase: "I really appreciate your help with this. Have a great day!" },
];

const flowSteps = [
  {
    step: "01",
    title: "상황 제시",
    description: "Eva가 특정 상황(예: 호텔 예약, 티켓 문제, 장비 고장)을 음성으로 설명합니다.",
  },
  {
    step: "02",
    title: "질문 3~4개 하기",
    description: "정보를 얻기 위해 필요한 세부 사항을 상대방에게 연속으로 질문합니다.",
  },
  {
    step: "03",
    title: "돌발 문제 발생",
    description: "예상치 못한 문제 상황을 전달받고 직접 해결해야 하는 시나리오가 주어집니다.",
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
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Zap className="h-5 w-5" />
              <Badge tone="indigo">STEP 5. 롤플레이 공식</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">
              문제를 설명하고, 대안을 요청하고, 정중하게 마무리합니다.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              롤플레이는 긴 문장을 통째로 외우는 문제가 아닙니다. 상황 → 문제 → 질문 → 대안의
              순서를 익히면 어떤 돌발 상황에서도 동일한 6단계 공식을 활용할 수 있습니다.
            </p>
          </div>

          <Card className="border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100">현재 코스 상황으로 바로 연습하기</p>
                <p className="mt-1 text-xs leading-5 text-indigo-800 dark:text-indigo-200">원리를 이미 익혔다면 시나리오부터 시작하고, 필요한 표현만 다시 확인하세요.</p>
              </div>
              <Button onClick={() => onNavigate("roleplay-travel")}>첫 시나리오 연습 <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </Card>

          <details className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <summary className="cursor-pointer text-sm font-bold text-zinc-900 dark:text-white">
              롤플레이 원리 알아보기 <span className="ml-2 text-xs font-normal text-zinc-500">출제 흐름 · 6단계 메뉴 · 필수 표현</span>
            </summary>
            <div className="mt-6 space-y-8">

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
                정해진 스크립트를 그대로 말하기보다 <strong>상대방에게 상황을 설명하고 가능한 대안을 제시하는 연습</strong>이 문제 해결형 답변을 안정적으로 구성하는 데 도움이 됩니다.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {flowSteps.map((f, i) => (
                  <div
                    className="relative rounded-md border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                    key={f.step}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        FLOW {f.step}
                      </span>
                      <span className="text-[10px] text-zinc-400">단계 {i + 1}/4</span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 2. 6단계 만능 해결 공식 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                2. 6단계 만능 해결 공식
              </h2>
            </div>
            <Card className="border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              6단계를 매번 모두 사용할 필요는 없습니다. 먼저 <strong>문제·목적 → 질문·요청 → 다음 행동</strong>을 말하고, 정보 질문·두 번째 대안·마무리는 상황에 따라 고르세요.
            </Card>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {formulaSteps.map((s) => (
                <Card className="flex flex-col justify-between p-5" key={s.step}>
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge tone={s.kind === "CORE" ? "indigo" : "default"}>{s.kind} · {s.step}</Badge>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-zinc-950 dark:text-white">
                      {s.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      {s.desc}
                    </p>
                  </div>
                  <div className="mt-4 rounded bg-zinc-50 p-2.5 dark:bg-zinc-950">
                    <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      {s.cue}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* 3. 필수 만능 표현 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                3. 자주 쓰는 롤플레이 만능 표현
              </h2>
            </div>
            <Card className="p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {essentialPhrases.map((p) => (
                  <div
                    className="rounded-md border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800/80 dark:bg-zinc-900/40"
                    key={p.category}
                  >
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {p.category}
                    </span>
                    <p className="mt-1 text-xs font-medium leading-5 text-zinc-900 dark:text-zinc-100">
                      "{p.phrase}"
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

            </div>
          </details>

          {/* 4. 현재 Course 실전 시나리오 목록 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="h-5 w-5" />
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  4. {resolved.course.title} 코스 실전 시나리오 ({resolved.level.displayName})
                </h2>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Storyline 수와 별개로, 현재 코스에서 자주 쓰는 세 가지 기능 상황을 연습합니다. 필요한 CORE부터 말하고 OPTIONAL은 상황에 따라 고르세요.
            </p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resolved.roleplays.map((scenario, index) => {
                const targetView: ViewId =
                  index === 0
                    ? "roleplay-travel"
                    : index === 1
                    ? "roleplay-indoor"
                    : index === 2
                    ? "roleplay-sports"
                    : "roleplay-home";

                return (
                  <Card className="flex flex-col justify-between p-5" key={scenario.id}>
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge tone="indigo">{scenario.group}</Badge>
                        <Badge tone="emerald">{resolved.level.displayName}</Badge>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-zinc-950 dark:text-white">
                        {scenario.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                        {scenario.situation}
                      </p>
                      <p className="mt-3 rounded bg-zinc-50 px-3 py-2 text-xs font-semibold leading-5 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                        연습 기능 · {scenario.learningFunction}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                      <Button
                        className="w-full"
                        onClick={() => onNavigate(targetView)}
                        variant="secondary"
                      >
                        시나리오 훈련 <ArrowRight className="h-4 w-4" />
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
                  문제를 분명히 설명하고, 가능한 대안을 1~2개 제시하는 연습은 문제 해결형 롤플레이에서 답변 흐름을 유지하는 데 도움이 됩니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </TrainingSelectionGuard>
  );
}
