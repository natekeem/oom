import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { errorResponse, jsonResponse } from "../cors.ts";

export interface AdminLearningRecord {
  id: string;
  userId: string;
  userDisplayName?: string | null;
  userEmail?: string | null;
  type: "session" | "activity";
  modeOrType: string;
  targetLevel?: string | null;
  courseId?: string | null;
  contentId?: string | null;
  status?: string | null;
  questionCount?: number;
  answeredCount?: number;
  timestamp: string;
}

export async function handleLearning(req: Request, adminClient: SupabaseClient): Promise<Response> {
  const url = new URL(req.url);
  const rawPage = parseInt(url.searchParams.get("page") ?? "1", 10);
  const rawPageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const typeFilter = url.searchParams.get("type") ?? "all"; // all | sessions | activities
  const userIdFilter = url.searchParams.get("userId");
  const modeFilter = url.searchParams.get("mode");
  const statusFilter = url.searchParams.get("status");
  const rangeFilter = url.searchParams.get("range") ?? "7d"; // today | 7d | 30d | all

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, 50) : 20;

  // Calculate range filter timestamp
  let rangeStartIso: string | null = null;
  const now = new Date();
  if (rangeFilter === "today") {
    const seoulDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    rangeStartIso = new Date(`${seoulDateStr}T00:00:00+09:00`).toISOString();
  } else if (rangeFilter === "7d") {
    rangeStartIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (rangeFilter === "30d") {
    rangeStartIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  let sessionRecords: AdminLearningRecord[] = [];
  let activityRecords: AdminLearningRecord[] = [];
  let totalSessions = 0;
  let totalActivities = 0;

  if (typeFilter === "all" || typeFilter === "sessions") {
    let q = adminClient.from("learning_sessions").select("id, user_id, mode, status, target_level, question_count, answered_count, started_at", { count: "exact" });
    if (userIdFilter) q = q.eq("user_id", userIdFilter);
    if (modeFilter) q = q.eq("mode", modeFilter);
    if (statusFilter) q = q.eq("status", statusFilter);
    if (rangeStartIso) q = q.gte("started_at", rangeStartIso);
    q = q.order("started_at", { ascending: false }).limit(100);

    const { data, count, error } = await q;
    if (error) {
      console.error("[OOM Admin Learning Sessions Error]", error);
      return errorResponse(req, 500, "SERVER_ERROR", "학습 세션 데이터를 불러오지 못했습니다.");
    }
    totalSessions = count ?? 0;
    sessionRecords = (data ?? []).map((s) => ({
      id: s.id,
      userId: s.user_id,
      type: "session",
      modeOrType: s.mode === "quick_practice" ? "빠른 연습" : "실전 모의고사",
      targetLevel: s.target_level,
      status: s.status,
      questionCount: s.question_count,
      answeredCount: s.answered_count,
      timestamp: s.started_at,
    }));
  }

  if ((typeFilter === "all" || typeFilter === "activities") && !modeFilter && !statusFilter) {
    let q = adminClient.from("learning_activity_events").select("id, user_id, activity_type, course_id, level_id, content_id, occurred_at", { count: "exact" });
    if (userIdFilter) q = q.eq("user_id", userIdFilter);
    if (rangeStartIso) q = q.gte("occurred_at", rangeStartIso);
    q = q.order("occurred_at", { ascending: false }).limit(100);

    const { data, count, error } = await q;
    if (error) {
      console.error("[OOM Admin Learning Activities Error]", error);
      return errorResponse(req, 500, "SERVER_ERROR", "학습 활동 데이터를 불러오지 못했습니다.");
    }
    totalActivities = count ?? 0;
    activityRecords = (data ?? []).map((a) => ({
      id: a.id,
      userId: a.user_id,
      type: "activity",
      modeOrType: a.activity_type === "survey_completed"
        ? "서베이 완료"
        : a.activity_type === "universal_script_completed"
        ? "만능 스크립트 완료"
        : "롤플레이 완료",
      courseId: a.course_id,
      targetLevel: a.level_id,
      contentId: a.content_id,
      timestamp: a.occurred_at,
    }));
  }

  // Combine and sort
  const combined = [...sessionRecords, ...activityRecords].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const total = typeFilter === "sessions" ? totalSessions : typeFilter === "activities" ? totalActivities : totalSessions + totalActivities;
  const from = (page - 1) * pageSize;
  const pagedRecords = combined.slice(from, from + pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Enrich user names
  const uniqueUserIds = [...new Set(pagedRecords.map((r) => r.userId))];
  const userMap: Record<string, { displayName: string | null; email: string | null }> = {};

  if (uniqueUserIds.length > 0) {
    const { data: profileList } = await adminClient
      .from("profiles")
      .select("id, display_name")
      .in("id", uniqueUserIds);
    profileList?.forEach((p) => {
      userMap[p.id] = { displayName: p.display_name, email: null };
    });
  }

  const enrichedRecords = pagedRecords.map((r) => ({
    ...r,
    userDisplayName: userMap[r.userId]?.displayName ?? null,
  }));

  return jsonResponse(req, {
    records: enrichedRecords,
    total,
    page,
    pageSize,
    totalPages,
  });
}
