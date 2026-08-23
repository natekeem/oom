import { ArrowDown, ArrowRight, Route } from "lucide-react";
import { OomBrandMark } from "../brand/OomBrandMark";
import { ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";

const metrics = [
  ["3", "COURSES", "무엇을 준비할지"],
  ["3", "LEVELS", "얼마나 깊게 말할지"],
  ["6", "STEPS", "준비부터 실전까지"],
  ["AI", "COACH", "분석 · Assist · 재시도"],
];

const steps = ["목표·코스", "서베이", "난이도", "스크립트", "롤플레이", "실전"];

export function HomeView() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6" data-about-overview>
      <header className="flex items-start gap-4">
        <OomBrandMark className="mt-1 text-indigo-600 dark:text-indigo-300" size="lg" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">OOM · OPIc On Me</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">오픽온미란?</h1>
          <p className="mt-2 max-w-3xl text-balance text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
            적은 수의 기본 스크립트를 익히고,<br className="hidden sm:block" /> 질문에 맞게 필요한 부분만 바꿔 말하는 OPIc 훈련 시스템입니다.
          </p>
        </div>
      </header>

      <dl aria-label="OOM 시스템 구성" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" data-about-metrics>
        {metrics.map(([value, label, description]) => (
          <Card className="min-h-32 p-5 sm:min-h-36" key={label}>
            <dt className="text-[10px] font-bold tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{label}</dt>
            <dd className="mt-2 text-4xl font-black tracking-tight text-zinc-950 dark:text-white">{value}</dd>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
          </Card>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-2" data-about-core-grid>
        <Card className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Training Context</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Course × Level</h2>
          <div className="mt-6 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-md border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/35">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-700 dark:text-indigo-300">Course</p>
              <p className="mt-3 text-lg font-bold text-zinc-950 dark:text-white">무엇을 말할지</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">이야기의 맥락을 정합니다.</p>
            </div>
            <span aria-hidden="true" className="grid place-items-center text-2xl font-light text-zinc-400">×</span>
            <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">Level</p>
              <p className="mt-3 text-lg font-bold text-zinc-950 dark:text-white">얼마나 깊게 말할지</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">길이와 답변 밀도를 정합니다.</p>
            </div>
          </div>
          <ArrowDown aria-hidden="true" className="mx-auto my-3 h-5 w-5 text-zinc-400" />
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">Training Context</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">같은 장면 · 목표에 맞는 답변 밀도</p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Practice Cycle</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Training Loop</h2>
          <div aria-label="OOM 반복 훈련 루프" className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
              {['준비', '→', '익히기', '→', '말하기'].map((item, index) => index % 2 === 0 ? (
                <strong className="rounded-md bg-white px-2 py-3 text-sm text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100" key={`${item}-${index}`}>{item}</strong>
              ) : <span aria-hidden="true" className="text-indigo-500" key={`${item}-${index}`}>{item}</span>)}
            </div>
            <ArrowDown aria-hidden="true" className="mx-auto my-3 h-5 w-5 text-indigo-500" />
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
              <strong className="rounded-md bg-white px-2 py-3 text-sm text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">재시도</strong>
              <span aria-hidden="true" className="text-indigo-500">←</span>
              <strong className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-3 text-sm text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">AI 피드백</strong>
            </div>
          </div>
          <div aria-label="6 STEP 훈련 흐름" className="mt-4 grid grid-cols-3 gap-2 xl:grid-cols-6">
            {steps.map((step, index) => (
              <div className="rounded-md border border-zinc-200 px-2 py-2.5 text-center dark:border-zinc-800" key={step}>
                <span className="block font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-300">{index + 1}</span>
                <span className="mt-1 block text-[10px] font-semibold leading-4 text-zinc-700 dark:text-zinc-200">{step}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section className="rounded-md border border-indigo-200 bg-indigo-50/80 p-5 dark:border-indigo-900 dark:bg-indigo-950/35 sm:p-6" data-about-ai-strip>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">AI COACH</p>
            <p className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100 sm:text-base">답변 분석 · KEEP/FIX/RETRY ·<br className="sm:hidden" /> 스크립트/질문 Assist</p>
          </div>
          <p className="max-w-md text-xs leading-5 text-zinc-600 dark:text-zinc-300 sm:text-sm">AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-indigo-200 pt-4 dark:border-indigo-900">
          <ButtonLink to="/training/"><Route aria-hidden="true" className="h-4 w-4" />실전 훈련 둘러보기</ButtonLink>
          <ButtonLink to="/exam-guide/" variant="secondary">OPIc 수험 가이드<ArrowRight aria-hidden="true" className="h-4 w-4" /></ButtonLink>
        </div>
      </section>
    </div>
  );
}
