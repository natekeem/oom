import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import {
  aiMessages,
  getAiQuota,
  getManagedFeedback,
  ManagedAiError,
  type AiQuota,
  type ManagedAiFeedbackV1,
} from "./api";

function useQuota(userId: string | undefined) {
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    let version = 0;
    const load = () => {
      const currentVersion = ++version;
      void getAiQuota(userId, controller.signal)
        .then((q) => {
          if (!controller.signal.aborted && currentVersion === version) {
            setQuota(q);
            setError("");
          }
        })
        .catch((e) => {
          if (!controller.signal.aborted && currentVersion === version)
            setError(e instanceof Error ? e.message : aiMessages.SERVER_ERROR);
        });
    };
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
  }, [userId, revision]);
  return { quota, setQuota, error, refresh: () => setRevision((n) => n + 1) };
}
export function QuotaSummary({ quota }: { quota: AiQuota }) {
  return (
    <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
      <p>
        오늘 AI 피드백{" "}
        <strong className="text-zinc-800 dark:text-zinc-200">
          {quota.used} / {quota.limit} 사용
        </strong>{" "}
        · {quota.remaining}회 남음
        {quota.reserved > 0 ? ` · 분석 중 ${quota.reserved}회` : ""}
      </p>
      <p>
        한국 시간 자정에 초기화 · 다음{" "}
        {new Intl.DateTimeFormat("ko-KR", {
          timeZone: "Asia/Seoul",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(new Date(quota.resetsAt))}
      </p>
    </div>
  );
}
export function FeedbackResult({
  feedback: f,
}: {
  feedback: ManagedAiFeedbackV1;
}) {
  const labels = {
    relevance: "질문 적합성",
    organization: "구성",
    specificity: "구체성",
    naturalness: "자연스러움",
    languageControl: "문법/표현",
  };
  return (
    <div className="space-y-5 break-words" aria-label="AI COACH 피드백">
      <div>
        <Badge tone="indigo">AI COACH</Badge>
        <p className="mt-2 text-sm font-semibold leading-6 text-zinc-900 dark:text-white">
          {f.overallSummary}
        </p>
      </div>
      <div className="grid gap-5 border-y border-zinc-200 py-4 dark:border-zinc-800 md:grid-cols-3">
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            KEEP · 잘한 점
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6">
            {f.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
            FIX · 우선 고칠 점
          </p>
          {f.improvements.map((s, i) => (
            <div className="mt-2 text-sm leading-6" key={i}>
              <p className="font-semibold">{s.issue}</p>
              <p className="text-zinc-500 dark:text-zinc-400">
                {s.whyItMatters}
              </p>
              <p>{s.suggestion}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            RETRY · 다시 말할 때 한 가지
          </p>
          <p className="mt-2 text-sm leading-6">{f.retryTip}</p>
        </div>
      </div>
      <details>
        <summary className="cursor-pointer text-xs font-semibold">
          연습용 답변 신호 · 1–5
        </summary>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          {Object.entries(labels).map(([key, label]) => (
            <div key={key}>
              <dt className="text-zinc-500">{label}</dt>
              <dd className="mt-1 font-semibold">
                {f.dimensions[key as keyof typeof labels]} / 5
              </dd>
            </div>
          ))}
        </dl>
      </details>
      <details>
        <summary className="cursor-pointer text-xs font-semibold">
          더 자연스러운 예시 답변
        </summary>
        <p lang="en" className="mt-3 whitespace-pre-wrap text-sm leading-7">
          {f.improvedAnswer}
        </p>
      </details>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        AI 피드백은 공식 OPIc 점수·등급 판정이 아닙니다. 텍스트만으로 발음이나
        말하기 속도를 평가하지 않습니다.
      </p>
    </div>
  );
}
export function ManagedFeedback(props: {
  answer: string;
  question: string;
  context: string;
  onRetry: () => void;
  disabled?: boolean;
  learningAttemptId?: string | null;
}) {
  const { user, status } = useAuth();
  // Synchronous remount on account change prevents old results or quota flashing.
  return (
    <ManagedFeedbackSession
      key={`${user?.id || status}:${props.question}`}
      {...props}
      userId={user?.id}
      authStatus={status}
    />
  );
}
function ManagedFeedbackSession({
  answer,
  question,
  context,
  onRetry,
  disabled,
  learningAttemptId,
  userId,
  authStatus,
}: {
  answer: string;
  question: string;
  context: string;
  onRetry: () => void;
  disabled?: boolean;
  learningAttemptId?: string | null;
  userId?: string;
  authStatus: string;
}) {
  const { quota, setQuota, error: quotaError, refresh } = useQuota(userId);
  const [result, setResult] = useState<{
    answer: string;
    feedback: ManagedAiFeedbackV1;
  } | null>(null);
  const [error, setError] = useState<ManagedAiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const lock = useRef(false);
  const request = useRef<{ answer: string; id: string } | null>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const submit = async () => {
    if (lock.current || !userId || !answer.trim()) return;
    lock.current = true;
    setLoading(true);
    setError(null);
    setPendingAnswer(answer);
    if (!request.current || request.current.answer !== answer)
      request.current = { answer, id: crypto.randomUUID() };
    const controller = new AbortController();
    abort.current = controller;
    try {
      const data = await getManagedFeedback(
        userId,
        { requestId: request.current.id, answer, question, context, learningAttemptId: learningAttemptId ?? undefined },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setResult({ answer, feedback: data.feedback });
      setQuota(data.quota);
      window.dispatchEvent(new Event("oom-ai-changed"));
    } catch (e) {
      if (controller.signal.aborted) return;
      const safe =
        e instanceof ManagedAiError ? e : new ManagedAiError("SERVER_ERROR");
      setError(safe);
      if (safe.quota) setQuota(safe.quota);
      if (safe.terminal) {
        request.current = null;
        setPendingAnswer(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        lock.current = false;
        setLoading(false);
      }
    }
  };
  const current = result?.answer === answer ? result.feedback : null;
  return (
    <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
      {!userId ? (
        <div className="space-y-2">
          <p className="text-xs leading-5">
            {authStatus === "unconfigured"
              ? "로그인 기능 설정 후 OOM AI 피드백을 이용할 수 있어요."
              : aiMessages.LOGIN_REQUIRED}
          </p>
          <ButtonLink to="/mypage/" size="sm" variant="secondary">
            로그인 안내
          </ButtonLink>
        </div>
      ) : (
        <>
          {quota ? (
            <QuotaSummary quota={quota} />
          ) : (
            <p className="text-xs" role="status">
              {quotaError || "오늘 사용량을 확인하고 있어요..."}
            </p>
          )}
          {quotaError ? (
            <Button size="sm" variant="secondary" onClick={refresh}>
              사용량 다시 확인
            </Button>
          ) : null}
          {!quota?.enabled && quota ? (
            <p className="text-xs leading-5">{aiMessages.AI_DISABLED}</p>
          ) : quota?.remaining === 0 ? (
            <p className="text-xs leading-5">
              {aiMessages.DAILY_QUOTA_EXCEEDED}
            </p>
          ) : null}
        </>
      )}
      {!answer.trim() ? (
        <p className="text-xs leading-5">{aiMessages.NO_TEXT_INPUT}</p>
      ) : null}
      {!current ? (
        <Button
          className="w-full"
          disabled={
            !userId ||
            !answer.trim() ||
            answer.length > 8000 ||
            disabled ||
            loading ||
            !quota ||
            (!quota.enabled && pendingAnswer !== answer) ||
            (quota.remaining === 0 && pendingAnswer !== answer)
          }
          onClick={() => void submit()}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              답변을 분석하고 있어요...
            </>
          ) : error ? (
            "다시 시도"
          ) : (
            "AI 피드백 받기"
          )}
        </Button>
      ) : null}
      <p className="text-[11px] leading-5 text-zinc-500">
        요청하면 답변 텍스트가 외부 AI 제공자 Google Gemini에 전달됩니다. OOM은
        원문 답변을 별도 저장하지 않으며 피드백 결과와 사용량 정보를 저장합니다.
        관리형 AI로 녹음을 전송하지 않습니다.
      </p>
      {error ? (
        <p
          role="alert"
          className="text-xs leading-5 text-amber-700 dark:text-amber-300"
        >
          {error.message}
          {error.quotaConsumed === false
            ? " 이번 요청은 사용 횟수에 포함되지 않았어요."
            : ""}
        </p>
      ) : null}
      {current ? <FeedbackResult feedback={current} /> : null}
      <Button className="w-full" variant="secondary" onClick={onRetry}>
        {current ? "피드백 반영하여 다시 말하기" : "같은 문제 다시 말하기"}
      </Button>
    </div>
  );
}
export function ManagedAiSettings() {
  const { user, status } = useAuth();
  return <ManagedSettingsSession key={user?.id || status} userId={user?.id} />;
}
function ManagedSettingsSession({ userId }: { userId?: string }) {
  const { quota, error, refresh } = useQuota(userId);
  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">OOM 관리형 AI</h2>
        <Badge tone={quota?.enabled ? "emerald" : "default"}>
          {!userId
            ? "로그인 필요"
            : quota?.enabled
              ? "이용 가능"
              : quota
                ? "일시 중지"
                : "확인 중"}
        </Badge>
      </div>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        빠른 연습을 마치고 받아쓰거나 직접 입력한 답변으로 KEEP / FIX / RETRY
        코칭을 받아보세요.
      </p>
      {quota ? (
        <>
          <QuotaSummary quota={quota} />
          {!quota.enabled ? (
            <p className="text-sm">{aiMessages.AI_DISABLED}</p>
          ) : null}
        </>
      ) : (
        <p className="text-sm">
          {!userId
            ? aiMessages.LOGIN_REQUIRED
            : error || "사용량을 확인하고 있어요..."}
        </p>
      )}
      {error ? (
        <Button onClick={refresh} size="sm" variant="secondary">
          다시 확인
        </Button>
      ) : null}
      <p className="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
        답변 텍스트는 외부 AI 제공자 Google Gemini에서 피드백 생성을 위해
        처리됩니다. OOM DB에 원문 답변을 별도 저장하지 않으며 피드백 결과와
        사용량 정보를 저장합니다. 녹음 파일은 관리형 AI로 전송하지 않습니다.
      </p>
      <ButtonLink
        to={userId ? "/practice/quick/" : "/mypage/"}
        size="sm"
        variant="secondary"
      >
        {userId ? "빠른 연습으로 이동" : "로그인 안내"}
      </ButtonLink>
    </Card>
  );
}
