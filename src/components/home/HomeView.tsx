import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { OomBrandMark } from "../brand/OomBrandMark";
import { ButtonLink } from "../ui/Button";
import "./home.css";

const metrics = [
  ["3", "COURSES", "준비 범위"],
  ["3", "LEVELS", "답변 밀도"],
  ["6", "STEPS", "훈련 흐름"],
  ["AI", "COACH", "분석 · 재시도"],
];

const methodSteps = [
  ["01", "준비 범위를 좁힙니다", "Course가 말할 장면과 소재를 정합니다.", "/training/setup/"],
  ["02", "목표에 맞게 키웁니다", "Level이 같은 장면의 길이와 답변 밀도를 조절합니다.", "/training/setup/"],
  ["03", "질문에 맞게 바꿉니다", "KEEP · CHANGE · DROP으로 필요한 부분만 이동합니다.", "/training/scripts/"],
  ["04", "말하고 바로 다시 합니다", "녹음 → AI 피드백 → 같은 질문 재시도.", "/practice/"],
];

export function HomeView() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 xl:space-y-6" data-about-overview>
      <header className="flex items-start gap-3">
        <OomBrandMark className="mt-1 text-indigo-600 dark:text-indigo-300" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">OOM · OPIc On Me</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">오픽온미란?</h1>
          <p className="mt-1.5 text-sm font-medium leading-5 text-zinc-700 dark:text-zinc-200 sm:leading-6">
            적은 수의 기본 스크립트를 익히고, 질문에 맞게 바꿔 말하는 OPIc 훈련 시스템입니다.
          </p>
        </div>
      </header>

      <dl aria-label="OOM 시스템 구성" className="grid grid-cols-2 border-y border-zinc-300 dark:border-zinc-700 lg:grid-cols-4" data-about-metrics>
        {metrics.map(([value, label, description]) => (
          <div className="about-metric flex flex-col border-zinc-200 px-4 py-3.5 text-zinc-950 odd:border-r dark:border-zinc-800 dark:text-white sm:px-5 sm:py-4 lg:border-r lg:last:border-r-0" key={label}>
            <dt className="order-2 mt-1 text-[9px] font-extrabold tracking-[0.2em] text-zinc-500 transition-colors dark:text-zinc-400">{label}</dt>
            <dd className="order-1 text-3xl font-black tracking-[-0.06em] transition-colors sm:text-4xl">{value}</dd>
            <p className="order-3 mt-1 text-[11px] text-zinc-600 dark:text-zinc-300">{description}</p>
          </div>
        ))}
      </dl>

      <section className="about-method-grid border-t border-zinc-300 pt-5 dark:border-zinc-700 sm:pt-6" data-about-method>
        <div className="about-method-statement">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">The OOM Method</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black leading-[1.03] tracking-[-0.055em] text-zinc-950 dark:text-white sm:text-4xl xl:text-5xl">
            적게 준비하고,<br />필요한 만큼<br /><span className="text-indigo-600 dark:text-indigo-300">바꿔 말합니다.</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-5 text-zinc-600 dark:text-zinc-300">
            하나의 이야기를 외운 뒤 끝내는 방식이 아니라, Course와 Level로 범위를 정하고 실제 질문에 맞춰 다시 말하는 방법입니다.
          </p>
        </div>

        <ol className="about-method-flow border-b border-zinc-300 dark:border-zinc-700" aria-label="THE OOM METHOD 4단계">
          {methodSteps.map(([number, title, description, href]) => (
            <li className="about-method-row border-t border-zinc-300 dark:border-zinc-700" key={number}>
              <Link className="grid grid-cols-[2.25rem_1fr_auto] gap-2.5 px-2 py-2.5 focus-visible:outline-none sm:grid-cols-[3rem_1fr_auto] sm:px-3 xl:py-3.5" to={href}>
                <span className="about-method-number font-mono text-xs font-bold tracking-[0.15em] text-zinc-400">{number}</span>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-zinc-950 dark:text-white sm:text-lg">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300 sm:text-sm">{description}</p>
                </div>
                <span aria-hidden="true" className="about-method-arrow self-center text-base text-zinc-400">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden border-t-2 border-indigo-400 bg-zinc-950 px-5 py-4 text-white sm:px-6 xl:py-5" data-about-ai-strip>
        <div aria-hidden="true" className="absolute right-0 top-7 h-px w-1/3 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70" />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-300">AI Coach</p>
          <h2 className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">답변 분석 · KEEP/FIX/RETRY · 스크립트/질문 Assist</h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-300">AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <ButtonLink to="/training/">실전 훈련 둘러보기<ArrowRight aria-hidden="true" className="h-4 w-4" /></ButtonLink>
              <ButtonLink className="border-zinc-600 bg-zinc-900 text-white hover:bg-zinc-800" to="/exam-guide/" variant="secondary">OPIc 수험 가이드<ArrowRight aria-hidden="true" className="h-4 w-4" /></ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
