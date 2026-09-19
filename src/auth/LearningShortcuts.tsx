import { BookOpenText, ClipboardCheck, MessagesSquare, Play, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { viewPathForId } from "../lib/routes";

const shortcuts = [
  { view: "training-setup", title: "목표 설정", description: "목표 구간과 코스를 선택하세요.", icon: SlidersHorizontal },
  { view: "survey", title: "서베이 준비", description: "코스에 맞는 추천 조합을 익히세요.", icon: ClipboardCheck },
  { view: "script-hub", title: "만능 스크립트", description: "하나의 장면을 여러 답변으로 바꿔 보세요.", icon: BookOpenText },
  { view: "roleplay-hub", title: "롤플레이", description: "상황에 맞춰 질문하고 대안을 요청하세요.", icon: MessagesSquare },
  { view: "practice", title: "실전 연습", description: "빠른 연습이나 실전 모의고사로 말해 보세요.", icon: Play },
] as const;

export function LearningShortcuts() {
  return <section aria-label="학습 바로가기" className="space-y-4">
    <div><h2 className="text-lg font-bold text-zinc-950 dark:text-white">학습 바로가기</h2><p className="text-xs text-zinc-500 dark:text-zinc-400">오늘 필요한 단계부터 시작하세요. 학습 설정이 없으면 먼저 목표를 선택해 주세요.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {shortcuts.map(({ view, title, description, icon: Icon }) => <Link key={view} to={viewPathForId[view]} className="group rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30">
        <div className="flex items-center gap-3"><Icon aria-hidden="true" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /><h3 className="flex-1 text-sm font-bold">{title}</h3><ArrowUpRight aria-hidden="true" className="h-4 w-4 text-zinc-400 group-hover:text-indigo-500" /></div>
        <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>
      </Link>)}
    </div>
  </section>;
}
