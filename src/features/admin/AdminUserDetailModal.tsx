import {
  AlertCircle,
  BookOpen,
  Calendar,
  Mail,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { fetchAdminUserDetail } from "./adminApi";
import type { AdminUserDetail } from "./adminTypes";

interface AdminUserDetailModalProps {
  userId: string;
  onClose: () => void;
}

export function AdminUserDetailModal({ userId, onClose }: AdminUserDetailModalProps) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setError(null);

      fetchAdminUserDetail(userId)
        .then((res) => {
          if (active) setDetail(res);
        })
        .catch((err) => {
          if (active) {
            setError(
              err instanceof Error ? err.message : "사용자 상세 정보를 불러오지 못했습니다."
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [userId]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "-";
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div
      aria-labelledby="user-detail-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/60 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          aria-label="닫기"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div aria-busy="true" className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
            <p className="mt-3 text-sm text-zinc-500">사용자 상세 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button className="mt-4" onClick={onClose} size="sm" variant="secondary">
              닫기
            </Button>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* 1. Header Profile Identity */}
            <div className="flex items-start gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 overflow-hidden">
                {detail.avatarUrl ? (
                  <img alt={detail.displayName ?? "프로필"} className="h-full w-full object-cover" src={detail.avatarUrl} />
                ) : (
                  <User className="h-7 w-7" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white truncate" id="user-detail-title">
                    {detail.displayName || "이름 미설정"}
                  </h2>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {detail.planDisplay}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {detail.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {detail.email}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-zinc-400">
                    UUID: {detail.id}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Account & Preference Summary */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-zinc-200/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  계정 일시
                </div>
                <div className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
                  <div>가입일시: {formatDate(detail.joinedAt)}</div>
                  <div>최근 로그인: {formatDate(detail.lastSignInAt)}</div>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                  <Shield className="h-3.5 w-3.5 text-indigo-500" />
                  학습 설정 (learning_preferences)
                </div>
                <div className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
                  {detail.learningPreferences ? (
                    <>
                      <div>목표 레벨: {detail.learningPreferences.targetLevel ?? "미선택"}</div>
                      <div>코스: {detail.learningPreferences.courseId ?? "미선택"}</div>
                    </>
                  ) : (
                    <div className="text-zinc-400">보관된 학습 설정 없음</div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Operational Learning Summary */}
            <div className="rounded-lg border border-zinc-200/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                학습 활동 누적 요약
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
                <div className="rounded bg-zinc-50 p-2 dark:bg-zinc-800/40">
                  <div className="text-xs text-zinc-500">실전 세션</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white">
                    {detail.summary.totalSessions}
                  </div>
                  <div className="text-[10px] text-zinc-400">완료 {detail.summary.completedSessions}</div>
                </div>
                <div className="rounded bg-zinc-50 p-2 dark:bg-zinc-800/40">
                  <div className="text-xs text-zinc-500">문항 시도</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white">
                    {detail.summary.totalAttempts}
                  </div>
                  <div className="text-[10px] text-zinc-400">learning_attempts</div>
                </div>
                <div className="rounded bg-zinc-50 p-2 dark:bg-zinc-800/40">
                  <div className="text-xs text-zinc-500">학습 완료 기록</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white">
                    {detail.summary.totalActivities}
                  </div>
                  <div className="text-[10px] text-zinc-400">study_activities</div>
                </div>
                <div className="rounded bg-zinc-50 p-2 dark:bg-zinc-800/40">
                  <div className="text-xs text-zinc-500">최근 학습 일시</div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                    {formatDate(detail.summary.lastLearningAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Recent Sessions */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                최근 실전 세션 (최대 5건)
              </h3>
              {detail.recentSessions.length === 0 ? (
                <p className="text-xs text-zinc-400">기록된 세션이 없습니다.</p>
              ) : (
                <div className="divide-y divide-zinc-100 rounded-md border border-zinc-200/80 text-xs dark:divide-zinc-800 dark:border-zinc-800">
                  {detail.recentSessions.map((s) => (
                    <div className="flex items-center justify-between p-2.5" key={s.id}>
                      <div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {s.mode === "quick_practice" ? "빠른 연습" : "실전 모의고사"}
                        </span>
                        <span className="ml-2 text-zinc-400">
                          {s.answeredCount}/{s.questionCount} 문항
                        </span>
                        <span className="ml-2 rounded px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-[10px]">
                          {s.status}
                        </span>
                      </div>
                      <span className="text-zinc-500">{formatDate(s.startedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Recent Activities */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                최근 완료한 학습 활동 (최대 5건)
              </h3>
              {detail.recentActivities.length === 0 ? (
                <p className="text-xs text-zinc-400">기록된 학습 활동이 없습니다.</p>
              ) : (
                <div className="divide-y divide-zinc-100 rounded-md border border-zinc-200/80 text-xs dark:divide-zinc-800 dark:border-zinc-800">
                  {detail.recentActivities.map((a) => (
                    <div className="flex items-center justify-between p-2.5" key={a.id}>
                      <div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {a.activityType === "survey_completed"
                            ? "서베이 완료"
                            : a.activityType === "universal_script_completed"
                            ? "만능 스크립트"
                            : "롤플레이"}
                        </span>
                        <span className="ml-2 text-zinc-400">
                          {a.courseId} · {a.levelId} · {a.contentId}
                        </span>
                      </div>
                      <span className="text-zinc-500">{formatDate(a.occurredAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} size="sm" variant="secondary">
                닫기
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
