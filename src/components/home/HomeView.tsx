import { ArrowDown, ArrowRight, Layers3, RefreshCcw, Route } from "lucide-react";
import { Badge } from "../ui/Badge";
import { ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";

const principles = [
  {
    number: "01",
    title: "적게 준비하기",
    description: "익숙한 장면을 Course별로 묶습니다.",
  },
  {
    number: "02",
    title: "수준에 맞게 키우기",
    description: "같은 이야기를 3개 Level로 확장합니다.",
  },
  {
    number: "03",
    title: "말하고 바로 고치기",
    description: "듣고 → 말하고 → 복기하고 → 다시 말합니다.",
  },
];

const steps = ["목표·코스", "서베이", "난이도", "스크립트", "롤플레이", "실전 연습"];

export function HomeView() {
  return (
    <div className="mx-auto max-w-7xl space-y-5" data-about-overview>
      <header className="max-w-4xl">
        <Badge tone="indigo">OOM · OPIc On Me</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
          오픽온미란?
        </h1>
        <p className="mt-3 text-balance text-base font-medium leading-7 text-zinc-700 dark:text-zinc-200 sm:text-lg">
          많이 외우는 대신, 익숙한 이야기를 질문에 맞게 바꾸어 말하는 OPIc 훈련 도구.
        </p>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
          <section aria-labelledby="about-principles" className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center gap-2">
              <RefreshCcw aria-hidden="true" className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              <h2 className="text-sm font-bold text-zinc-950 dark:text-white" id="about-principles">
                세 가지 훈련 원칙
              </h2>
            </div>
            <ol className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {principles.map((principle) => (
                <li className="grid grid-cols-[2.25rem_1fr] gap-3 py-3.5 first:pt-0 last:pb-0" key={principle.number}>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">{principle.number}</span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{principle.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{principle.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="about-system" className="border-t border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="flex items-center gap-2">
              <Layers3 aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <h2 className="text-sm font-bold text-zinc-950 dark:text-white" id="about-system">Course × Level</h2>
            </div>

            <div className="mt-4 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-300">Course</p>
                <p className="mt-2 text-sm font-bold text-zinc-950 dark:text-white">무슨 이야기를 준비할까?</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">서베이와 익숙한 장면의 맥락</p>
              </div>
              <span aria-hidden="true" className="grid place-items-center text-lg font-light text-zinc-400">×</span>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">Level</p>
                <p className="mt-2 text-sm font-bold text-zinc-950 dark:text-white">얼마나 깊게 말할까?</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">3구간에서 1구간까지 답변 밀도</p>
              </div>
            </div>

            <ArrowDown aria-hidden="true" className="mx-auto my-3 h-4 w-4 text-zinc-400" />

            <div aria-label="6 STEP 훈련 흐름" className="grid grid-cols-3 gap-2 xl:grid-cols-6">
              {steps.map((step, index) => (
                <div className="relative rounded-md border border-zinc-200 bg-white px-2 py-2.5 text-center dark:border-zinc-800 dark:bg-zinc-900" key={step}>
                  <span className="block font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-300">STEP {index + 1}</span>
                  <span className="mt-1 block text-[11px] font-semibold leading-4 text-zinc-700 dark:text-zinc-200">{step}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800 sm:px-6 lg:px-7">
          <ButtonLink to="/training/">
            <Route aria-hidden="true" className="h-4 w-4" />
            실전 훈련 둘러보기
          </ButtonLink>
          <ButtonLink to="/exam-guide/" variant="secondary">
            수험 가이드
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
