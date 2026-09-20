import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { fetchAdminUsers } from "./adminApi";
import { AdminLayout } from "./AdminLayout";
import type { AdminUserSummary } from "./adminTypes";
import { AdminUserDetailModal } from "./AdminUserDetailModal";

export function AdminUsersView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get("user");

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (targetPage: number, query: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminUsers(targetPage, pageSize, query);
        setUsers(res.users);
        setTotal(res.total);
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "사용자 목록을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      void loadUsers(page, search);
    });
    return () => {
      active = false;
    };
  }, [loadUsers, page, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleSelectUser = (id: string) => {
    setSearchParams({ user: id });
  };

  const handleCloseModal = () => {
    setSearchParams({});
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "-";
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
        {/* Header & Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              사용자 현황 · 조회
            </h2>
            <p className="text-xs text-zinc-500">
              전체 {total.toLocaleString()}명의 가입 회원 (서버 페이지네이션)
            </p>
          </div>

          <form className="flex items-center gap-2" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                className="h-9 w-60 rounded-md border border-zinc-200 bg-white pl-8 pr-7 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="이름 또는 이메일 검색"
                type="text"
                value={searchInput}
              />
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              {searchInput && (
                <button
                  className="absolute right-2 top-2.5 text-zinc-400 hover:text-zinc-600"
                  onClick={handleClearSearch}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button size="sm" type="submit" variant="primary">
              검색
            </Button>
            <button
              aria-label="목록 새로고침"
              className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => void loadUsers(page, search)}
              title="목록 새로고침"
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* User Content */}
        {loading ? (
          <div aria-busy="true" className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
            <p className="mt-3 text-sm text-zinc-500">사용자 목록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              className="mt-4"
              onClick={() => void loadUsers(page, search)}
              size="sm"
              variant="secondary"
            >
              다시 시도
            </Button>
          </Card>
        ) : users.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {search ? `"${search}" 검색 조건에 일치하는 사용자가 없습니다.` : "등록된 회원이 없습니다."}
            </p>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200/80 bg-zinc-50/70 font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300">
                  <tr>
                    <th className="px-4 py-3">사용자</th>
                    <th className="px-3 py-3">가입일시 (KST)</th>
                    <th className="px-3 py-3">최근 로그인</th>
                    <th className="px-3 py-3">현재 표시 플랜</th>
                    <th className="px-3 py-3 text-center">학습 세션</th>
                    <th className="px-3 py-3 text-center">학습 활동</th>
                    <th className="px-3 py-3">최근 학습</th>
                    <th className="px-4 py-3 text-right">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {users.map((u) => (
                    <tr
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      key={u.id}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 overflow-hidden">
                            {u.avatarUrl ? (
                              <img alt="" className="h-full w-full object-cover" src={u.avatarUrl} />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {u.displayName || "이름 미설정"}
                            </p>
                            <p className="text-zinc-400 font-mono text-[10px] truncate">
                              {u.email || u.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDate(u.joinedAt)}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDate(u.lastSignInAt)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {u.planDisplay}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-zinc-900 dark:text-zinc-100">
                        {u.learningSessionCount}
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-zinc-900 dark:text-zinc-100">
                        {u.learningActivityCount}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDate(u.lastLearningAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => handleSelectUser(u.id)}
                          size="sm"
                          variant="secondary"
                        >
                          상세보기
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {users.map((u) => (
                <Card className="p-4" key={u.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 overflow-hidden">
                        {u.avatarUrl ? (
                          <img alt="" className="h-full w-full object-cover" src={u.avatarUrl} />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-sm">
                          {u.displayName || "이름 미설정"}
                        </p>
                        <p className="text-zinc-400 font-mono text-[10px] truncate">
                          {u.email || u.id}
                        </p>
                      </div>
                    </div>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {u.planDisplay}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    <div>가입일: {formatDate(u.joinedAt)}</div>
                    <div>최근 로그인: {formatDate(u.lastSignInAt)}</div>
                    <div>학습 세션: {u.learningSessionCount}건</div>
                    <div>학습 활동: {u.learningActivityCount}건</div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => handleSelectUser(u.id)}
                      size="sm"
                      variant="secondary"
                    >
                      상세보기
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Bar */}
            <div className="flex items-center justify-between border-t border-zinc-200/80 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
              <div>
                페이지 <strong>{page}</strong> / {totalPages} (총 {total.toLocaleString()}명)
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

        {/* User Detail Modal */}
        {selectedUserId && (
          <AdminUserDetailModal
            onClose={handleCloseModal}
            userId={selectedUserId}
          />
        )}
      </div>
    </AdminLayout>
  );
}
