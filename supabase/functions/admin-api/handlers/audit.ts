import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { AdminRole } from "../auth.ts";
import { errorResponse, jsonResponse } from "../cors.ts";

export interface AdminAuditItem {
  id: string;
  adminUserId: string;
  adminDisplayName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function handleAudit(
  req: Request,
  adminClient: SupabaseClient,
  adminRole: AdminRole
): Promise<Response> {
  // Check permission: support cannot read audit logs
  if (adminRole === "support") {
    return errorResponse(req, 403, "FORBIDDEN", "해당 권한(support)으로는 감사 로그를 조회할 수 없습니다.");
  }

  const url = new URL(req.url);
  const rawPage = parseInt(url.searchParams.get("page") ?? "1", 10);
  const rawPageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, 50) : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: logsData, count, error } = await adminClient
    .from("admin_audit_logs")
    .select("id, admin_user_id, action, target_type, target_id, metadata, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[OOM Admin Audit Query Error]", error);
    return errorResponse(req, 500, "SERVER_ERROR", "감사 로그를 불러오지 못했습니다.");
  }

  const logs = logsData ?? [];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Enrich with admin display name
  const adminIds = [...new Set(logs.map((l) => l.admin_user_id))];
  const adminMap: Record<string, string | null> = {};
  if (adminIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, display_name")
      .in("id", adminIds);
    profiles?.forEach((p) => {
      adminMap[p.id] = p.display_name;
    });
  }

  const enrichedLogs: AdminAuditItem[] = logs.map((l) => ({
    id: l.id,
    adminUserId: l.admin_user_id,
    adminDisplayName: adminMap[l.admin_user_id] ?? null,
    action: l.action,
    targetType: l.target_type,
    targetId: l.target_id,
    metadata: (l.metadata as Record<string, unknown>) ?? {},
    createdAt: l.created_at,
  }));

  return jsonResponse(req, {
    logs: enrichedLogs,
    total,
    page,
    pageSize,
    totalPages,
  });
}
