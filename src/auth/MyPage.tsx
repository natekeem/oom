import { useState } from "react";
import { UserRound } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button, ButtonLink } from "../components/ui/Button";
import { PageIntro } from "../components/ui/PageIntro";
import { useAuth } from "./useAuth";
import { safeReturnPath } from "./authHelpers";

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
        <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">로그인하면 학습 기록과 향후 AI 피드백 이력을 한곳에서 관리할 수 있어요. 기록 저장 기능은 다음 단계에서 연결됩니다.</p>
        <Button disabled={busy} onClick={() => void action(false)}>{busy ? "연결 중…" : "Google로 계속하기"}</Button>
        <p className="text-xs text-zinc-500">로그인 없이도 기존 훈련을 이용할 수 있어요.</p>
      </>}
      {error || auth.error ? <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error || auth.error}</p> : null}
    </section>
    <section className="rounded-xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700"><h2 className="font-semibold">학습 기록</h2><p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">로그인 기반 학습 기록 저장 기능은 다음 단계에서 연결됩니다.</p></section>
  </div>;
}
