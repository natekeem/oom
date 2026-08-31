import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import type { MockAdjustment } from "./mockSessionTypes";

export function MockAdjustmentScreen({
  remainingTime,
  onSelect,
}: {
  remainingTime: string;
  onSelect: (adjustment: MockAdjustment) => void;
}) {
  return (
    <Card className="mx-auto max-w-3xl border-indigo-200 p-6 text-center dark:border-indigo-900 sm:p-10">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
        1st Session 완료 · 남은 시간 {remainingTime}
      </p>
      <h1 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white">지금까지 질문 난이도는 어땠나요?</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        답변 분석이나 점수 추정이 아닌 사용자의 체감 선택입니다. 선택 후 2nd Session 구성이 한 번 고정됩니다.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Button onClick={() => onSelect("easier")} variant="secondary">
          <ArrowDown className="h-4 w-4" /> 조금 쉽게
        </Button>
        <Button onClick={() => onSelect("similar")}>
          <ArrowRight className="h-4 w-4" /> 비슷하게
        </Button>
        <Button onClick={() => onSelect("harder")} variant="secondary">
          <ArrowUp className="h-4 w-4" /> 조금 어렵게
        </Button>
      </div>
      <p className="mt-6 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        이 선택은 이번 OOM 모의 연습의 2nd Session prompt source에만 적용되며, STEP 1에서 저장한 Course × Level 설정은 바뀌지 않습니다.
      </p>
    </Card>
  );
}
