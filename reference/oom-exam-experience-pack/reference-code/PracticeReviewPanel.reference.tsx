import { AlertCircle, CheckCircle2, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export type SttUiStatus =
  | "unconfigured"
  | "ready"
  | "transcribing"
  | "success"
  | "error";

type PracticeReviewPanelProps = {
  answer: string;
  audioUrl?: string | null;
  autoTranscribe: boolean;
  feedback: string;
  isFeedbackLoading: boolean;
  onAnswerChange: (value: string) => void;
  onFeedback: () => void;
  onNavigateToSettings: () => void;
  onRetryAttempt: () => void;
  onTranscribe: () => void;
  sttError?: string | null;
  sttStatus: SttUiStatus;
};

/**
 * Reference review UI.
 * Keep recording → STT → AI feedback visible as one continuous learning flow.
 */
export function PracticeReviewPanel({
  answer,
  audioUrl,
  autoTranscribe,
  feedback,
  isFeedbackLoading,
  onAnswerChange,
  onFeedback,
  onNavigateToSettings,
  onRetryAttempt,
  onTranscribe,
  sttError,
  sttStatus,
}: PracticeReviewPanelProps) {
  const sttConfigured = sttStatus !== "unconfigured";

  return (
    <section className="space-y-4" id="answer-review">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
          답변 복기
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-zinc-950 dark:text-white">
          방금 말한 내용을 듣고, 받아쓰고, 한 가지만 고쳐보세요.
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.75fr_1.25fr_1fr]">
        <Card className="p-5">
          <p className="text-sm font-extrabold">① 내 녹음</p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            먼저 실제로 말한 답변을 한 번 들어보세요.
          </p>
          {audioUrl ? (
            <audio className="mt-5 w-full" controls src={audioUrl}>
              <track kind="captions" />
            </audio>
          ) : (
            <p className="mt-5 rounded-md bg-zinc-50 p-4 text-xs text-zinc-500 dark:bg-zinc-900">
              녹음이 완료되면 재생 컨트롤이 표시됩니다.
            </p>
          )}
        </Card>

        <Card className="border-indigo-200 p-5 dark:border-indigo-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-extrabold">② 음성 받아쓰기 (STT)</p>
            {sttStatus === "success" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                변환 완료
              </span>
            ) : null}
          </div>

          {sttStatus === "unconfigured" ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <p className="text-sm font-bold">STT가 아직 설정되지 않았습니다.</p>
              <p className="mt-1 text-xs leading-5">
                설정하면 녹음한 영어 답변을 자동으로 텍스트로 바꿀 수 있습니다.
              </p>
              <Button className="mt-3" onClick={onNavigateToSettings} variant="secondary">
                <Settings2 className="h-4 w-4" />
                STT 설정하기
              </Button>
            </div>
          ) : null}

          {sttStatus === "ready" ? (
            <div className="mt-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-bold">STT 준비됨</p>
              <p className="mt-1 text-xs">
                {autoTranscribe
                  ? "녹음 종료 후 자동으로 받아씁니다."
                  : "자동 변환은 꺼져 있습니다. 아래 버튼으로 직접 변환할 수 있습니다."}
              </p>
            </div>
          ) : null}

          {sttStatus === "transcribing" ? (
            <div className="mt-4 rounded-md bg-indigo-50 p-4 text-sm font-bold text-indigo-900">
              음성을 텍스트로 변환 중...
            </div>
          ) : null}

          {sttStatus === "error" ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-bold">음성 변환에 실패했습니다.</p>
                  <p className="mt-1 text-xs leading-5">
                    {sttError ?? "녹음은 그대로 보존되어 있습니다."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {sttConfigured && sttStatus !== "transcribing" ? (
            <Button className="mt-4" onClick={onTranscribe} variant="secondary">
              <RefreshCw className="h-4 w-4" />
              {sttStatus === "success" || sttStatus === "error"
                ? "다시 변환"
                : "음성을 텍스트로 변환"}
            </Button>
          ) : null}

          <label className="mt-5 block">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
              내 답변 Transcript
            </span>
            <textarea
              className="mt-2 min-h-52 w-full rounded-md border border-zinc-300 bg-white p-3 text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950"
              onChange={(event) => onAnswerChange(event.target.value)}
              placeholder="녹음한 답변이 여기에 자동으로 표시됩니다. STT를 사용하지 않는 경우 직접 입력할 수도 있습니다."
              value={answer}
            />
          </label>
          <p className="mt-2 text-[11px] leading-5 text-zinc-500">
            STT 결과가 정확하지 않을 수 있으니 AI 피드백 전에 한 번 확인·수정하세요.
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-extrabold">③ AI 맞춤 피드백</p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Transcript를 확인한 다음 피드백을 요청하세요.
          </p>
          <Button
            className="mt-5 w-full"
            disabled={!answer.trim() || isFeedbackLoading}
            onClick={onFeedback}
          >
            AI 피드백 받기
          </Button>

          {feedback ? (
            <>
              <div className="mt-5 whitespace-pre-wrap rounded-md bg-zinc-50 p-4 text-sm leading-6 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                {feedback}
              </div>
              <Button className="mt-4 w-full" onClick={onRetryAttempt} variant="secondary">
                피드백 반영하여 다시 말하기
              </Button>
            </>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
