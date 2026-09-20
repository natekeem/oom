import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { fetchAdminAudit } from "./adminApi";
import { AdminLayout } from "./AdminLayout";
import type { AdminAuditLog } from "./adminTypes";
import { useAdminAccess } from "./useAdminAccess";

export function AdminAuditView() {
  const { role } = useAdminAccess();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(
    async (targetPage: number) => {
      if (role === "support") {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminAudit(targetPage, pageSize);
        setLogs(res.logs);
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "감사 로그를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [role, pageSize]
  );

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      void loadLogs(page);
    });
    return () => {
      active = false;
    };
  }, [loadLogs, page]);


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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              관리자 감사 로그
            </h2>
            <p className="text-xs text-zinc-500">
              권한 변경, 설정 수정 등 주요 관리 작업 기록
            </p>
          </div>
          {role !== "support" && (
            <button
              aria-label="로그 새로고침"
              className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => void loadLogs(page)}
              title="로그 새로고침"
              type="button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {role === "support" ? (
          <Card className="p-8 text-center">
            <Shield className="mx-auto h-8 w-8 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-950 dark:text-white">
              감사 로그 접근 제한
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              운영 지원(support) 권한은 보안 정책상 감사 로그를 열람할 수 없습니다. 소유자 또는 관리자 계정으로 접속해 주세요.
            </p>
          </Card>
        ) : loading ? (
          <div aria-busy="true" className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
            <p className="mt-3 text-sm text-zinc-500">감사 로그를 불러오는 중...</p>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              className="mt-4"
              onClick={() => void loadLogs(page)}
              size="sm"
              variant="secondary"
            >
              다시 시도
            </Button>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-500" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-950 dark:text-white">
              아직 기록된 관리자 변경 작업이 없습니다.
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              향후 권한·구독·운영 설정 변경이 이곳에 안전하게 기록됩니다.
            </p>
          </Card>
        ) : (
          <>
            {/* Table View */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200/80 bg-zinc-50/70 font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">
                  <tr>
                    <th className="px-4 py-3">일시 (KST)</th>
                    <th className="px-3 py-3">작업 관리자</th>
                    <th className="px-3 py-3">작업 내용 (Action)</th>
                    <th className="px-3 py-3">대상</th>
                    <th className="px-4 py-3">메타데이터</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {logs.map((log) => (
                    <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors" key={log.id}>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {log.adminDisplayName || log.adminUserId.slice(0, 8)}
                      </td>
                      <td className="px-3 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {log.action}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {log.targetType ? `${log.targetType} (${log.targetId ?? "-"})` : "-"}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
