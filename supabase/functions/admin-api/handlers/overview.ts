import type { SupabaseClient } from "@supabase/supabase-js";
import { jsonResponse } from "../cors.ts";

export interface DashboardMetrics {
  timezone: string;
  todayBoundaryIso: string;
  totalUsers: number;
  newUsersToday: number;
  newUsers7d: number;
  usersWithPreferences: number;
  learningSessionsToday: number;
  learningSessions7d: number;
  learningActivitiesToday: number;
  learningActivities7d: number;
  activeLearners24h: number;
  activeLearners7d: number;
}

export interface RecentUserItem {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  planDisplay: string;
  createdAt: string;
}

export interface RecentLearningItem {
  id: string;
  userId: string;
  type: "session" | "activity";
  modeOrCategory: string;
  detail: string;
  status?: string;
  timestamp: string;
}

export interface OverviewPayload {
  metrics: DashboardMetrics;
  recentUsers: RecentUserItem[];
  recentLearningActivity: RecentLearningItem[];
}

export function getSeoulTodayBoundary(now = new Date()): string {
  const seoulDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${seoulDateStr}T00:00:00+09:00`).toISOString();
}

export async function handleOverview(req: Request, adminClient: SupabaseClient): Promise<Response> {
  const now = new Date();
  const todayBoundaryIso = getSeoulTodayBoundary(now);
  const trailing24hIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const trailing7dIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Run aggregate counts concurrently
  const [
    totalUsersRes,
    newUsersTodayRes,
    newUsers7dRes,
    preferencesRes,
    sessionsTodayRes,
    sessions7dRes,
    activitiesTodayRes,
    activities7dRes,
    sessions24hUsersRes,
    activities24hUsersRes,
    sessions7dUsersRes,
    activities7dUsersRes,
    recentProfilesRes,
    recentSessionsRes,
    recentActivitiesRes,
  ] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayBoundaryIso),
    adminClient.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", trailing7dIso),
    adminClient.from("learning_preferences").select("user_id", { count: "exact", head: true }),
    adminClient.from("learning_sessions").select("id", { count: "exact", head: true }).gte("started_at", todayBoundaryIso),
    adminClient.from("learning_sessions").select("id", { count: "exact", head: true }).gte("started_at", trailing7dIso),
    adminClient.from("learning_activity_events").select("id", { count: "exact", head: true }).gte("occurred_at", todayBoundaryIso),
    adminClient.from("learning_activity_events").select("id", { count: "exact", head: true }).gte("occurred_at", trailing7dIso),
    adminClient.from("learning_sessions").select("user_id").gte("started_at", trailing24hIso),
    adminClient.from("learning_activity_events").select("user_id").gte("occurred_at", trailing24hIso),
    adminClient.from("learning_sessions").select("user_id").gte("started_at", trailing7dIso),
    adminClient.from("learning_activity_events").select("user_id").gte("occurred_at", trailing7dIso),
    adminClient.from("profiles").select("id, display_name, avatar_url, plan, created_at").order("created_at", { ascending: false }).limit(5),
    adminClient.from("learning_sessions").select("id, user_id, mode, status, started_at").order("started_at", { ascending: false }).limit(5),
    adminClient.from("learning_activity_events").select("id, user_id, activity_type, course_id, level_id, content_id, occurred_at").order("occurred_at", { ascending: false }).limit(5),
  ]);

  // Compute distinct active learners
  const active24hSet = new Set<string>();
  sessions24hUsersRes.data?.forEach((r) => r.user_id && active24hSet.add(r.user_id));
  activities24hUsersRes.data?.forEach((r) => r.user_id && active24hSet.add(r.user_id));

  const active7dSet = new Set<string>();
  sessions7dUsersRes.data?.forEach((r) => r.user_id && active7dSet.add(r.user_id));
  activities7dUsersRes.data?.forEach((r) => r.user_id && active7dSet.add(r.user_id));

  const metrics: DashboardMetrics = {
    timezone: "Asia/Seoul",
    todayBoundaryIso,
    totalUsers: totalUsersRes.count ?? 0,
    newUsersToday: newUsersTodayRes.count ?? 0,
    newUsers7d: newUsers7dRes.count ?? 0,
    usersWithPreferences: preferencesRes.count ?? 0,
    learningSessionsToday: sessionsTodayRes.count ?? 0,
    learningSessions7d: sessions7dRes.count ?? 0,
    learningActivitiesToday: activitiesTodayRes.count ?? 0,
    learningActivities7d: activities7dRes.count ?? 0,
    activeLearners24h: active24hSet.size,
    activeLearners7d: active7dSet.size,
  };

  const recentUsers: RecentUserItem[] = (recentProfilesRes.data ?? []).map((p) => ({
    id: p.id,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
    planDisplay: p.plan === "pro" ? "PRO (표시용)" : "FREE",
    createdAt: p.created_at,
  }));

  const recentLearningActivity: RecentLearningItem[] = [
    ...(recentSessionsRes.data ?? []).map((s) => ({
      id: s.id,
      userId: s.user_id,
      type: "session" as const,
      modeOrCategory: s.mode === "quick_practice" ? "빠른 연습" : "실전 모의고사",
      detail: `세션 상태: ${s.status === "completed" ? "완료" : s.status === "in_progress" ? "진행 중" : "중단"}`,
      status: s.status,
      timestamp: s.started_at,
    })),
    ...(recentActivitiesRes.data ?? []).map((a) => ({
      id: a.id,
      userId: a.user_id,
      type: "activity" as const,
      modeOrCategory: a.activity_type === "survey_completed"
        ? "서베이 완료"
        : a.activity_type === "universal_script_completed"
        ? "만능 스크립트"
        : "롤플레이",
      detail: `${a.course_id} · ${a.level_id} · ${a.content_id}`,
      timestamp: a.occurred_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const payload: OverviewPayload = {
    metrics,
    recentUsers,
    recentLearningActivity,
  };

  return jsonResponse(req, payload);
}
