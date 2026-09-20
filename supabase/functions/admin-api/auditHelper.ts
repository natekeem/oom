// Helper to write privileged audit logs from the Edge Function
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const SENSITIVE_KEY_PATTERN = /(token|secret|password|key|auth|credential)/i;

export function sanitizeAuditMetadata(metadata: Record<string, unknown> = {}): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (SENSITIVE_KEY_PATTERN.test(k)) {
      sanitized[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      sanitized[k] = sanitizeAuditMetadata(v as Record<string, unknown>);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

export async function writeAdminAuditLog(
  adminClient: SupabaseClient,
  adminUserId: string,
  action: string,
  targetType: string | null = null,
  targetId: string | null = null,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const cleanMeta = sanitizeAuditMetadata(metadata);
    const { error } = await adminClient.from("admin_audit_logs").insert({
      admin_user_id: adminUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata: cleanMeta,
    });
    if (error) {
      console.error("[OOM Admin Audit Log Error]", error);
    }
  } catch (err) {
    console.error("[OOM Admin Audit Log Exception]", err);
  }
}
