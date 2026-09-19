import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Provider, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { mapProfile, safeReturnPath } from "./authHelpers";
import type { AuthContextValue, Profile } from "./authTypes";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>(supabase ? "loading" : "unconfigured");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileVersion = useRef(0);
  const userId = session?.user.id;

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let eventVersion = 0;
    const apply = (next: Session | null) => {
      if (!active) return;
      setSession(next);
      setStatus(next ? "authenticated" : "anonymous");
      setError(null);
    };
    // Keep the auth callback synchronous: DB work runs in a separate effect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      eventVersion++;
      apply(next);
    });
    const version = eventVersion;
    void supabase.auth.getSession().then(({ data, error: failure }) => {
      if (!active || version !== eventVersion) return;
      apply(data.session);
      if (failure) setError("로그인 상태를 확인하지 못했습니다. 다시 로그인해 주세요.");
    }).catch(() => {
      if (active && version === eventVersion) {
        apply(null);
        setError("로그인 상태를 확인하지 못했습니다. 다시 로그인해 주세요.");
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const refreshProfile = useCallback(async () => {
    const version = ++profileVersion.current;
    setProfileError(null);
    if (!supabase || !userId) { setProfile(null); return; }
    try {
      const { data, error: failure } = await supabase.from("profiles").select("id,display_name,avatar_url,plan,created_at,updated_at").eq("id", userId).single();
      if (version !== profileVersion.current) return;
      if (failure || !data) throw new Error("profile");
      setProfile(mapProfile(data));
    } catch {
      if (version === profileVersion.current) setProfileError("프로필을 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    const version = profileVersion;
    // Schedule outside the auth event/React commit; StrictMode cleanup cancels it.
    void Promise.resolve().then(() => {
      if (!active) return;
      setProfile(null);
      void refreshProfile();
    });
    return () => { active = false; version.current++; };
  }, [refreshProfile]);

  const signInWithProvider = async (provider: Provider, returnTo?: string) => {
    if (!supabase) throw new Error("unconfigured");
    const redirect = new URL("/auth/callback/", window.location.origin);
    redirect.searchParams.set("returnTo", safeReturnPath(returnTo));
    const { error: failure } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirect.href } });
    if (failure) throw new Error("oauth");
  };
  const signOut = async () => {
    if (!supabase) return;
    const { error: failure } = await supabase.auth.signOut({ scope: "local" });
    if (failure) throw new Error("signout");
    profileVersion.current++;
    setProfile(null);
    setSession(null);
    setStatus("anonymous");
  };
  return <AuthContext.Provider value={{ user: session?.user ?? null, session,
    profile: profile?.id === userId ? profile : null, status, error, profileError,
    signInWithGoogle: (returnTo) => signInWithProvider("google", returnTo), signOut, refreshProfile }}>
    {children}
  </AuthContext.Provider>;
}
