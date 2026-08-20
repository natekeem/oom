import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Headphones,
  Loader2,
  RefreshCw,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import type { SttUiStatus } from "./sttUiStatus";

export type PracticeReviewPanelProps = {
  answer: string;
  audioUrl?: string | null;
  durationSeconds?: number;
  autoTranscribe: boolean;
  feedback: string;
  isFeedbackLoading: boolean;
  onAnswerChange: (value: string) => void;
  onFeedback: () => void;
  onNavigateToSettings?: () => void;
  onRetryAttempt: () => void;
  onTranscribe: () => void;
  sttError?: string | null;
  sttStatus: SttUiStatus;
  hasRecording: boolean;
};

/**
 * Phase B: Answer Review Panel.
 *
 * Ordered learning flow:
 * ① 내 녹음 (playback)
 * ② 음성 받아쓰기 (STT status, manual transcribe, editable transcript)
 * ③ AI 맞춤 피드백 (structured evaluation + same question retry)
 */
export function PracticeReviewPanel({
  answer,
  audioUrl,
  durationSeconds,
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
  hasRecording,
}: PracticeReviewPanelProps) {
  const sttConfigured = sttStatus !== "unconfigured";
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <section aria-label="답변 복기 영역" className="space-y-4" id="answer-review">
      <div className="border-l-4 border-indigo-500 pl-3.5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
          Phase B · 답변 복기
        </p>
        <h2 className="mt-0.5 text-lg font-extrabold text-zinc-950 dark:text-white sm:text-xl">
          방금 말한 내용을 듣고, 받아쓰고, 한 가지만 고쳐보세요.
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.25fr_1.1fr]">
        {/* ① 내 녹음 */}
        <Card className="flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white">
                <Headphones className="h-4 w-4 text-indigo-500" />
                <span className="text-sm">① 내 녹음</span>
              </div>
              {durationSeconds ? (
                <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {durationSeconds}초
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              실제로 말한 발화 속도와 끊김 여부를 귀로 먼저 확인해 보세요.
            </p>

            {audioUrl ? (
              <div className="mt-5 space-y-2">
                <audio className="w-full" controls src={audioUrl}>
                  <track kind="captions" />
                  브라우저가 오디오 재생을 지원하지 않습니다.
                </audio>
                <p className="text-[11px] text-zinc-400">
                  * 녹음은 서버로 전송되지 않고 브라우저 메모리에만 유지됩니다.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                {hasRecording
                  ? "오디오를 불러오고 있습니다..."
                  : "녹음이 완료되면 오디오 재생 컨트롤이 표시됩니다."}
              </div>
            )}
          </div>
        </Card>

        {/* ② 음성 받아쓰기 (STT) */}
        <Card className="border-indigo-200/80 p-5 dark:border-indigo-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-zinc-900 dark:text-white">
              ② 음성 받아쓰기 (STT)
            </p>
            {sttStatus === "success" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                변환 완료
              </span>
            ) : null}
          </div>

          {/* STT Status Banners */}
          {sttStatus === "unconfigured" ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/80 p-3.5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="text-xs font-bold">STT가 아직 설정되지 않았습니다.</p>
              <p className="mt-1 text-xs leading-5 text-amber-900/90 dark:text-amber-200/90">
                AI 설정에서 Whisper/STT Endpoint를 설정하면 녹음한 답변을 자동으로 텍스트로 변환할 수 있습니다.
              </p>
              {onNavigateToSettings ? (
                <Button
                  className="mt-2.5"
                  onClick={onNavigateToSettings}
                  size="sm"
                  variant="secondary"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  STT 설정하기
                </Button>
              ) : null}
            </div>
          ) : null}

          {sttStatus === "ready" ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <p className="font-bold">● STT 준비됨</p>
              <p className="mt-0.5 text-[11px] leading-5">
                {autoTranscribe
                  ? "녹음 종료 후 자동으로 영어 답변을 받아씁니다."
                  : "자동 변환은 꺼져 있습니다. 아래 버튼을 눌러 직접 변환할 수 있습니다."}
              </p>
            </div>
          ) : null}

          {sttStatus === "transcribing" ? (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-indigo-50 p-3 text-xs font-bold text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>음성을 텍스트로 변환 중...</span>
            </div>
          ) : null}

          {sttStatus === "error" ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50/90 p-3 text-red-900 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">음성 변환에 실패했습니다.</p>
                  <p className="text-[11px] leading-4 text-red-800 dark:text-red-300">
                    {sttError ?? "녹음은 그대로 보존되어 있습니다."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Manual Transcribe Button */}
          {sttConfigured && sttStatus !== "transcribing" && hasRecording ? (
            <div className="mt-3">
              <Button onClick={onTranscribe} size="sm" variant="secondary">
                <RefreshCw className="h-3.5 w-3.5" />
                {sttStatus === "success" || sttStatus === "error"
                  ? "다시 변환"
                  : "음성을 텍스트로 변환"}
              </Button>
            </div>
          ) : null}

          {/* Editable Transcript Area */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-bold text-zinc-700 dark:text-zinc-200"
                htmlFor="practice-transcript-input"
              >
                내 답변 Transcript
              </label>
              {wordCount > 0 ? (
                <span className="text-[11px] text-zinc-400">
                  단어 수: <strong className="text-zinc-700 dark:text-zinc-200">{wordCount}단어</strong>
                </span>
              ) : null}
            </div>

            <textarea
              aria-label="내 답변 Transcript 입력 및 수정"
              className="mt-2 min-h-36 w-full rounded-md border border-zinc-300 bg-white p-3 text-xs leading-6 text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:disabled:bg-zinc-900"
              disabled={sttStatus === "transcribing"}
              id="practice-transcript-input"
              onChange={(event) => onAnswerChange(event.target.value)}
              placeholder="녹음한 답변이 여기에 자동으로 표시됩니다. STT를 사용하지 않는 경우 직접 입력할 수도 있습니다."
              value={answer}
            />

            <p className="mt-1.5 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
              STT 결과가 정확하지 않을 수 있으니 AI 피드백 전에 한 번 확인·수정하세요.
            </p>
          </div>
        </Card>

        {/* ③ AI 맞춤 피드백 */}
        <Card className="flex flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white">
              <Bot className="h-4 w-4 text-indigo-500" />
              <span className="text-sm">③ AI 맞춤 피드백</span>
            </div>

            <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              Transcript를 확인한 다음 목표 등급 기준 피드백을 요청하세요.
            </p>

            <Button
              className="w-full"
              disabled={!answer.trim() || isFeedbackLoading || sttStatus === "transcribing"}
              onClick={onFeedback}
            >
              {isFeedbackLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  피드백 분석 중...
                </>
              ) : (
                "AI 피드백 받기"
              )}
            </Button>

            {feedback ? (
              <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-4 font-sans text-xs leading-6 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                {feedback}
              </div>
            ) : null}
          </div>

          <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <Button
              className="w-full"
              onClick={onRetryAttempt}
              variant="secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {feedback ? "피드백 반영하여 다시 말하기" : "같은 문제 다시 말하기"}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
