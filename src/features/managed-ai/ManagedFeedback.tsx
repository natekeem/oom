import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AnswerFeedbackResultV1, AnswerFeedbackSource } from "../../../shared/ai/features";
import type { AiQuota, ManagedAiFeedbackV1 } from "../../../shared/managed-ai/feedback";
import { useAuth } from "../../auth/useAuth";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import type { LlmSettings } from "../../types";
import { AiExecutionError, aiErrorMessages, toAiExecutionError } from "../ai/errors";
import { getManagedAiQuota } from "../ai/managedProvider";
import { getAiConnection, resolveAiProvider } from "../ai/providerResolver";
import { runAiFeature } from "../ai/runAiFeature";

function useQuota(userId: string | undefined, enabled: boolean) {
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!userId || !enabled) {
      return;
    }
    const controller = new AbortController();
    const load = () => void getManagedAiQuota("answer_feedback", controller.signal)
      .then((value) => { if (!controller.signal.aborted) { setQuota(value); setError(""); } })
      .catch((reason) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : aiErrorMessages.SERVER_ERROR); });
    load();
    window.addEventListener("focus", load);
    window.addEventListener("oom-ai-changed", load);
    const interval = window.setInterval(load, 60000);
    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("focus", load);
      window.removeEventListener("oom-ai-changed", load);
    };
  }, [userId, enabled, revision]);
  return { quota, setQuota, error, refresh: () => setRevision((value) => value + 1) };
}

export function QuotaSummary({ quota }: { quota: AiQuota }) {
  return <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
    <p>오늘 {quota.feature === "answer_feedback" ? "답변 피드백" : "AI"} <strong className="text-zinc-800 dark:text-zinc-200">{quota.used} / {quota.limit} 사용</strong> · {quota.remaining}회 남음{quota.reserved > 0 ? ` · 처리 중 ${quota.reserved}회` : ""}</p>
    <p>한국 시간 자정에 초기화 · 다음 {new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(quota.resetsAt))}</p>
  </div>;
}

export function FeedbackResult({ feedback: value }: { feedback: ManagedAiFeedbackV1 }) {
  const labels = { relevance: "질문 적합성", organization: "구성", specificity: "구체성", naturalness: "자연스러움", languageControl: "문법/표현" };
  return <div className="space-y-5 break-words" aria-label="AI COACH 피드백">
    <div><Badge tone="indigo">AI COACH</Badge><p className="mt-2 text-sm font-semibold leading-6 text-zinc-900 dark:text-white">{value.overallSummary}</p></div>
    <div className="grid gap-5 border-y border-zinc-200 py-4 dark:border-zinc-800 md:grid-cols-3">
      <div><p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">KEEP · 잘한 점</p><ul className="mt-2 space-y-1 text-sm leading-6">{value.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
      <div><p className="text-xs font-bold text-amber-700 dark:text-amber-400">FIX · 우선 고칠 점</p>{value.improvements.map((item, index) => <div className="mt-2 text-sm leading-6" key={index}><p className="font-semibold">{item.issue}</p><p className="text-zinc-500 dark:text-zinc-400">{item.whyItMatters}</p><p>{item.suggestion}</p></div>)}</div>
      <div><p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">RETRY · 다시 말할 때 한 가지</p><p className="mt-2 text-sm leading-6">{value.retryTip}</p></div>
    </div>
    <details><summary className="cursor-pointer text-xs font-semibold">연습용 답변 신호 · 1–5</summary><dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">{Object.entries(labels).map(([key, label]) => <div key={key}><dt className="text-zinc-500">{label}</dt><dd className="mt-1 font-semibold">{value.dimensions[key as keyof typeof labels]} / 5</dd></div>)}</dl></details>
    <details><summary className="cursor-pointer text-xs font-semibold">더 자연스러운 예시 답변</summary><p lang="en" className="mt-3 whitespace-pre-wrap text-sm leading-7">{value.improvedAnswer}</p></details>
    <p className="text-xs text-zinc-500 dark:text-zinc-400">AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다. 텍스트만으로 발음이나 말하기 속도를 평가하지 않습니다.</p>
  </div>;
}

export function ManagedFeedback(props: {
  answer: string;
  question: string;
  context: string;
  settings: LlmSettings;
  onRetry: () => void;
  disabled?: boolean;
  durationSeconds?: number;
  source?: AnswerFeedbackSource;
  learningAttemptId?: string | null;
}) {
  const { user, status } = useAuth();
  return <FeedbackSession key={`${user?.id || status}:${props.question}`} {...props} userId={user?.id} authStatus={status} />;
}

