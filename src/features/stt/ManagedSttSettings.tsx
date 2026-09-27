import { useEffect, useState } from "react";
import type { SttQuota } from "../../../shared/stt/types";
import { useAuth } from "../../auth/useAuth";
import { Badge } from "../../components/ui/Badge";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getManagedSttQuota } from "./managedSttProvider";

function formatMinutes(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  if (secs === 0) return `${mins}분`;
  return `${mins}분 ${secs}초`;
}

export function ManagedSttSettings() {
  const { user, status } = useAuth();
  return <ManagedSttSession key={user?.id || status} userId={user?.id} />;
}

function ManagedSttSession({ userId }: { userId?: string }) {
  const [quota, setQuota] = useState<SttQuota | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const load = () => {
      getManagedSttQuota(controller.signal)
        .then((q) => {
          if (!controller.signal.aborted) {
            setQuota(q);
            setError("");
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            setError(err instanceof Error ? err.message : "사용량을 불러오지 못했습니다.");
          }
        });
    };

    load();
    window.addEventListener("focus", load);
    const interval = window.setInterval(load, 60000);
    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("focus", load);
    };
  }, [userId, revision]);

  const refresh = () => setRevision((v) => v + 1);

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">OOM 관리형 STT</h2>
          <p className="text-xs text-zinc-500">Gemini 3.5 Transcribe · verbatim 모드</p>
        </div>
        <Badge tone={quota?.enabled ? "emerald" : "default"}>
          {!userId ? "로그인 필요" : quota?.enabled ? "이용 가능" : quota ? "일시 중지" : "확인 중"}
        </Badge>
      </div>

      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        사용자 지정 STT 설정이 없을 때 기본으로 사용되는 음성 인식입니다. OPIc 답변의 추임새(um, uh)와 반복을 보존하는 verbatim 방식으로 전사합니다.
      </p>

      {quota ? (
        <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            오늘 음성 인식:{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {formatMinutes(quota.usedMs)} / {formatMinutes(quota.limitMs)} 사용
            </strong>{" "}
            · 잔여 {formatMinutes(quota.remainingMs)}
            {quota.reservedMs > 0 ? ` · 처리 중 ${formatMinutes(quota.reservedMs)}` : ""}
          </p>
          <p>
            한국 시간(KST) 자정에 초기화 · 다음{" "}
            {new Intl.DateTimeFormat("ko-KR", {
              timeZone: "Asia/Seoul",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hourCycle: "h23",
            }).format(new Date(quota.resetsAt))}
          </p>
          {!quota.enabled ? (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              현재 관리형 STT 점검 중입니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : quota.remainingMs <= 0 ? (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              오늘 제공된 무료 음성 인식 훈련 시간을 모두 소진했습니다.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {!userId
              ? "로그인하면 매일 10분의 무료 관리형 음성 인식이 제공됩니다."
              : error || "사용량을 확인하고 있어요..."}
          </p>
          {!userId ? (
            <ButtonLink size="sm" to="/mypage/" variant="secondary">
              로그인 안내
            </ButtonLink>
          ) : null}
          {error ? (
            <Button onClick={refresh} size="sm" variant="secondary">
              다시 확인
            </Button>
          ) : null}
        </div>
      )}

      <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          음성은 전사를 위해 OOM의 음성 인식 제공업체(Google Gemini)로 전송됩니다. OOM은 원본 오디오를 학습 기록으로 저장하지 않으며, 전사 텍스트는 재시도 및 AI 피드백을 위해 24시간 동안만 임시 보관됩니다.
        </p>
      </div>
    </Card>
  );
}
