import { CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import type { StudyUnit } from "./activityRepository";
import { useStudyCompletion } from "./useStudyCompletion";

export function CompletionStatus({ status }: { status: string }) {
  return <p role={status === "idle" ? undefined : "status"} className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
    {status === "saved" ? "학습 완료를 계정에 기록했어요." : status === "local" ? "학습을 완료했어요. 로그인하면 다음 학습부터 계정에 기록할 수 있어요."
      : status === "error" ? "기록을 저장하지 못했어요. 다시 시도하거나 학습을 계속할 수 있어요."
      : status === "saving" ? "학습 완료를 기록하고 있어요…" : "로그인 상태에서 완료하면 마이페이지의 학습 활동에 기록됩니다."}
  </p>;
}

export function StudyCompletion({ unit }: { unit: StudyUnit }) {
  const completion = useStudyCompletion(unit);
  return <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
    <CompletionStatus status={completion.status} />
    <Button variant="secondary" disabled={completion.disabled} onClick={() => void completion.complete()} className="shrink-0">
      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
      {completion.status === "saved" || completion.status === "local" ? "학습 완료됨" : completion.status === "error" ? "완료 기록 다시 시도" : "학습 완료"}
    </Button>
  </div>;
}
