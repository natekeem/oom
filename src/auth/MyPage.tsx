import { useState } from "react";
import { UserRound } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button, ButtonLink } from "../components/ui/Button";
import { PageIntro } from "../components/ui/PageIntro";
import { TRAINING_LEVELS } from "../training/levels";
import { useLearningHistory } from "../features/history/useLearningHistory";
import type { LearningMode, LearningSession, LearningSessionStatus } from "../features/history/historyTypes";
import { useAuth } from "./useAuth";
import { safeReturnPath } from "./authHelpers";

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

const modeLabels: Record<LearningMode, string> = {
  quick_practice: "Quick Practice",
  mock_test: "실전 모의고사",
};

const statusLabels: Record<LearningSessionStatus, string> = {
  in_progress: "진행 중",
  completed: "완료",
  abandoned: "미완료",
};

function levelDisplayName(levelId: string | null): string | null {
  if (!levelId) return null;
  const level = TRAINING_LEVELS.find((l) => l.id === levelId);
  return level?.displayName ?? null;
}

function formatSessionDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// History list component
// ---------------------------------------------------------------------------

function SessionCard({ session }: { session: LearningSession }) {
  const levelLabel = levelDisplayName(session.targetLevel);
  const isCompleted = session.status === "completed";

  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {formatSessionDate(session.startedAt)}
          <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
          {modeLabels[session.mode]}
          {levelLabel ? (
            <>
              <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-zinc-500 dark:text-zinc-400">{levelLabel}</span>
            </>
          ) : null}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {session.questionCount > 0
            ? `${session.questionCount}문제 중 ${session.answeredCount}문제 완료`
            : `${session.answeredCount}문제 완료`}
        </p>
      </div>
      <span
        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
          isCompleted
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        }`}
      >
        {statusLabels[session.status]}
      </span>
    </li>
  );
}

function LearningHistorySection() {
  const { sessions, status, isEmpty, retry } = useLearningHistory();

  return (
    <section
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
      aria-label="학습 기록"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">학습 기록</h2>

      {status === "loading" ? (
        <div role="status" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
          <p className="text-xs text-zinc-400">학습 기록을 불러오는 중…</p>
        </div>
      ) : status === "error" ? (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            학습 기록을 불러오지 못했습니다.
            <br />
            잠시 후 다시 시도해 주세요.
          </p>
          <Button variant="secondary" onClick={() => void retry()}>
            다시 시도
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            아직 저장된 학습 기록이 없어요.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            로그인한 상태에서 Quick Practice 또는 모의 연습을 시작하면
            <br />
            학습 기록이 여기에 저장됩니다.
          </p>
          <ButtonLink to="/practice/" variant="secondary">
            연습 시작하기
          </ButtonLink>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">최근 학습</p>
          <ul className="space-y-2">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function MyPage() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const action = async (logout: boolean) => {
    setBusy(true); setError(null);
    try {
      if (logout) await auth.signOut();
      else await auth.signInWithGoogle(safeReturnPath(params.get("returnTo")));
    } catch {
      setError(logout ? "로그아웃하지 못했습니다. 다시 시도해 주세요." : "Google 로그인을 시작하지 못했습니다. 다시 시도해 주세요.");
    } finally { setBusy(false); }
  };
  return <div className="mx-auto w-full max-w-3xl space-y-8 py-4 sm:py-8">
    <PageIntro icon={UserRound} tag="MY PAGE" title="마이페이지" description="내 계정 정보를 확인하고 관리하세요." />
    <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8" aria-label="계정 정보">
      {auth.status === "loading" ? <div role="status" className="space-y-3 text-sm text-zinc-500"><p>로그인 상태를 확인하고 있어요.</p><p>연결이 느리면 잠시 기다리거나 페이지를 새로고침해 주세요.</p><ButtonLink to="/training/" variant="secondary">먼저 훈련 둘러보기</ButtonLink></div>
      : auth.status === "unconfigured" ? <p role="status">로그인 기능 설정이 필요합니다. 공개 콘텐츠와 훈련은 계속 이용할 수 있어요.</p>
      : auth.status === "authenticated" && auth.user ? <>
        <div className="flex items-center gap-4">
          {auth.profile?.avatarUrl ? <img src={auth.profile.avatarUrl} alt="프로필" referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover" /> : <UserRound aria-hidden className="h-12 w-12 shrink-0 text-indigo-500" />}
          <div className="min-w-0"><h2 className="break-words text-xl font-semibold">{auth.profile?.displayName || "OOM 학습자"}</h2><p className="break-all text-sm text-zinc-500 dark:text-zinc-400">{auth.user.email}</p></div>
        </div>
        {auth.profile ? <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{auth.profile.plan.toUpperCase()}</span> : !auth.profileError ? <p role="status">프로필을 불러오고 있어요.</p> : null}
        {auth.profileError ? <div role="alert"><p>{auth.profileError}</p><Button variant="secondary" onClick={() => void auth.refreshProfile()}>프로필 다시 불러오기</Button></div> : null}
        <p className="text-sm text-zinc-500">가입일: {new Date(auth.user.created_at).toLocaleDateString("ko-KR")}</p>
        <Button variant="secondary" disabled={busy} onClick={() => void action(true)}>{busy ? "처리 중…" : "로그아웃"}</Button>
      </> : <>
        <h2 className="text-xl font-semibold">내 학습을 위한 계정</h2>
        <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">로그인하면 학습 기록과 향후 AI 피드백 이력을 한곳에서 관리할 수 있어요.</p>
        <Button disabled={busy} onClick={() => void action(false)}>{busy ? "연결 중…" : "Google로 계속하기"}</Button>
        <p className="text-xs text-zinc-500">로그인 없이도 기존 훈련을 이용할 수 있어요.</p>
      </>}
      {error || auth.error ? <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error || auth.error}</p> : null}
    </section>
    {auth.status === "authenticated" && auth.user ? <LearningHistorySection /> : null}
  </div>;
}
