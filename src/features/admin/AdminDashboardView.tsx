import {
  Activity,
  AlertCircle,
  Clock,
  Layers,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { fetchAdminOverview } from "./adminApi";
import { AdminLayout } from "./AdminLayout";
import type { AdminOverview } from "./adminTypes";

export function AdminDashboardView() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await fetchAdminOverview();
      setData(overview);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "대시보드 지표를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      void loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);


  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return iso;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Info Notice */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-100/80 px-3.5 py-2 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>
              기준 시간대: <strong>Asia/Seoul (KST, UTC+9)</strong> · 오늘 지표는 오늘 00:00 KST 기준
            </span>
          </div>
          <button
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            onClick={() => void loadData()}
            type="button"
          >
            <RefreshCw className="h-3 w-3" />
            새로고침
          </button>
        </div>

        {loading ? (
          <div
            aria-busy="true"
            className="flex min-h-[300px] flex-col items-center justify-center text-center"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
            <p className="mt-3 text-sm text-zinc-500">지표 집계 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-950 dark:text-white">
              데이터 로드 실패
            </h3>
            <p className="mt-1 text-xs text-zinc-500">{error}</p>
            <Button className="mt-4" onClick={() => void loadData()} size="sm" variant="secondary">
              다시 시도
            </Button>
          </Card>
        ) : data ? (
          <>
            {/* 1. Primary Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: 총 회원 */}
              <Card className="flex flex-col justify-between p-4 min-h-[116px]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-xs font-medium">총 가입 회원</span>
                  <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  <span>{data.metrics.totalUsers.toLocaleString()}</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">명</span>
                </div>
                <div className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  학습 설정 보관: <strong className="font-semibold text-zinc-700 dark:text-zinc-300">{data.metrics.usersWithPreferences}</strong>명
                </div>
              </Card>

              {/* Card 2: 신규 가입 */}
              <Card className="flex flex-col justify-between p-4 min-h-[116px]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-xs font-medium">신규 가입 (오늘 / 7일)</span>
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  <span>{data.metrics.newUsersToday.toLocaleString()}</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">명</span>
                  <span className="mx-1 text-xs text-zinc-300 dark:text-zinc-700">/</span>
                  <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                    {data.metrics.newUsers7d.toLocaleString()}
                  </span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">명</span>
                </div>
                <div className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  오늘(KST 00시 이후) / 최근 7일
                </div>
              </Card>

              {/* Card 3: 활성 학습자 */}
              <Card className="flex flex-col justify-between p-4 min-h-[116px]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-xs font-medium">활성 학습자 (24h / 7d)</span>
                  <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  <span>{data.metrics.activeLearners24h.toLocaleString()}</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">명</span>
                  <span className="mx-1 text-xs text-zinc-300 dark:text-zinc-700">/</span>
                  <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                    {data.metrics.activeLearners7d.toLocaleString()}
                  </span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">명</span>
                </div>
                <div className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  세션 또는 학습 활동 고유 사용자
                </div>
              </Card>

              {/* Card 4: 학습 세션 및 활동 */}
              <Card className="flex flex-col justify-between p-4 min-h-[116px]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-xs font-medium">학습 세션 / 활동 (7일)</span>
                  <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  <span>{data.metrics.learningSessions7d.toLocaleString()}</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">세션</span>
                  <span className="mx-1 text-xs text-zinc-300 dark:text-zinc-700">/</span>
                  <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                    {data.metrics.learningActivities7d.toLocaleString()}
                  </span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">회</span>
                </div>
                <div className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  오늘: {data.metrics.learningSessionsToday}세션 · {data.metrics.learningActivitiesToday}활동
                </div>
              </Card>
            </div>

            {/* 2. Secondary Sections: Recent Lists */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Signups */}
              <Card className="p-5">
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    최근 가입자
                  </h3>
                  <span className="text-xs text-zinc-500">최근 5명</span>
                </div>

                <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {data.recentUsers.length === 0 ? (
                    <p className="py-4 text-center text-xs text-zinc-500">가입자가 없습니다.</p>
                  ) : (
                    data.recentUsers.map((u) => (
                      <div className="flex items-center justify-between py-2.5 text-xs" key={u.id}>
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                            {u.displayName || "이름 미설정"}
                          </p>
                          <p className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">
                            {u.id}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-right">
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {u.planDisplay}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {formatDate(u.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Recent Learning Activity */}
              <Card className="p-5">
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
                    <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    최근 학습 활동
                  </h3>
                  <span className="text-xs text-zinc-500">최근 5건</span>
                </div>

                <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {data.recentLearningActivity.length === 0 ? (
                    <p className="py-4 text-center text-xs text-zinc-500">최근 활동이 없습니다.</p>
                  ) : (
                    data.recentLearningActivity.map((act) => (
                      <div className="flex items-center justify-between py-2.5 text-xs" key={act.id}>
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                act.type === "session"
                                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              {act.modeOrCategory}
                            </span>
                            <span className="truncate text-zinc-700 dark:text-zinc-300">
                              {act.detail}
                            </span>
                          </div>
                          <p className="text-zinc-400 font-mono text-[10px]">
                            {act.userId.slice(0, 8)}...
                          </p>
                        </div>
                        <span className="shrink-0 text-zinc-500 dark:text-zinc-400">
                          {formatDate(act.timestamp)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* 3. Quiet Roadmap Note */}
            <div className="rounded-md border border-dashed border-zinc-300 p-3.5 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">향후 확장 예정:</span>{" "}
              구독 및 결제 운영, 커뮤니티 관리 기능은 향후 단계에서 추가될 예정입니다. AI 사용량과 설정은 AI 운영 메뉴에서 확인할 수 있습니다.
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
