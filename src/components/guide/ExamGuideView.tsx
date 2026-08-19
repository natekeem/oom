import { ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2, ClipboardCheck, ExternalLink, FileText, GraduationCap, MapPin, ReceiptText, ShieldCheck, TimerReset } from "lucide-react";
import { motion } from "framer-motion";
import { applicationSteps, candidateChecklist, officialOpicLinks, practicalTips, scoreBands, testFlow } from "../../data/examGuide";
import type { ViewId } from "../layout/Sidebar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type ExamGuideViewProps = { onNavigate: (view: ViewId) => void };

const linkIcons = [BookOpenCheck, ReceiptText, CalendarDays, MapPin, ClipboardCheck, FileText];
const flowIcons = [ClipboardCheck, TimerReset, GraduationCap, FileText];

export function ExamGuideView({ onNavigate }: ExamGuideViewProps) {
  return <div className="space-y-6">
    <motion.section animate={{ opacity: 1, y: 0 }} className="border-l-4 border-indigo-500 pl-4" initial={{ opacity: 0, y: 8 }}>
      <div className="flex flex-wrap items-center gap-2"><Badge tone="indigo">OPIc 수험 가이드</Badge><span className="text-xs text-zinc-500 dark:text-zinc-400">공식 사이트 링크 기준</span></div>
      <h1 className="mt-3 text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl">시험 정보는 한곳에, 말하기 훈련은 OOM에서.</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">OPIc은 실제 생활에서의 외국어 말하기 능력을 평가하는 컴퓨터 기반 시험입니다. 이 페이지는 신청 전후에 필요한 흐름을 정리한 보조 가이드이며, 일정·응시료·마감·신분증 기준은 반드시 공식 사이트의 최신 안내를 우선해 주세요.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => onNavigate("survey")}><ClipboardCheck className="h-4 w-4" />서베이 고정 시작</Button><a className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-indigo-700 dark:hover:bg-indigo-950" href={officialOpicLinks[0].href} rel="noreferrer" target="_blank">공식 사이트 <ExternalLink className="h-4 w-4" /></a></div>
    </motion.section>

    <section className="grid gap-4 lg:grid-cols-3">{scoreBands.map((band, index) => <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 8 }} key={band.band} transition={{ delay: index * 0.05 }}><Card className="h-full p-5"><Badge tone={index === 0 ? "default" : index === 1 ? "emerald" : "amber"}>{band.band}</Badge><p className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">{band.levels}</p><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{band.description}</p></Card></motion.div>)}</section>

    <section className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><ReceiptText className="h-5 w-5" /><h2 className="text-lg font-bold text-zinc-950 dark:text-white">신청 흐름</h2></div><ol className="mt-5 space-y-4">{applicationSteps.map((step, index) => <li className="flex gap-3" key={step.title}><span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-indigo-600 text-xs font-bold text-white">{index + 1}</span><div><p className="text-sm font-bold text-zinc-900 dark:text-white">{step.title}</p><p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{step.detail}</p></div></li>)}</ol><div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"><ShieldCheck className="mr-2 inline h-4 w-4" />응시료는 고정 숫자로 안내하지 않습니다. 할인·패키지·결제 조건이 달라질 수 있으므로 공식 신청 화면에서 최종 금액을 확인하세요.</div></Card>
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><TimerReset className="h-5 w-5" /><h2 className="text-lg font-bold text-zinc-950 dark:text-white">시험 진행 방식</h2></div><ol className="mt-5 space-y-4">{testFlow.map((step, index) => { const Icon = flowIcons[index]; return <li className="flex gap-3" key={step.title}><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold text-zinc-900 dark:text-white">{step.title}</p><p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{step.detail}</p></div></li>; })}</ol></Card>
    </section>

    <Card className="p-5 sm:p-6"><div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100"><ExternalLink className="h-5 w-5 text-indigo-500" /><h2 className="text-lg font-bold">공식 바로가기</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{officialOpicLinks.map((link, index) => { const Icon = linkIcons[index]; return <a className="group rounded-md border border-zinc-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950" href={link.href} key={link.label} rel="noreferrer" target="_blank"><div className="flex items-center justify-between gap-2"><Icon className="h-4 w-4 text-indigo-500" /><ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-indigo-500" /></div><p className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">{link.label}</p><p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{link.description}</p></a>; })}</div></Card>

    <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-5 w-5" /><h2 className="text-lg font-bold text-zinc-950 dark:text-white">시험 전 체크리스트</h2></div><ul className="mt-5 space-y-3">{candidateChecklist.map((item) => <li className="flex gap-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200" key={item}><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>)}</ul></Card>
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-2 text-amber-600 dark:text-amber-400"><BookOpenCheck className="h-5 w-5" /><h2 className="text-lg font-bold text-zinc-950 dark:text-white">준비 팁</h2></div><div className="mt-5 space-y-4">{practicalTips.map((tip) => <div className="border-l-2 border-amber-300 pl-3 dark:border-amber-700" key={tip.title}><p className="text-sm font-bold text-zinc-900 dark:text-white">{tip.title}</p><p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{tip.detail}</p></div>)}</div></Card>
    </section>

    <div className="flex justify-end"><Button onClick={() => onNavigate("training-hub")} variant="secondary">STEP 1. 목표/코스 설정으로 이동 <ArrowRight className="h-4 w-4" /></Button></div>
  </div>;
}
