import type { AuthenticatedAdmin } from "../auth.ts";
import { jsonResponse } from "../cors.ts";

export function handleMe(req: Request, adminUser: AuthenticatedAdmin): Response {
  return jsonResponse(req, {
    userId: adminUser.userId,
    role: adminUser.role,
    displayName: adminUser.displayName,
    avatarUrl: adminUser.avatarUrl,
  });
}
