import { ArrowDown, ArrowRight, Route } from "lucide-react";
import { OomBrandMark } from "../brand/OomBrandMark";
import { ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";

const principles = [
  { number: "01", title: "적게 준비합니다", description: "Course별 핵심 story를 여러 질문에 재사용합니다." },
  { number: "02", title: "목표에 맞게 키웁니다", description: "같은 story를 Foundation → Intermediate → Advanced로 확장합니다." },
  { number: "03", title: "말하고 바로 고칩니다", description: "질문 → 녹음 → AI 피드백 → 같은 질문 재시도." },
];

const metrics = [["3", "COURSES"], ["3", "LEVELS"], ["6", "STEPS"], ["AI", "COACH"]];
const steps = ["목표·코스", "서베이", "난이도", "스크립트", "롤플레이", "실전"];

export function HomeView() {
  return (
    <div className="mx-auto max-w-7xl space-y-4" data-about-overview>
      <header className="flex items-start gap-4">
        <OomBrandMark className="mt-1 text-indigo-600 dark:text-indigo-300" size="lg" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">OOM · OPIc On Me</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">오픽온미란?</h1>
          <p className="mt-2 max-w-4xl text-balance text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
            적은 수의 기본 스크립트를 익히고, 질문에 맞게 필요한 부분만 바꿔 말하도록 만든 OPIc 훈련 시스템입니다.
          </p>
        </div>
      </header>

      <Card className="overflow-hidden p-0 lg:flex lg:min-h-[520px] lg:flex-col xl:min-h-[600px]">
        <dl aria-label="OOM 시스템 구성" className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 sm:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div className="border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:border-r sm:last:border-r-0 lg:px-6" key={label}>
              <dt className="text-[10px] font-bold tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{label}</dt>
              <dd className="mt-0.5 text-2xl font-black tracking-tight text-zinc-950 dark:text-white"><span>{value}</span> {label}</dd>
            </div>
          ))}
        </dl>

        <div className="grid lg:flex-1 lg:grid-cols-[0.86fr_1.14fr]">
          <section aria-labelledby="about-principles" className="p-4 sm:p-5 lg:flex lg:flex-col lg:justify-center lg:p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400" id="about-principles">OOM TRAINING PRINCIPLES</h2>
            <ol className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
              {principles.map((principle) => (
                <li className="grid grid-cols-[2rem_1fr] gap-3 py-3 first:pt-0 last:pb-0" key={principle.number}>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">{principle.number}</span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{principle.title}</h3>
                    <p className="mt-0.5 text-xs leading-5 text-zinc-600 dark:text-zinc-300 sm:text-sm">{principle.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="about-system" className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400" id="about-system">Course × Level</h2>
            <div className="mt-3 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
              <div className="border-l-2 border-indigo-500 bg-white px-4 py-3 dark:bg-zinc-900">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-300">Course</p>
                <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">무엇을 말할지</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">이야기의 맥락</p>
              </div>
              <span aria-hidden="true" className="grid place-items-center text-xl font-light text-zinc-400">×</span>
              <div className="border-l-2 border-emerald-500 bg-white px-4 py-3 dark:bg-zinc-900">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">Level</p>
                <p className="mt-1 text-sm font-bold text-zinc-950 dark:text-white">얼마나 깊게 말할지</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">길이와 답변 밀도</p>
              </div>
            </div>

            <ArrowDown aria-hidden="true" className="mx-auto my-2 h-4 w-4 text-zinc-400" />
            <div aria-label="6 STEP 훈련 흐름" className="grid grid-cols-3 gap-1.5 xl:grid-cols-6">
              {steps.map((step, index) => (
                <div className="border border-zinc-200 bg-white px-1.5 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900" key={step}>
                  <span className="block font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-300">{index + 1}</span>
                  <span className="mt-0.5 block text-[10px] font-semibold leading-4 text-zinc-700 dark:text-zinc-200">{step}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 bg-indigo-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-indigo-950/30 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">AI Coach</p>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">답변 분석 · 스크립트/질문 Assist · 재시도 미션</p>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">공식 OPIc 점수·등급 판정이 아닌 학습 보조입니다.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-5 lg:px-6">
          <ButtonLink to="/training/"><Route aria-hidden="true" className="h-4 w-4" />실전 훈련 둘러보기</ButtonLink>
          <ButtonLink to="/exam-guide/" variant="secondary">OPIc 수험 가이드<ArrowRight aria-hidden="true" className="h-4 w-4" /></ButtonLink>
        </div>
      </Card>
    </div>
  );
}
