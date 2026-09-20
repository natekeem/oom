import { authenticateAdminRequest } from "./auth.ts";
import { errorResponse, handleCorsPreflight, withTiming } from "./cors.ts";
import { handleAudit } from "./handlers/audit.ts";
import { handleLearning } from "./handlers/learning.ts";
import { handleMe } from "./handlers/me.ts";
import { handleOverview } from "./handlers/overview.ts";
import { handleGetUserDetail, handleListUsers } from "./handlers/users.ts";

export function normalizeAdminPath(pathname: string): string {
  let path = pathname
    .replace(/^\/functions\/v1\/admin-api/, "")
    .replace(/^\/admin-api/, "");
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
}

export async function handleAdminApiRequest(req: Request): Promise<Response> {
  const startTime = performance.now();

  // 1. Handle CORS Preflight
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  // 2. Phase 3.0 supports GET requests only (except OPTIONS handled above)
  if (req.method !== "GET") {
    return withTiming(
      errorResponse(req, 405, "METHOD_NOT_ALLOWED", "지원하지 않는 HTTP 메서드입니다."),
      startTime
    );
  }

  // 3. Authenticate and authorize admin request
  const authResult = await authenticateAdminRequest(req);
  if (authResult.error) {
    return withTiming(authResult.error, startTime);
  }

  const { adminUser, adminClient } = authResult;
  const url = new URL(req.url);
  const path = normalizeAdminPath(url.pathname);

  try {
    let res: Response;
    // 4. Route dispatcher
    if (path === "/me") {
      res = handleMe(req, adminUser);
    } else if (path === "/overview") {
      res = await handleOverview(req, adminClient);
    } else if (path === "/users") {
      res = await handleListUsers(req, adminClient);
    } else if (path.startsWith("/users/")) {
      const userId = path.slice("/users/".length).trim();
      if (!userId) {
        res = errorResponse(req, 400, "BAD_REQUEST", "사용자 ID가 제공되지 않았습니다.");
      } else {
        res = await handleGetUserDetail(req, adminClient, userId);
      }
    } else if (path === "/learning") {
      res = await handleLearning(req, adminClient);
    } else if (path === "/audit") {
      res = await handleAudit(req, adminClient, adminUser.role);
    } else {
      res = errorResponse(req, 404, "NOT_FOUND", "요청하신 엔드포인트를 찾을 수 없습니다.");
    }

    return withTiming(res, startTime);
  } catch (err) {
    console.error("[OOM Admin API Uncaught Error]", err);
    return withTiming(
      errorResponse(req, 500, "SERVER_ERROR", "서버 내부 오류가 발생했습니다."),
      startTime
    );
  }
}

// Supabase Edge Function default serve handler
if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve(handleAdminApiRequest);
}

