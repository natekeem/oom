import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ButtonLink } from "../components/ui/Button";
import { safeReturnPath } from "./authHelpers";
import { useAuth } from "./useAuth";

export function AuthCallback() {
  const { status, error } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [timedOut, setTimedOut] = useState(false);
  const [providerError] = useState(() => params.has("error") || new URLSearchParams(window.location.hash.slice(1)).has("error"));
  const returnTo = safeReturnPath(params.get("returnTo"));
  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 15000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (status === "authenticated" && !providerError) navigate(returnTo, { replace: true });
  }, [status, providerError, returnTo, navigate]);
  const failed = providerError || error || timedOut || status === "anonymous" || status === "unconfigured";
  return <section className="mx-auto max-w-xl space-y-5 py-12">
    <h1 className="text-2xl font-bold">로그인 연결</h1>
    <p role={failed ? "alert" : "status"}>{failed ? "로그인을 완료하지 못했습니다. 마이페이지에서 다시 시도해 주세요." : "로그인을 확인하고 있어요. 잠시만 기다려 주세요."}</p>
    {failed ? <ButtonLink to={`/mypage/?returnTo=${encodeURIComponent(returnTo)}`} variant="secondary">마이페이지에서 다시 시도</ButtonLink> : null}
  </section>;
}
