import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../../auth/useAuth";
import { AdminApiError, fetchAdminMe } from "./adminApi";
import type { AdminRole, AdminSelf } from "./adminTypes";

export type AdminAccessStatus =
  | "loading"
  | "authorized"
  | "forbidden"
  | "unauthenticated"
  | "error";

export interface AdminAccessContextValue {
  status: AdminAccessStatus;
  role: AdminRole | null;
  adminUser: AdminSelf | null;
  error: string | null;
  refresh: () => Promise<void>;
}

const AdminAccessContext = createContext<AdminAccessContextValue | null>(null);

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const { user, status: authStatus } = useAuth();
  const [status, setStatus] = useState<AdminAccessStatus>(
    authStatus === "authenticated" ? "loading" : "unauthenticated"
  );
  const [role, setRole] = useState<AdminRole | null>(null);
  const [adminUser, setAdminUser] = useState<AdminSelf | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const checkAdminAccess = useCallback(async () => {
    const currentVersion = ++requestVersion.current;
    setError(null);

    if (authStatus === "loading") {
      setStatus("loading");
      return;
    }

    if (authStatus !== "authenticated" || !user) {
      setStatus("unauthenticated");
      setRole(null);
      setAdminUser(null);
      return;
    }

    setStatus("loading");

    try {
      const data = await fetchAdminMe();
      if (currentVersion !== requestVersion.current) return;

      setRole(data.role);
      setAdminUser(data);
      setStatus("authorized");
    } catch (err) {
      if (currentVersion !== requestVersion.current) return;

      if (err instanceof AdminApiError) {
        if (err.status === 403) {
          setStatus("forbidden");
          setRole(null);
          setAdminUser(null);
          return;
        }
        if (err.status === 401) {
          setStatus("unauthenticated");
          setRole(null);
          setAdminUser(null);
          return;
        }
      }

      setStatus("error");
      setRole(null);
      setAdminUser(null);
      setError(
        err instanceof Error ? err.message : "관리자 권한을 확인하지 못했습니다."
      );
    }
  }, [authStatus, user]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setRole(null);
      setAdminUser(null);
      setError(null);
      void checkAdminAccess();
    });
    return () => {
      active = false;
    };
  }, [checkAdminAccess]);


  return (
    <AdminAccessContext.Provider
      value={{
        status,
        role,
        adminUser,
        error,
        refresh: checkAdminAccess,
      }}
    >
      {children}
    </AdminAccessContext.Provider>
  );
}

const defaultAdminAccess: AdminAccessContextValue = {
  status: "unauthenticated",
  role: null,
  adminUser: null,
  error: null,
  refresh: async () => {},
};

export function useAdminAccess(): AdminAccessContextValue {
  const ctx = useContext(AdminAccessContext);
  return ctx ?? defaultAdminAccess;
}

