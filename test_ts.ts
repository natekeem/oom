import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./src/auth/authTypes";

type T = Database['public']['Tables']['learning_sessions'];
type InsertT = T['Insert'];
type Check = InsertT extends Record<string, unknown> ? true : false;
