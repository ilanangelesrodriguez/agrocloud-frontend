import type { NextRequest } from "next/server";

import { attachSession, clearSession, sessionFromRequest } from "@/lib/auth/cookie-session";
import { identityRequest } from "@/lib/auth/gateway";
import { ensureAccess } from "@/lib/auth/session-service";
import { reply, validatePost } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const forbidden = validatePost(request);
  if (forbidden) return forbidden;
  const saved = sessionFromRequest(request);
  if (!saved) return reply({ message: "Sesión local cerrada." });
  try {
    const access = await ensureAccess(saved);
    if (!access.ok) {
      const response = reply({ message: "Sesión local cerrada." });
      clearSession(response);
      return response;
    }
    const upstream = await identityRequest("/auth/logout", {
      method: "POST", accessToken: access.session.accessToken,
    });
    if (!upstream.ok && upstream.status !== 401) {
      const response = reply({ message: "No se pudo revocar la sesión. Intenta nuevamente." }, 503);
      if (access.renewed) attachSession(response, access.session);
      return response;
    }
    const response = reply({ message: "Sesión cerrada." });
    clearSession(response);
    return response;
  } catch {
    return reply({ message: "No se pudo revocar la sesión. Intenta nuevamente." }, 503);
  }
}
