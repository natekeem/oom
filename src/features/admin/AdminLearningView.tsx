import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { fetchAdminLearning } from "./adminApi";
import { AdminLayout } from "./AdminLayout";
import type { AdminLearningRecord } from "./adminTypes";

export function AdminLearningView() {
  const [records, setRecords] = useState<AdminLearningRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [range, setRange] = useState("7d");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLearningData = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminLearning({
          page: targetPage,
          pageSize,
          type: type !== "all" ? type : undefined,
          status: status ? status : undefined,
          range,
        });
        setRecords(res.records);
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "학습 운영 데이터를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize, type, status, range]
  );

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      void loadLearningData(page);
    });
    return () => {
      active = false;
    };
  }, [loadLearningData, page]);


  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
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
    <AdminLayout>
      <div className="space-y-4">
        {/* Title and Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              학습 운영 현황
            </h2>
            <p className="text-xs text-zinc-500">
              실전 훈련 세션 및 학습 완료 이벤트 모니터링 (총 {total.toLocaleString()}건)
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <Filter className="h-3.5 w-3.5 text-zinc-400 ml-1" />
              <select
                className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
                onChange={(e) => {
                  setRange(e.target.value);
                  setPage(1);
                }}
                value={range}
              >
                <option value="today">오늘</option>
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
                <option value="all">전체 기간</option>
              </select>
            </div>

            <select
              className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 focus:outline-none"
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              value={type}
            >
              <option value="all">모든 유형</option>
              <option value="sessions">실전 세션</option>
              <option value="activities">학습 완료 활동</option>
            </select>

            {type !== "activities" && (
              <select
                className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 focus:outline-none"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                value={status}
              >
                <option value="">모든 세션 상태</option>
                <option value="completed">완료</option>
                <option value="in_progress">진행 중</option>
                <option value="abandoned">중단</option>
              </select>
            )}

            <button
              aria-label="데이터 새로고침"
              className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => void loadLearningData(page)}
              title="데이터 새로고침"
              type="button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Data List or Loading / Empty */}
        {loading ? (
          <div aria-busy="true" className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
            <p className="mt-3 text-sm text-zinc-500">학습 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              className="mt-4"
              onClick={() => void loadLearningData(page)}
              size="sm"
              variant="secondary"
            >
              다시 시도
            </Button>
          </Card>
        ) : records.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              선택한 조건의 학습 활동 내역이 없습니다.
            </p>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200/80 bg-zinc-50/70 font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">
                  <tr>
                    <th className="px-4 py-3">구분</th>
                    <th className="px-3 py-3">사용자</th>
                    <th className="px-3 py-3">항목 / 내용</th>
                    <th className="px-3 py-3">학습 대상</th>
                    <th className="px-3 py-3 text-center">진행 / 상태</th>
                    <th className="px-4 py-3 text-right">일시 (KST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {records.map((r) => (
                    <tr
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      key={`${r.type}-${r.id}`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                            r.type === "session"
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {r.type === "session" ? "실전 세션" : "학습 활동"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {r.userDisplayName || r.userId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                        {r.modeOrType}
                        {r.contentId && (
                          <span className="ml-1.5 text-zinc-400 font-normal">
                            ({r.contentId})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {r.courseId ? `${r.courseId} · ` : ""}
                        {r.targetLevel ?? "-"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {r.type === "session" ? (
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {r.answeredCount !== undefined && r.questionCount !== undefined
                              ? `${r.answeredCount}/${r.questionCount} 문항 (${r.status})`
                              : r.status}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">완료</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-500">
                        {formatDate(r.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {records.map((r) => (
                <Card className="p-3.5 text-xs" key={`${r.type}-${r.id}`}>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        r.type === "session"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {r.type === "session" ? "실전 세션" : "학습 활동"}
                    </span>
                    <span className="text-zinc-400 text-[11px]">
                      {formatDate(r.timestamp)}
                    </span>
                  </div>
                  <div className="mt-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {r.modeOrType}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-zinc-500">
                    <span>
                      사용자: {r.userDisplayName || r.userId.slice(0, 8)}
                    </span>
                    {r.status && <span>상태: {r.status}</span>}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-zinc-200/80 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
              <div>
                페이지 <strong>{page}</strong> / {totalPages} (총 {total.toLocaleString()}건)
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  size="sm"
                  variant="secondary"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  이전
                </Button>
                <Button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  size="sm"
                  variant="secondary"
                >
                  다음
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
