import { LearningShortcuts } from "./LearningShortcuts";
import { StudyActivitySection } from "../features/activity/StudyActivitySection";
import { viewPathForId } from "../lib/routes";
import { useState } from "react";
import { ArrowRight, History, SlidersHorizontal, UserRound } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageIntro } from "../components/ui/PageIntro";
import { TRAINING_LEVELS, formatTrainingPreset } from "../training/levels";
import { discoveredCourses } from "../training/courseCatalog";
import { useTrainingSelection } from "../training/TrainingSelectionContext";
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
    <li className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-zinc-700">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {formatSessionDate(session.startedAt)}
          <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
          <span>{modeLabels[session.mode]}</span>
          {levelLabel ? (
            <>
              <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{levelLabel}</span>
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
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          isCompleted
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
            : session.status === "in_progress"
            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
    <section aria-label="학습 기록" className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">최근 연습 기록</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            로그인 상태에서 진행한 Quick Practice 및 실전 모의고사 세션입니다.
          </p>
        </div>
        {sessions.length > 0 ? (
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            총 {sessions.length}개 세션
          </span>
        ) : null}
      </div>

      <Card className="p-5 sm:p-6">
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
          <div role="alert" className="space-y-3 py-4 text-center sm:text-left">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              학습 기록을 불러오지 못했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
            <Button variant="secondary" size="sm" onClick={() => void retry()}>
              다시 시도
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <History className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                아직 저장된 학습 기록이 없어요.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                목표를 설정하고 실전 연습 또는 모의고사를 진행하면 최근 기록이 여기에 표시됩니다.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              <ButtonLink to={viewPathForId["training-setup"]} variant="primary" size="sm">
                학습 시작하기
              </ButtonLink>
              <ButtonLink to={viewPathForId.practice} variant="secondary" size="sm">
                실전 연습 바로가기
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">최근 학습 세션</p>
            <ul className="space-y-2.5">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </ul>
          </div>
        )}
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function MyPage() {
  const auth = useAuth();
  const { selection, isAccountSynced, isLoadingPreferences } = useTrainingSelection();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSavedLevel = selection
    ? TRAINING_LEVELS.find((l) => l.id === selection.levelId)
    : null;
  const activeSavedCourse = selection
    ? discoveredCourses.find((c) => c.id === selection.courseId)
    : null;

  const action = async (logout: boolean) => {
    setBusy(true);
    setError(null);
    try {
      if (logout) await auth.signOut();
      else await auth.signInWithGoogle(safeReturnPath(params.get("returnTo")));
    } catch {
      setError(
        logout
          ? "로그아웃하지 못했습니다. 다시 시도해 주세요."
          : "Google 로그인을 시작하지 못했습니다. 다시 시도해 주세요."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <PageIntro
        description="목표를 확인하고 오늘 공부할 단계를 선택하세요. 완료한 학습과 실전 연습 기록도 한곳에서 확인할 수 있습니다."
        icon={UserRound}
        tag="MY PAGE"
        title="내 계정과 훈련 현황"
      />

      {auth.status === "loading" ? (
        <Card className="p-6 sm:p-8" role="status">
          <div className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
            <p>로그인 상태를 확인하고 있어요.</p>
            <p>연결이 느리면 잠시 기다리거나 페이지를 새로고침해 주세요.</p>
            <div className="pt-2">
              <ButtonLink to={viewPathForId["training-hub"]} variant="secondary">
                먼저 훈련 둘러보기
              </ButtonLink>
            </div>
          </div>
        </Card>
      ) : auth.status === "unconfigured" ? (
        <Card className="p-6 sm:p-8">
          <p role="status" className="text-sm text-zinc-600 dark:text-zinc-300">
            로그인 기능 설정이 필요합니다. 공개 콘텐츠와 훈련은 계속 이용할 수 있어요.
          </p>
        </Card>
      ) : auth.status === "authenticated" && auth.user ? (
        <>
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Account summary card */}
            <Card className="flex flex-col justify-between p-6 lg:col-span-5" aria-label="계정 정보">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    계정 정보
                  </span>
                  {auth.profile ? (
                    <Badge tone="indigo">{auth.profile.plan.toUpperCase()}</Badge>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  {auth.profile?.avatarUrl ? (
                    <img
                      alt="프로필"
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-indigo-500/20"
                      referrerPolicy="no-referrer"
                      src={auth.profile.avatarUrl}
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20 dark:bg-indigo-950/70 dark:text-indigo-400">
                      <UserRound aria-hidden="true" className="h-7 w-7" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold text-zinc-950 dark:text-white">
                      {auth.profile?.displayName || "OOM 학습자"}
                    </h2>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400" title={auth.user.email}>
                      {auth.user.email}
                    </p>
                  </div>
                </div>

                {auth.profileError ? (
                  <div role="alert" className="space-y-2 rounded-md bg-rose-50 p-3 dark:bg-rose-950/30">
                    <p className="text-xs text-rose-600 dark:text-rose-400">{auth.profileError}</p>
                    <Button variant="secondary" size="sm" onClick={() => void auth.refreshProfile()}>
                      프로필 다시 불러오기
                    </Button>
                  </div>
                ) : !auth.profile ? (
                  <p role="status" className="text-xs text-zinc-400">
                    프로필을 불러오고 있어요.
                  </p>
                ) : null}

                <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>가입일</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {new Date(auth.user.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Button
                  disabled={busy}
                  onClick={() => void action(true)}
                  size="sm"
                  variant="secondary"
                >
                  {busy ? "처리 중…" : "로그아웃"}
                </Button>
              </div>
            </Card>

            {/* Goal / Training setup card */}
            <Card className="flex flex-col justify-between p-6 lg:col-span-7" aria-label="내 학습 설정">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      내 학습 설정
                    </span>
                  </div>
                  {isLoadingPreferences ? (
                    <Badge tone="default">확인 중</Badge>
                  ) : isAccountSynced && selection && activeSavedLevel ? (
                    <Badge tone="emerald">설정 완료</Badge>
                  ) : (
                    <Badge tone="amber">설정 필요</Badge>
                  )}
                </div>

                {isLoadingPreferences ? (
                  <p role="status" className="text-xs text-zinc-400">
                    학습 설정을 불러오고 있어요.
                  </p>
                ) : isAccountSynced && selection && activeSavedLevel && activeSavedCourse ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                        {activeSavedLevel.displayName} · {activeSavedLevel.targetLabel}
                      </h3>
                      <span className="text-xs text-zinc-300 dark:text-zinc-700">|</span>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {activeSavedCourse.title}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {formatTrainingPreset(activeSavedLevel)} · 권장 난이도 <strong>{activeSavedLevel.difficulty.label}</strong>
                    </p>
                    <p className="pt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      계정에 동기화된 목표 구간과 코스에 맞춰 6단계 로드맵과 실전 연습 문항이 준비되어 있습니다.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                      목표 구간과 학습 코스를 설정하세요
                    </h3>
                    <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      아직 계정에 저장된 학습 설정이 없어요. 목표를 설정하면 여러 기기에서 같은 설정을 사용할 수 있어요.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                {isAccountSynced && selection ? (
                  <>
                    <ButtonLink
                      size="md"
                      to={viewPathForId["training-setup"]}
                      variant="primary"
                    >
                      목표 설정 수정
                      <ArrowRight className="h-4 w-4" />
                    </ButtonLink>
                    <ButtonLink
                      size="md"
                      to={viewPathForId.practice}
                      variant="secondary"
                    >
                      실전 연습 바로가기
                    </ButtonLink>
                  </>
                ) : (
                  <ButtonLink
                    size="md"
                    to={viewPathForId["training-setup"]}
                    variant="primary"
                  >
                    목표 설정하기
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                )}
              </div>
            </Card>
          </div>

          <LearningShortcuts />
          <StudyActivitySection key={`activities-${auth.user.id}`} />
          <LearningHistorySection key={`sessions-${auth.user.id}`} />
        </>
      ) : (
        <Card className="space-y-5 p-6 sm:p-8" aria-label="계정 정보">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white">내 학습을 위한 계정</h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              로그인하면 학습 기록과 목표 설정을 안전하게 보관하고 관리할 수 있어요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={busy} onClick={() => void action(false)}>
              {busy ? "연결 중…" : "Google로 계속하기"}
            </Button>
            <ButtonLink to={viewPathForId["training-setup"]} variant="secondary">
              로그인 없이 학습 시작
            </ButtonLink>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            로그인 없이도 기존 훈련과 공개 콘텐츠는 계속 이용할 수 있어요.
          </p>
        </Card>
      )}

      {error || auth.error ? (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error || auth.error}
        </p>
      ) : null}
    </div>
  );
}
