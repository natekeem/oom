import { viewPathForId } from "../lib/routes";
import type { Profile, ProfileRow } from "./authTypes";

export function safeReturnPath(value: string | null | undefined): string {
  // Only known canonical destinations; no encoded paths, queries or callback loops.
  if (!value || /[%\\?#\s]/.test(value)) return "/mypage/";
  const path = value === "/" ? value : `${value.replace(/\/+$/, "")}/`;
  return path !== "/auth/callback/" && Object.values(viewPathForId).includes(path) ? path : "/mypage/";
}

export function safeAvatarUrl(value: string | null): string | null {
  try { return value && new URL(value).protocol === "https:" ? value : null; }
  catch { return null; }
}

export function mapProfile(row: ProfileRow): Profile {
  return { id: row.id, displayName: row.display_name, avatarUrl: safeAvatarUrl(row.avatar_url),
    plan: row.plan, createdAt: row.created_at, updatedAt: row.updated_at };
}
