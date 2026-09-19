import { useAuth } from "./useAuth";

export function AuthNavigationLabel() {
  const { status } = useAuth();
  return <>{status === "loading" ? "계정 확인 중…" : status === "authenticated" ? "마이페이지" : "로그인"}</>;
}
