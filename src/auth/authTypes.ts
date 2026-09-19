import type { Session, User } from "@supabase/supabase-js";

export type UserPlan = "free" | "pro";
export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
};
export type Database = {
  public: { Tables: { profiles: {
    Row: ProfileRow;
    Insert: { id: string; display_name?: string | null; avatar_url?: string | null };
    Update: { display_name?: string | null; avatar_url?: string | null };
    Relationships: [];
  } } };
};
export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}
export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  status: "loading" | "authenticated" | "anonymous" | "unconfigured";
  error: string | null;
  profileError: string | null;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
