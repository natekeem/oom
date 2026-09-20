import { supabase } from "../../lib/supabase";
import type {
  AdminAuditLog,
  AdminErrorResponse,
  AdminLearningRecord,
  AdminOverview,
  AdminSelf,
  AdminUserDetail,
  AdminUserSummary,
} from "./adminTypes";

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

function getAdminApiBaseUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!supabaseUrl) return "";
  return `${supabaseUrl.replace(/\/+$/, "")}/functions/v1/admin-api`;
}

async function requestAdminApi<T>(path: string, searchParams?: Record<string, string | number | undefined | null>): Promise<T> {
  if (!supabase) {
    throw new AdminApiError(500, "UNCONFIGURED", "Supabase가 설정되지 않았습니다.");
  }

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData.session?.access_token) {
    throw new AdminApiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  }

  const baseUrl = getAdminApiBaseUrl();
  if (!baseUrl) {
    throw new AdminApiError(500, "SERVER_URL_MISSING", "VITE_SUPABASE_URL 환경 변수가 설정되지 않았습니다.");
  }

  const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorCode = "UNKNOWN_ERROR";
    let errorMessage = `관리자 API 요청 실패 (${response.status})`;

    try {
      const errJson = (await response.json()) as AdminErrorResponse;
      if (errJson.error) {
        errorCode = errJson.error.code;
        errorMessage = errJson.error.message;
      }
    } catch {
      // Fallback to HTTP status message
    }

    throw new AdminApiError(response.status, errorCode, errorMessage);
  }

  const serverTiming = response.headers.get("Server-Timing");
  const responseTime = response.headers.get("X-Response-Time");
  if (import.meta.env.DEV && (serverTiming || responseTime)) {
    console.debug(`[Admin API] ${path} timing:`, { responseTime, serverTiming });
  }

  return (await response.json()) as T;
}

interface AdminMeCacheEntry {
  userId: string;
  data: AdminSelf;
}

let adminMeCache: AdminMeCacheEntry | null = null;

export function invalidateAdminMeCache(): void {
  adminMeCache = null;
}

export async function fetchAdminMe(forceRefresh = false): Promise<AdminSelf> {
  const sessionRes = await supabase?.auth.getSession();
  const currentUserId = sessionRes?.data?.session?.user?.id;

  if (!forceRefresh && adminMeCache && currentUserId && adminMeCache.userId === currentUserId) {
    return adminMeCache.data;
  }

  const data = await requestAdminApi<AdminSelf>("/me");
  if (currentUserId) {
    adminMeCache = { userId: currentUserId, data };
  }
  return data;
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  return requestAdminApi<AdminOverview>("/overview");
}

export async function fetchAdminUsers(
  page = 1,
  pageSize = 20,
  search = ""
): Promise<{
  users: AdminUserSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  return requestAdminApi("/users", { page, pageSize, search });
}

export async function fetchAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  return requestAdminApi<AdminUserDetail>(`/users/${encodeURIComponent(userId)}`);
}

export async function fetchAdminLearning(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  userId?: string;
  mode?: string;
  status?: string;
  range?: string;
}): Promise<{
  records: AdminLearningRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  return requestAdminApi("/learning", params);
}

export async function fetchAdminAudit(
  page = 1,
  pageSize = 20
): Promise<{
  logs: AdminAuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  return requestAdminApi("/audit", { page, pageSize });
}
