import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { AuthenticatedAdmin } from "../auth.ts";
import { errorResponse, jsonResponse } from "../cors.ts";
import { readBoundedJson } from "../../ai-api/handler.ts";
import { uuidPattern } from "../../../../shared/managed-ai/feedback.ts";

export async function handleAdminAi(
  req: Request,
  db: SupabaseClient,
  admin: AuthenticatedAdmin,
  path: string,
): Promise<Response> {
  if (req.method === "PATCH") {
    if (!["owner", "admin"].includes(admin.role))
      return errorResponse(req, 403, "FORBIDDEN", "설정 변경 권한이 없습니다.");
    if (path !== "/ai/settings")
      return errorResponse(req, 404, "NOT_FOUND", "지원하지 않는 경로입니다.");
    let patch: Record<string, unknown>;
    try {
      patch = (await readBoundedJson(req, 2000)) as Record<string, unknown>;
      if (
        !patch ||
        Array.isArray(patch) ||
        !Object.keys(patch).length ||
        Object.keys(patch).some(
          (k) => !["enabled", "model", "freeLimit", "proLimit"].includes(k),
        ) ||
        ("enabled" in patch && typeof patch.enabled !== "boolean") ||
        ("model" in patch &&
          (typeof patch.model !== "string" ||
            !/^gemini-[a-z0-9.-]{1,80}$/.test(patch.model))) ||
        ["freeLimit", "proLimit"].some(
          (k) =>
            k in patch &&
            (typeof patch[k] !== "number" ||
              !Number.isInteger(patch[k]) ||
              (patch[k] as number) < 0 ||
              (patch[k] as number) > 1000),
        )
      )
        throw new Error();
    } catch {
      return errorResponse(
        req,
        400,
        "INVALID_SETTINGS",
        "설정 값을 확인해 주세요. 한도는 0~1000의 정수입니다.",
      );
    }
    const { error } = await db.rpc("admin_update_ai", {
      p_admin: admin.userId,
      p_patch: patch,
    });
    if (error)
      return errorResponse(
        req,
        400,
        "INVALID_SETTINGS",
        "설정 변경을 저장하지 못했습니다. 사용 가능한 모델과 권한을 확인하세요.",
      );
    return jsonResponse(req, { saved: true });
  }
  if (req.method !== "GET")
    return errorResponse(
      req,
      405,
      "METHOD_NOT_ALLOWED",
      "지원하지 않는 메서드입니다.",
    );
  if (path === "/ai/overview") {
    const { data, error } = await db.rpc("admin_ai_overview");
    if (error) throw new Error("AI_OVERVIEW_FAILED");
    return jsonResponse(req, { ...data, users: await enrichUsers(db, data.users || []) });
  }
  if (path === "/ai/settings") {
    const results = await Promise.all([
      db
        .from("ai_runtime_settings")
        .select(
          "managed_ai_enabled,default_model,requests_per_minute,updated_at",
        )
        .single(),
      db.from("ai_plan_limits").select("plan,feature,limit_count,enabled"),
      db
        .from("ai_model_catalog")
        .select(
          "model,enabled,input_cost_per_million_microusd,output_cost_per_million_microusd,cached_input_cost_per_million_microusd,pricing_note",
        ),
    ]);
    if (results.some((r) => r.error)) throw new Error("AI_SETTINGS_FAILED");
    return jsonResponse(req, {
      runtime: results[0].data,
      limits: results[1].data,
      models: results[2].data,
    });
  }
  if (path === "/ai/usage") {
    const p = new URL(req.url).searchParams;
    const page = Number(p.get("page") || 1);
    const pageSize = 20;
    if (!Number.isInteger(page) || page < 1 || page > 10000)
      return errorResponse(
        req,
        400,
        "BAD_REQUEST",
        "페이지 값을 확인해 주세요.",
      );
    let query = db
      .from("ai_usage_events")
      .select(
        "request_id,user_id,feature,effective_plan,model,status,input_tokens,output_tokens,thought_tokens,cached_input_tokens,estimated_cost_microusd,latency_ms,error_code,created_at",
        { count: "exact" },
      );
    for (const [key, column, allowed] of [
      [
        "status",
        "status",
        ["reserved", "succeeded", "failed", "quota_blocked"],
      ],
      ["plan", "effective_plan", ["free", "pro"]],
      ["feature", "feature", ["answer_feedback"]],
    ] as const) {
      const value = p.get(key);
      if (value) {
        if (!(allowed as readonly string[]).includes(value))
          return errorResponse(
            req,
            400,
            "BAD_REQUEST",
            "필터 값을 확인해 주세요.",
          );
        query = query.eq(column, value);
      }
    }
    const user = p.get("user");
    if (user) {
      if (!uuidPattern.test(user))
        return errorResponse(
          req,
          400,
          "BAD_REQUEST",
          "사용자 UUID를 확인해 주세요.",
        );
      query = query.eq("user_id", user);
    }
    const model = p.get("model");
    if (model) {
      if (!/^gemini-[a-z0-9.-]{1,80}$/.test(model))
        return errorResponse(
          req,
          400,
          "BAD_REQUEST",
          "모델 값을 확인해 주세요.",
        );
      query = query.eq("model", model);
    }
    for (const [key, op] of [
      ["from", "gte"],
      ["to", "lt"],
    ] as const) {
      const value = p.get(key);
      if (value) {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
          !Number.isFinite(Date.parse(value))
        )
          return errorResponse(
            req,
            400,
            "BAD_REQUEST",
            "날짜 값을 확인해 주세요.",
          );
        const date = new Date(`${value}T00:00:00+09:00`);
        if (key === "to") date.setUTCDate(date.getUTCDate() + 1);
        query = query[op]("created_at", date.toISOString());
      }
    }
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw new Error("AI_USAGE_FAILED");
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

async function enrichUsers<T extends { user_id: string }>(db: SupabaseClient, rows: T[]) {
  const ids = [...new Set(rows.map(row => row.user_id))];
  if (!ids.length) return rows;
  const { data, error } = await db.from("profiles").select("id,display_name").in("id", ids);
  if (error) throw new Error("AI_IDENTITIES_FAILED");
  const names = new Map((data || []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name]));
  return rows.map(row => ({ ...row, display_name: names.get(row.user_id) ?? null }));
}