function FeedbackSession({ answer, question, context, settings, onRetry, disabled, durationSeconds, source = "quick_practice", learningAttemptId, userId, authStatus }: {
  answer: string; question: string; context: string; settings: LlmSettings; onRetry: () => void; disabled?: boolean; durationSeconds?: number; source?: AnswerFeedbackSource; learningAttemptId?: string | null; userId?: string; authStatus: string;
}) {
  let provider: "managed" | "custom" | null = null;
  let configError: AiExecutionError | null = null;
  try { provider = resolveAiProvider(settings); }
  catch (error) { configError = toAiExecutionError(error, null); }
  const { quota, setQuota, error: quotaError, refresh } = useQuota(userId, provider === "managed");
  const [result, setResult] = useState<{ answer: string; value: AnswerFeedbackResultV1 } | null>(null);
  const [error, setError] = useState<AiExecutionError | null>(null);
  const [loading, setLoading] = useState(false);
  const lock = useRef(false);
  const request = useRef<{ answer: string; id: string } | null>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const submit = async () => {
    if (lock.current || !answer.trim() || configError || (provider === "managed" && !userId)) return;
    lock.current = true;
    setLoading(true);
    setError(null);
    if (!request.current || request.current.answer !== answer) request.current = { answer, id: crypto.randomUUID() };
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await runAiFeature({
        feature: "answer_feedback",
        input: { question, answer, context, source, durationSeconds, learningAttemptId: learningAttemptId ?? undefined },
        customSettings: settings,
        requestId: request.current.id,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setResult({ answer, value: response.result });
      if (response.quota) setQuota(response.quota);
      if (response.providerSource === "managed") window.dispatchEvent(new Event("oom-ai-changed"));
    } catch (reason) {
      if (controller.signal.aborted) return;
      const safe = toAiExecutionError(reason, provider);
      setError(safe);
      if (safe.quota) setQuota(safe.quota);
      if (safe.terminal) request.current = null;
    } finally {
      if (!controller.signal.aborted) { lock.current = false; setLoading(false); }
    }
  };
  const current = result?.answer === answer ? result.value : null;
  const connection = getAiConnection(settings);
  return <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
    <div className="flex items-center gap-2"><Badge tone={connection.source === "custom" ? "amber" : "indigo"}>{connection.source === "custom" ? "사용자 API" : "OOM 관리형 AI"}</Badge></div>
    {provider === "managed" && !userId ? <div className="space-y-2"><p className="text-xs leading-5">{authStatus === "unconfigured" ? "로그인 기능 설정 후 OOM 관리형 AI를 이용할 수 있어요." : aiErrorMessages.LOGIN_REQUIRED}</p><ButtonLink to="/mypage/" size="sm" variant="secondary">로그인 안내</ButtonLink></div> : null}
    {provider === "managed" && userId ? quota ? <><QuotaSummary quota={quota} />{!quota.enabled ? <p className="text-xs">{aiErrorMessages.AI_DISABLED}</p> : quota.remaining === 0 ? <p className="text-xs">{aiErrorMessages.DAILY_QUOTA_EXCEEDED}</p> : null}</> : <p className="text-xs" role="status">{quotaError || "오늘 사용량을 확인하고 있어요..."}</p> : null}
    {quotaError && provider === "managed" ? <Button size="sm" variant="secondary" onClick={refresh}>사용량 다시 확인</Button> : null}
    {!answer.trim() ? <p className="text-xs">받아쓴 답변을 확인하거나 직접 입력해 주세요. 녹음만으로는 AI 피드백을 받을 수 없어요.</p> : null}
    {!current ? <Button className="w-full" disabled={!answer.trim() || answer.length > 8000 || disabled || loading || Boolean(configError) || (provider === "managed" && (!userId || !quota || !quota.enabled || quota.remaining === 0))} onClick={() => void submit()}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" />답변을 분석하고 있어요...</> : error ? "다시 시도" : "AI 피드백 받기"}</Button> : null}
    <p className="text-[11px] leading-5 text-zinc-500">{provider === "custom" ? "답변 텍스트는 브라우저에서 설정한 사용자 Endpoint로 직접 전송되며 OOM 관리형 사용량을 차감하지 않습니다." : "답변 텍스트는 OOM 관리형 AI 처리를 위해 Google Gemini에 전달됩니다. 원문 답변과 녹음 파일은 OOM DB에 저장하지 않습니다."}</p>
    {configError || error ? <p role="alert" className="text-xs leading-5 text-amber-700 dark:text-amber-300">{(configError || error)?.message}{error?.quotaConsumed === false ? " 이번 요청은 사용 횟수에 포함되지 않았어요." : ""}</p> : null}
    {current?.format === "structured" ? <FeedbackResult feedback={current.feedback} /> : current?.format === "text" ? <div className="whitespace-pre-wrap rounded-md border border-zinc-200 p-4 text-sm leading-6 dark:border-zinc-800">{current.text}</div> : null}
    <Button className="w-full" variant="secondary" onClick={onRetry}>{current ? "피드백 반영하여 다시 말하기" : "같은 문제 다시 말하기"}</Button>
  </div>;
}

export function ManagedAiSettings() {
  const { user, status } = useAuth();
  return <ManagedSettingsSession key={user?.id || status} userId={user?.id} />;
}

function ManagedSettingsSession({ userId }: { userId?: string }) {
  const { quota, error, refresh } = useQuota(userId, true);
  return <Card className="space-y-4 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">OOM 관리형 AI</h2><Badge tone={quota?.enabled ? "emerald" : "default"}>{!userId ? "로그인 필요" : quota?.enabled ? "이용 가능" : quota ? "일시 중지" : "확인 중"}</Badge></div>
    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">사용자 API가 설정되지 않았을 때 답변 피드백, 스크립트 변형, 롤플레이 질문 생성에 기본으로 사용됩니다.</p>
    {quota ? <><QuotaSummary quota={quota} />{!quota.enabled ? <p className="text-sm">{aiErrorMessages.AI_DISABLED}</p> : null}</> : <p className="text-sm">{!userId ? aiErrorMessages.LOGIN_REQUIRED : error || "사용량을 확인하고 있어요..."}</p>}
    {error ? <Button onClick={refresh} size="sm" variant="secondary">다시 확인</Button> : null}
    <p className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">기능에 필요한 학습 텍스트는 Google Gemini에서 처리됩니다. OOM은 원문 입력을 별도 저장하지 않으며, 생성 결과와 사용량 정보만 저장할 수 있습니다. 녹음 파일은 전송하지 않습니다.</p>
  </Card>;
}
