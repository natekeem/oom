import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { AuthenticatedAdmin } from "../auth.ts";
import { errorResponse, jsonResponse } from "../cors.ts";
import { readBoundedJson } from "../../ai-api/handler.ts";
import { uuidPattern } from "../../../../shared/managed-ai/feedback.ts";

export async function handleAdminStt(
  req: Request,
  db: SupabaseClient,
  admin: AuthenticatedAdmin,
  path: string
): Promise<Response> {
  if (req.method === "PATCH") {
    if (!["owner", "admin"].includes(admin.role)) {
      return errorResponse(req, 403, "FORBIDDEN", "설정 변경 권한이 없습니다.");
    }
    if (path !== "/stt/settings") {
      return errorResponse(req, 404, "NOT_FOUND", "지원하지 않는 경로입니다.");
    }

    let patch: Record<string, unknown>;
    try {
      patch = (await readBoundedJson(req, 2000)) as Record<string, unknown>;
      if (
        !patch ||
        Array.isArray(patch) ||
        !Object.keys(patch).length ||
        Object.keys(patch).some((k) => !["enabled", "model", "limits"].includes(k)) ||
        ("enabled" in patch && typeof patch.enabled !== "boolean") ||
        ("model" in patch &&
          (typeof patch.model !== "string" || !/^gemini-[a-z0-9.-]{1,80}$/.test(patch.model))) ||
        ("limits" in patch && !validSttLimitsPatch(patch.limits))
      ) {
        throw new Error();
      }
    } catch {
      return errorResponse(
        req,
        400,
        "INVALID_SETTINGS",
        "STT 설정 값을 확인해 주세요. 한도는 분 단위 또는 밀리초 단위의 0 이상의 숫자입니다."
      );
    }

    // Normalize limits if provided in minutes
    if (patch.limits && typeof patch.limits === "object") {
      const limits = { ...(patch.limits as Record<string, number>) };
      for (const key of ["free", "pro"] as const) {
        if (key in limits && typeof limits[key] === "number") {
          // If <= 1440, treat as minutes and convert to ms
          if (limits[key] <= 1440) {
            limits[key] = limits[key] * 60000;
          }
        }
      }
      patch.limits = limits;
    }

    const { error } = await db.rpc("admin_update_stt", {
      p_admin: admin.userId,
      p_patch: patch,
    });

    if (error) {
      return errorResponse(
        req,
        400,
        "INVALID_SETTINGS",
        "설정 변경을 저장하지 못했습니다. 사용 가능한 모델과 권한을 확인하세요."
      );
    }

    return jsonResponse(req, { saved: true });
  }

  if (req.method !== "GET") {
    return errorResponse(req, 405, "METHOD_NOT_ALLOWED", "지원하지 않는 메서드입니다.");
  }

  if (path === "/stt/overview") {
    const { data, error } = await db.rpc("admin_stt_overview");
    if (error) throw new Error("STT_OVERVIEW_FAILED");
    return jsonResponse(req, {
      ...data,
      users: await enrichUsers(db, data.users || []),
    });
  }

  if (path === "/stt/settings") {
    const results = await Promise.all([
      db
        .from("stt_runtime_settings")
        .select(
          "managed_stt_enabled,default_provider,default_model,requests_per_minute,daily_limit_ms_free,daily_limit_ms_pro,updated_at"
        )
        .single(),
      db
        .from("stt_model_catalog")
        .select(
          "provider,model,enabled,input_cost_per_million_microusd,output_cost_per_million_microusd,estimated_cost_per_second_microusd,pricing_note"
        ),
    ]);

    if (results.some((r) => r.error)) throw new Error("STT_SETTINGS_FAILED");
    return jsonResponse(req, {
      runtime: results[0].data,
      models: results[1].data,
    });
  }

  if (path === "/stt/usage") {
    const p = new URL(req.url).searchParams;
    const page = Number(p.get("page") || 1);
    const pageSize = 20;
    if (!Number.isInteger(page) || page < 1 || page > 10000) {
      return errorResponse(req, 400, "BAD_REQUEST", "페이지 값을 확인해 주세요.");
    }

    let query = db
      .from("stt_usage_events")
      .select(
        "request_id,user_id,source,effective_plan,model,status,audio_duration_ms,input_tokens,output_tokens,estimated_cost_microusd,latency_ms,error_code,created_at",
        { count: "exact" }
      );

    for (const [key, column, allowed] of [
      ["status", "status", ["reserved", "succeeded", "failed", "quota_blocked"]],
      ["plan", "effective_plan", ["free", "pro"]],
      ["source", "source", ["quick_practice", "roleplay", "mock_review"]],
    ] as const) {
      const value = p.get(key);
      if (value) {
        if (!(allowed as readonly string[]).includes(value)) {
          return errorResponse(req, 400, "BAD_REQUEST", "필터 값을 확인해 주세요.");
        }
        query = query.eq(column, value);
      }
    }

    const user = p.get("user");
    if (user) {
      if (!uuidPattern.test(user)) {
        return errorResponse(req, 400, "BAD_REQUEST", "사용자 UUID를 확인해 주세요.");
      }
      query = query.eq("user_id", user);
    }

    const model = p.get("model");
    if (model) {
      if (!/^gemini-[a-z0-9.-]{1,80}$/.test(model)) {
        return errorResponse(req, 400, "BAD_REQUEST", "모델 값을 확인해 주세요.");
      }
      query = query.eq("model", model);
    }

    for (const [key, op] of [
      ["from", "gte"],
      ["to", "lt"],
    ] as const) {
      const value = p.get(key);
      if (value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value))) {
          return errorResponse(req, 400, "BAD_REQUEST", "날짜 값을 확인해 주세요.");
        }
        const date = new Date(`${value}T00:00:00+09:00`);
        if (key === "to") date.setUTCDate(date.getUTCDate() + 1);
        query = query[op]("created_at", date.toISOString());
      }
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw new Error("STT_USAGE_FAILED");

    return jsonResponse(req, {
      records: await enrichUsers(db, data || []),
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  }

  return errorResponse(req, 404, "NOT_FOUND", "요청 경로를 찾을 수 없습니다.");
}

function validSttLimitsPatch(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const limits = value as Record<string, unknown>;
  const keys = Object.keys(limits);
  if (keys.length === 0 || keys.some((k) => k !== "free" && k !== "pro")) return false;
  return keys.every((k) => {
    const val = limits[k];
    return typeof val === "number" && Number.isInteger(val) && val >= 0 && val <= 86400000;
  });
}

async function enrichUsers<T extends { user_id: string }>(db: SupabaseClient, rows: T[]) {
  const ids = [...new Set(rows.map((row) => row.user_id))];
  if (!ids.length) return rows;
  const { data, error } = await db.from("profiles").select("id,display_name").in("id", ids);
  if (error) throw new Error("STT_IDENTITIES_FAILED");
  const names = new Map((data || []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name]));
  return rows.map((row) => ({ ...row, display_name: names.get(row.user_id) ?? null }));
}
