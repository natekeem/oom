import { CircleHelp, ExternalLink, MessageCircleQuestion, SearchCheck, ShieldCheck } from "lucide-react";
import { examFaqCategories, examFaqItems } from "../../data/examFaq";
import { guideSourceNote, type ExamGuideSection } from "../../data/examGuideContent";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExamGuideTabs } from "./ExamGuideTabs";

type ExamGuideFaqProps = { onSectionChange: (section: ExamGuideSection) => void };

export function ExamGuideFaq({ onSectionChange }: ExamGuideFaqProps) {
  return (
    <div className="space-y-6">
      <ExamGuideTabs activeSection="exam-faq" onSectionChange={onSectionChange} />

      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">OPIc Q&A</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">시험 전에 헷갈리는 질문만 빠르게 확인하세요.</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          교재 속 핵심 문답은 표현을 다듬어 옮기고, 공식 안내와 수험생들이 자주 묻는 내용을 더했습니다. 규정이 바뀔 수 있는 항목은 응시 직전 공식 페이지에서 다시 확인하세요.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {examFaqCategories.map((category) => {
          const count = examFaqItems.filter((item) => item.category === category.id).length;
          return (
            <Card className="p-4" key={category.id}>
              <SearchCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              <p className="mt-3 text-sm font-bold text-zinc-950 dark:text-white">{category.label}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{category.description}</p>
              <Badge className="mt-3" tone="default">{count}개 질문</Badge>
            </Card>
          );
        })}
      </section>

      <section className="space-y-5">
        {examFaqCategories.map((category) => {
          const items = examFaqItems.filter((item) => item.category === category.id);
          return (
            <Card className="overflow-hidden" key={category.id}>
              <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CircleHelp className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                    <h2 className="text-base font-bold text-zinc-950 dark:text-white">{category.label}</h2>
                  </div>
                  <Badge tone="indigo">{items.length} FAQ</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{category.description}</p>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item) => (
                  <details className="group px-5 py-4" key={item.id}>
                    <summary className="flex cursor-pointer list-none items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
                      <span className="min-w-0 flex-1 text-sm font-bold leading-6 text-zinc-950 dark:text-white">{item.question}</span>
                      <span className="mt-0.5 text-xs font-semibold text-zinc-400 transition group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="ml-7 mt-3 space-y-3">
                      <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">{item.answer}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.source === "official" ? <Badge tone="emerald">공식 기준</Badge> : null}
                        {item.sourceUrl ? (
                          <a className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 underline underline-offset-4 dark:text-indigo-300" href={item.sourceUrl} rel="noreferrer" target="_blank">
                            {item.sourceLabel ?? "공식 안내"} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </Card>
          );
        })}
      </section>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <ShieldCheck className="mr-1.5 inline h-4 w-4" />
        {guideSourceNote}
      </div>
    </div>
  );
}
