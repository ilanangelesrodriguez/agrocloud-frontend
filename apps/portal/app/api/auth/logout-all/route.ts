import type { NextRequest } from "next/server";

import { attachSession, clearSession, sessionFromRequest } from "@/lib/auth/cookie-session";
import { identityRequest } from "@/lib/auth/gateway";
import { ensureAccess } from "@/lib/auth/session-service";
import { remoteError, reply, validatePost } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const forbidden = validatePost(request);

  if (forbidden) return forbidden;
  const saved = sessionFromRequest(request);

  if (!saved) return reply({ message: "Debes iniciar sesión." }, 401);
  try {
    const access = await ensureAccess(saved);

    if (!access.ok) return reply({ message: "Debes iniciar sesión." }, 401);
    const upstream = await identityRequest("/auth/logout-all", {
      method: "POST",
      accessToken: access.session.accessToken,
    });

    if (!upstream.ok) {
      const response = remoteError(upstream.status);

      if (access.renewed && upstream.status !== 401) attachSession(response, access.session);

      return response;
    }
    const response = reply({ message: "Todas las sesiones fueron cerradas." });

    clearSession(response);

    return response;
  } catch {
    return reply({ message: "No se pudo cerrar las sesiones en Identity." }, 503);
  }
}
