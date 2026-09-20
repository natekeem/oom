import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { errorResponse, jsonResponse } from "../cors.ts";

export interface AdminUserListItem {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  joinedAt: string;
  lastSignInAt: string | null;
  planDisplay: string;
  hasLearningPreferences: boolean;
  learningSessionCount: number;
  learningActivityCount: number;
  lastLearningAt: string | null;
}

export interface AdminUserDetail {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  joinedAt: string;
  lastSignInAt: string | null;
  planDisplay: string;
  learningPreferences: {
    targetLevel: string | null;
    courseId: string | null;
    updatedAt: string;
  } | null;
  summary: {
    totalSessions: number;
    completedSessions: number;
    totalAttempts: number;
    totalActivities: number;
    lastLearningAt: string | null;
  };
  recentSessions: Array<{
    id: string;
    mode: string;
    status: string;
    targetLevel: string | null;
    questionCount: number;
    answeredCount: number;
    startedAt: string;
    completedAt: string | null;
  }>;
  recentActivities: Array<{
    id: string;
    activityType: string;
    courseId: string;
    levelId: string;
    contentId: string;
    occurredAt: string;
  }>;
}

export async function handleListUsers(req: Request, adminClient: SupabaseClient): Promise<Response> {
  const url = new URL(req.url);
  const rawPage = parseInt(url.searchParams.get("page") ?? "1", 10);
  const rawPageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const search = (url.searchParams.get("search") ?? "").trim();

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, 50) : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let userIdsFilter: string[] | null = null;
  if (search && search.includes("@")) {
    // Attempt email prefix match using Auth Admin API
    try {
      const { data: authData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 50 });
      if (authData?.users) {
        const matches = authData.users
          .filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()))
          .map((u) => u.id);
        userIdsFilter = matches.length > 0 ? matches : ["00000000-0000-0000-0000-000000000000"];
      }
    } catch (err) {
      console.warn("[OOM Admin Users] Auth listUsers search fallback:", err);
    }
  }

  let query = adminClient
    .from("profiles")
    .select("id, display_name, avatar_url, plan, created_at", { count: "exact" });

  if (userIdsFilter) {
    query = query.in("id", userIdsFilter);
  } else if (search) {
    query = query.ilike("display_name", `%${search}%`);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: profileRows, count, error: queryErr } = await query;
  if (queryErr) {
    console.error("[OOM Admin Users Error]", queryErr);
    return errorResponse(req, 500, "SERVER_ERROR", "사용자 목록을 불러오지 못했습니다.");
  }

  const profiles = profileRows ?? [];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Enhance each profile with auth and activity stats in parallel
  const enhancedUsers: AdminUserListItem[] = await Promise.all(
    profiles.map(async (p) => {
      let email: string | null = null;
      let lastSignInAt: string | null = null;

      try {
        const { data: authUser } = await adminClient.auth.admin.getUserById(p.id);
        email = authUser.user?.email ?? null;
        lastSignInAt = authUser.user?.last_sign_in_at ?? null;
      } catch {
        // Suppress individual auth fetch failures
      }

      const [prefRes, sessRes, actRes, lastSessRes, lastActRes] = await Promise.all([
        adminClient.from("learning_preferences").select("user_id").eq("user_id", p.id).maybeSingle(),
        adminClient.from("learning_sessions").select("id", { count: "exact", head: true }).eq("user_id", p.id),
        adminClient.from("learning_activity_events").select("id", { count: "exact", head: true }).eq("user_id", p.id),
        adminClient.from("learning_sessions").select("started_at").eq("user_id", p.id).order("started_at", { ascending: false }).limit(1).maybeSingle(),
        adminClient.from("learning_activity_events").select("occurred_at").eq("user_id", p.id).order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      const lastSessAt = lastSessRes.data?.started_at ?? null;
      const lastActAt = lastActRes.data?.occurred_at ?? null;
      let lastLearningAt: string | null = null;
      if (lastSessAt && lastActAt) {
        lastLearningAt = new Date(lastSessAt) > new Date(lastActAt) ? lastSessAt : lastActAt;
      } else {
        lastLearningAt = lastSessAt || lastActAt;
      }

      return {
        id: p.id,
        email,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        joinedAt: p.created_at,
        lastSignInAt,
        planDisplay: p.plan === "pro" ? "PRO (표시용)" : "FREE",
        hasLearningPreferences: Boolean(prefRes.data),
        learningSessionCount: sessRes.count ?? 0,
        learningActivityCount: actRes.count ?? 0,
        lastLearningAt,
      };
    })
  );

  return jsonResponse(req, {
    users: enhancedUsers,
    total,
    page,
    pageSize,
    totalPages,
  });
}

export async function handleGetUserDetail(
  req: Request,
  adminClient: SupabaseClient,
  userId: string
): Promise<Response> {
  const [authRes, profileRes, prefRes, sessionsCountRes, completedSessionsRes, attemptsCountRes, actCountRes, recentSessRes, recentActRes] =
    await Promise.all([
      adminClient.auth.admin.getUserById(userId).catch(() => ({ data: { user: null } })),
      adminClient.from("profiles").select("id, display_name, avatar_url, plan, created_at").eq("id", userId).maybeSingle(),
      adminClient.from("learning_preferences").select("target_level, course_id, updated_at").eq("user_id", userId).maybeSingle(),
      adminClient.from("learning_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      adminClient.from("learning_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
      adminClient.from("learning_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
      adminClient.from("learning_activity_events").select("id", { count: "exact", head: true }).eq("user_id", userId),
      adminClient.from("learning_sessions").select("id, mode, status, target_level, question_count, answered_count, started_at, completed_at").eq("user_id", userId).order("started_at", { ascending: false }).limit(5),
      adminClient.from("learning_activity_events").select("id, activity_type, course_id, level_id, content_id, occurred_at").eq("user_id", userId).order("occurred_at", { ascending: false }).limit(5),
    ]);

  if (!profileRes.data && !authRes.data.user) {
    return errorResponse(req, 404, "NOT_FOUND", "해당 사용자를 찾을 수 없습니다.");
  }

  const profile = profileRes.data;
  const authUser = authRes.data.user;

  const lastSessAt = recentSessRes.data?.[0]?.started_at ?? null;
  const lastActAt = recentActRes.data?.[0]?.occurred_at ?? null;
  let lastLearningAt: string | null = null;
  if (lastSessAt && lastActAt) {
    lastLearningAt = new Date(lastSessAt) > new Date(lastActAt) ? lastSessAt : lastActAt;
  } else {
    lastLearningAt = lastSessAt || lastActAt;
  }

  const detail: AdminUserDetail = {
    id: userId,
    email: authUser?.email ?? null,
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    joinedAt: profile?.created_at ?? authUser?.created_at ?? "",
    lastSignInAt: authUser?.last_sign_in_at ?? null,
    planDisplay: profile?.plan === "pro" ? "PRO (표시용)" : "FREE",
    learningPreferences: prefRes.data
      ? {
          targetLevel: prefRes.data.target_level,
          courseId: prefRes.data.course_id,
          updatedAt: prefRes.data.updated_at,
        }
      : null,
    summary: {
      totalSessions: sessionsCountRes.count ?? 0,
      completedSessions: completedSessionsRes.count ?? 0,
      totalAttempts: attemptsCountRes.count ?? 0,
      totalActivities: actCountRes.count ?? 0,
      lastLearningAt,
    },
    recentSessions: (recentSessRes.data ?? []).map((s) => ({
      id: s.id,
      mode: s.mode,
      status: s.status,
      targetLevel: s.target_level,
      questionCount: s.question_count,
      answeredCount: s.answered_count,
      startedAt: s.started_at,
      completedAt: s.completed_at,
    })),
    recentActivities: (recentActRes.data ?? []).map((a) => ({
      id: a.id,
      activityType: a.activity_type,
      courseId: a.course_id,
      levelId: a.level_id,
      contentId: a.content_id,
      occurredAt: a.occurred_at,
    })),
  };

  return jsonResponse(req, detail);
}
