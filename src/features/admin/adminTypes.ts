export type AdminRole = "owner" | "admin" | "support";

export interface AdminSelf {
  userId: string;
  role: AdminRole;
  displayName: string | null;
  avatarUrl: string | null;
}

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

export interface AdminOverview {
  metrics: DashboardMetrics;
  recentUsers: RecentUserItem[];
  recentLearningActivity: RecentLearningItem[];
}

export interface AdminUserSummary {
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

export interface AdminLearningRecord {
  id: string;
  userId: string;
  userDisplayName?: string | null;
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

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminDisplayName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
