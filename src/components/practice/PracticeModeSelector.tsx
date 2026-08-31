import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export type PracticeMode = "quick" | "mock";

export function PracticeModeSelector({ onSelect }: { onSelect: (mode: PracticeMode) => void }) {
  return (
    <div className="space-y-6" data-testid="practice-mode-selector">
      <header>
        <Badge tone="indigo">STEP 6 · 실전 연습</Badge>
        <h1 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">
          배운 내용을 실제 말하기로 연결해보세요.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          한 문제를 바로 고쳐 말하거나, 시험 흐름을 끝까지 이어서 경험할 수 있습니다.
        </p>
      </header>

      <section aria-label="STEP 6 연습 방식" className="grid gap-4 lg:grid-cols-2">
        <Card className="flex h-full flex-col border-indigo-200 p-6 dark:border-indigo-900">
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <Badge tone="indigo">약 2~5분</Badge>
          </div>
          <h2 className="mt-5 text-xl font-black text-zinc-950 dark:text-white">빠른 연습</h2>
          <p className="mt-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">한 문제에 집중</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            질문 → 녹음 → 복기 흐름을 짧게 반복합니다. STT·AI 피드백 뒤 같은 질문에 바로 재도전할 수 있습니다.
          </p>
          <Button className="mt-6 w-full" onClick={() => onSelect("quick")}>
            빠른 연습 시작 <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        <Card className="flex h-full flex-col border-emerald-200 p-6 dark:border-emerald-900">
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Clock3 className="h-5 w-5" />
            </span>
            <Badge tone="emerald">최대 40분</Badge>
          </div>
          <h2 className="mt-5 text-xl font-black text-zinc-950 dark:text-white">실전 모의고사</h2>
          <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">시험 흐름을 끝까지</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Survey → Self Assessment → Warm-up → 2 Sessions 순서로 진행하고, 종료 후 답변을 한꺼번에 복기합니다.
          </p>
          <Button className="mt-6 w-full" onClick={() => onSelect("mock")} variant="secondary">
            모의고사 시작 <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </section>
    </div>
  );
}
