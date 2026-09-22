import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import { createAiHandler } from "./handler.ts";
import { geminiProvider } from "./provider.ts";

const handler = createAiHandler({
  provider: geminiProvider(Deno.env.get("GEMINI_API_KEY") || ""),
  async authenticate(req) {
    const token = req.headers
      .get("authorization")
      ?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return null;
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous) return null;
    return { userId: data.user.id, db };
  },
});
Deno.serve(handler);
