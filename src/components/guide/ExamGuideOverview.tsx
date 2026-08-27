import { CheckCircle2, Clock3, GraduationCap, Languages, ListChecks, ShieldCheck } from "lucide-react";
import { examAtAGlance, gradeGuide, guideSourceNote, officialGuideLinks, type ExamGuideSection } from "../../data/examGuideContent";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExamGuideTabs } from "./ExamGuideTabs";

type ExamGuideOverviewProps = { onSectionChange: (section: ExamGuideSection) => void };

export function ExamGuideOverview({ onSectionChange }: ExamGuideOverviewProps) {
  return (
    <div className="space-y-6">
      <ExamGuideTabs activeSection="exam-overview" onSectionChange={onSectionChange} />
      <section className="border-l-4 border-indigo-500 pl-4">
        <Badge tone="indigo">OPIc 소개 · 등급</Badge>
        <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">OPIc의 방식과 등급을 먼저 이해해요.</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">OPIc은 컴퓨터를 활용한 1:1 인터뷰 방식의 외국어 말하기 평가입니다. 배경 설문과 관심사에 맞춘 문항으로 진행되며, 답변 전체를 종합해서 평가합니다. OOM은 특정 점수를 보장하지 않고, 익숙한 경험을 자연스럽게 설명하고 문제를 해결하는 말하기 구조를 연습하도록 돕습니다.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {examAtAGlance.map((item, index) => {
          const Icon = [Languages, ListChecks, Clock3, ShieldCheck][index];
          return <Card className="p-4" key={item.label}><Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /><p className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{item.label}</p><p className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">{item.value}</p><p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{item.detail}</p></Card>;
        })}
      </section>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><GraduationCap className="h-5 w-5" /><h2 className="text-lg font-bold text-zinc-950 dark:text-white">등급 체계와 말하기 초점</h2></div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">등급은 한 문장이나 한 문제로 결정되지 않습니다. 익숙한 소재를 얼마나 이어 말하는지, 시제와 묘사를 얼마나 안정적으로 사용하는지, 예상 밖의 상황을 설명하고 해결할 수 있는지를 함께 봅니다.</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {gradeGuide.map((grade) => <div className={`rounded-md border p-4 ${grade.band === "Novice" ? "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950" : grade.band === "Intermediate" ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30"}`} key={grade.band}><p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{grade.band}</p><p className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">{grade.levels}</p><p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{grade.explanation}</p><p className="mt-3 border-t border-zinc-200 pt-3 text-xs leading-5 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"><span className="font-semibold">연습 초점:</span> {grade.focus}</p></div>)}
        </div>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" /><div><p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">공식 정보 확인</p><p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200">응시료, 일정, 신분증 규정처럼 바뀔 수 있는 정보는 신청 전 OPIc 공식 안내를 다시 확인하세요.</p><a className="mt-3 inline-flex text-sm font-semibold text-emerald-800 underline underline-offset-4 dark:text-emerald-200" href={officialGuideLinks.guide} rel="noreferrer" target="_blank">OPIc 공식 수험자 가이드 열기</a></div></div>
      </Card>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"><ShieldCheck className="mr-1.5 inline h-4 w-4" />{guideSourceNote}</div>
    </div>
  );
}
