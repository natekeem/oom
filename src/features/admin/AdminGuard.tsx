import { AlertTriangle, Lock, LogIn, RefreshCw, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAdminAccess } from "./useAdminAccess";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { status, error, refresh } = useAdminAccess();
  const navigate = useNavigate();

  if (status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400" />
        <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          관리자 권한을 확인하고 있습니다...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
            로그인이 필요합니다
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            관리자 콘솔에 접근하려면 먼저 관리자 계정으로 로그인해야 합니다.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={() => navigate("/mypage/")}
              size="sm"
              variant="primary"
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              로그인하러 가기
            </Button>
            <Button
              onClick={() => navigate("/")}
              size="sm"
              variant="secondary"
            >
              홈으로 이동
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
            관리자 권한이 없습니다 (403)
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            현재 로그인된 계정은 관리자 콘솔 접근 권한이 없습니다. 관리자 권한 부여는 서버 관리자에게 문의하세요.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={() => navigate("/")}
              size="sm"
              variant="primary"
            >
              서비스 홈으로 이동
            </Button>
            <Button
              onClick={() => navigate("/mypage/")}
              size="sm"
              variant="secondary"
            >
              마이페이지
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
            관리자 인증 확인 실패
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {error || "관리자 API 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={() => void refresh()}
              size="sm"
              variant="primary"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              다시 시도
            </Button>
            <Button
              onClick={() => navigate("/")}
              size="sm"
              variant="secondary"
            >
              홈으로 이동
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
