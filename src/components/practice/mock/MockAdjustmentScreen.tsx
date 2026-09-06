import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from "lucide-react";
import { Card } from "../../ui/Card";
import type { MockAdjustment } from "./mockSessionTypes";

const adjustmentOptions: Array<{
  id: MockAdjustment;
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    id: "easier",
    icon: ArrowDown,
    title: "조금 쉽게",
    description: "두 번째 세션을 조금 더 편한 난이도로 이어갑니다.",
  },
  {
    id: "similar",
    icon: ArrowRight,
    title: "비슷하게",
    description: "지금과 비슷한 난이도로 이어갑니다.",
  },
  {
    id: "harder",
    icon: ArrowUp,
    title: "조금 어렵게",
    description: "한 단계 더 도전적인 질문으로 이어갑니다.",
  },
];

export function MockAdjustmentScreen({
  remainingTime,
  onSelect,
}: {
  remainingTime: string;
  onSelect: (adjustment: MockAdjustment) => void;
}) {
  return (
    <Card className="mx-auto w-full max-w-4xl p-7 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
          1st Session 완료
        </p>
        <p className="font-mono text-sm font-black text-zinc-700 dark:text-zinc-200">
          남은 시간 {remainingTime}
        </p>
      </div>
      <h1 className="mt-4 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">지금까지 질문 난이도는 어땠나요?</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        지금까지 답하기 편했던 정도를 기준으로 선택하세요. 선택한 난이도로 두 번째 세션의 질문 구성이 고정됩니다.
      </p>
      <div className="mt-7 grid gap-3" data-testid="mock-adjustment-options">
        {adjustmentOptions.map(({ id, icon: Icon, title, description }) => (
          <button
            className="group flex min-h-[80px] w-full items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
            key={id}
            onClick={() => onSelect(id)}
            type="button"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:group-hover:bg-indigo-900">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-zinc-950 dark:text-white">{title}</span>
              <span className="mt-1 block text-xs leading-5 text-zinc-600 dark:text-zinc-300">{description}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-6 border-t border-zinc-100 pt-4 text-xs leading-5 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        이 선택은 이번 모의고사의 두 번째 세션에만 반영되며, 저장된 코스·난이도 설정은 바뀌지 않습니다.
      </p>
    </Card>
  );
}
