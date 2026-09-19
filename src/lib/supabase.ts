import { createClient } from "@supabase/supabase-js";
import type { Database } from "../auth/authTypes";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
function validConfig() {
  try {
    return Boolean(url && key?.startsWith("sb_publishable_") && ["https:", "http:"].includes(new URL(url).protocol));
  } catch { return false; }
}
export const isSupabaseConfigured = validConfig();
export const supabase = isSupabaseConfigured ? createClient<Database>(url!, key!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
}) : null;
