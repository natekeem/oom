import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";
import { errorResponse } from "./cors.ts";

export type AdminRole = "owner" | "admin" | "support";

export interface AuthenticatedAdmin {
  userId: string;
  role: AdminRole;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AuthSuccess {
  authUser: User;
  adminUser: AuthenticatedAdmin;
  adminClient: SupabaseClient;
  error?: undefined;
}

export interface AuthFailure {
  authUser?: undefined;
  adminUser?: undefined;
  adminClient?: undefined;
  error: Response;
}

export type AuthResult = AuthSuccess | AuthFailure;

export async function authenticateAdminRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return {
      error: errorResponse(req, 401, "UNAUTHORIZED", "인증 토큰이 제공되지 않았습니다. 로그인해 주세요."),
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      error: errorResponse(req, 401, "UNAUTHORIZED", "유효한 인증 토큰이 필요합니다."),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[OOM Admin API] Missing server credentials in Edge Function environment.");
    return {
      error: errorResponse(req, 500, "SERVER_ERROR", "서버 환경 설정이 완료되지 않았습니다."),
    };
  }

  // 1. Verify user token via Supabase Auth
  const tokenClient = createClient(supabaseUrl, anonKey || serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await tokenClient.auth.getUser(token);
  if (userError || !user) {
    return {
      error: errorResponse(req, 401, "UNAUTHORIZED", "유효하지 않거나 만료된 세션입니다. 다시 로그인해 주세요."),
    };
  }

  // 2. Privileged service client for admin data lookup
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // 3. Query admin_users table for user's admin role
  const { data: adminRow, error: adminErr } = await adminClient
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminErr || !adminRow) {
    return {
      error: errorResponse(req, 403, "FORBIDDEN", "관리자 권한이 필요합니다."),
    };
  }

  const role = adminRow.role as AdminRole;
  if (!["owner", "admin", "support"].includes(role)) {
    return {
      error: errorResponse(req, 403, "FORBIDDEN", "알 수 없는 관리자 권한입니다."),
    };
  }

  // 4. Fetch profile display name for admin identity
  const { data: profile } = await adminClient
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    authUser: user,
    adminUser: {
      userId: user.id,
      role,
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    },
    adminClient,
  };
}
