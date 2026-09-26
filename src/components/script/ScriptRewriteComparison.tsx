import { Clipboard, Sparkles } from "lucide-react";
import { useMemo } from "react";
import type { ScriptRewriteChangeType, ScriptRewriteResult } from "../../../shared/ai/features";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { buildLearnerRewriteDiff, type RewriteDiffSegment } from "./scriptRewriteDiff";

const CHANGE_LABELS: Record<ScriptRewriteChangeType, string> = {
  spoken_style: "구어체",
  organization: "문장 정리",
  specificity: "구체성",
  naturalness: "자연스러움",
  conciseness: "간결성",
};

const DEFAULT_REASONS: Record<ScriptRewriteChangeType, string> = {
  spoken_style: "실제 말하기처럼 자연스럽게 이어지도록 다듬었어요.",
  organization: "긴 문장이나 아이디어 순서를 정리해 발화 부담을 줄였어요.",
  specificity: "장면을 떠올리기 쉬운 디테일을 보강했어요.",
  naturalness: "영어로 말했을 때 더 자연스러운 표현으로 바꿨어요.",
  conciseness: "핵심 뜻을 유지하면서 불필요한 반복을 줄였어요.",
};

export function getScriptChangeNotes(result: ScriptRewriteResult) {
  return result.schemaVersion === 2
    ? result.changes.map((change) => ({
        label: CHANGE_LABELS[change.type],
        summary: change.summary,
        reason: change.reason ?? DEFAULT_REASONS[change.type],
      }))
    : result.changes.map((summary) => ({ label: "변형", summary, reason: "원문의 핵심 뜻을 유지하며 말하기 좋은 표현으로 다듬었어요." }));
}

function DiffText({ segments, side }: { segments: RewriteDiffSegment[]; side: "original" | "rewritten" }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-200 sm:text-[15px] sm:leading-8">
      {segments.map((segment, index) => segment.changed ? (
        <mark
          aria-label={side === "original" ? "원본에서 바뀐 부분" : "AI 변형에서 달라진 부분"}
          className={side === "original"
            ? "rounded-sm bg-amber-100/80 px-0.5 text-inherit underline decoration-amber-600 decoration-dotted decoration-2 underline-offset-4 dark:bg-amber-950/55 dark:decoration-amber-400"
            : "rounded-sm bg-indigo-100/80 px-0.5 text-inherit underline decoration-indigo-600 decoration-2 underline-offset-4 dark:bg-indigo-950/60 dark:decoration-indigo-400"}
          key={`${index}-${segment.text}`}
        >
          {segment.text}
        </mark>
      ) : <span key={`${index}-${segment.text}`}>{segment.text}</span>)}
    </p>
  );
}

export function ScriptRewriteComparison({
  original,
  result,
  onCopy,
}: {
  original: string;
  result: ScriptRewriteResult;
  onCopy: () => void;
}) {
  const diff = useMemo(() => buildLearnerRewriteDiff(original, result.rewrittenScript), [original, result.rewrittenScript]);
  const notes = getScriptChangeNotes(result);

  return (
    <Card className="overflow-hidden" data-testid="script-rewrite-comparison">
      <section aria-labelledby="rewrite-points-heading" className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100" id="rewrite-points-heading">변형 포인트</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {notes.slice(0, 5).map((note, index) => (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300" key={`${note.label}-${note.summary}-${index}`}>
                <strong className="text-indigo-700 dark:text-indigo-300">{note.label}</strong>
                {note.summary}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-2">
        <section aria-labelledby="rewrite-original-heading" className="border-b border-zinc-100 p-5 dark:border-zinc-800 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100" id="rewrite-original-heading">원본 스크립트</h3>
            <Badge tone="amber">점선 밑줄 · 바뀐 표현</Badge>
          </div>
          <DiffText segments={diff.original} side="original" />
        </section>
        <section aria-labelledby="rewrite-result-heading" className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100" id="rewrite-result-heading">AI 변형 결과</h3>
            <Button aria-label="AI 변형 결과 복사" onClick={onCopy} size="sm" variant="ghost"><Clipboard className="h-3.5 w-3.5" />복사</Button>
          </div>
          <DiffText segments={diff.rewritten} side="rewritten" />
        </section>
      </div>

      <section aria-labelledby="rewrite-reasons-heading" className="border-t border-zinc-100 bg-zinc-50/70 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/60 sm:px-6">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100" id="rewrite-reasons-heading">변경 이유</h3>
        {notes.length ? (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {notes.slice(0, 5).map((note, index) => (
              <li className="text-xs leading-5 text-zinc-600 dark:text-zinc-300" key={`${note.reason}-${index}`}><strong className="text-zinc-800 dark:text-zinc-100">{note.label}:</strong> {note.reason}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{diff.hasMeaningfulChanges ? "표시된 표현을 중심으로 원본과 비교해 보세요." : "단어 기준으로 의미 있는 변화가 거의 없어요. 문장부호나 대소문자만 달라진 부분은 강조하지 않았습니다."}</p>
        )}
      </section>
    </Card>
  );
}
