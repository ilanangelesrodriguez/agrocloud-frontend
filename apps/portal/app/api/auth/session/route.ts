import type { NextRequest } from "next/server";

import { attachSession, clearSession, sessionFromRequest } from "@/lib/auth/cookie-session";
import { ensureAccess, fetchIdentityUser } from "@/lib/auth/session-service";
import { remoteError, reply } from "@/lib/auth/route-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const saved = sessionFromRequest(request);
  if (!saved) return reply({ message: "Debes iniciar sesión." }, 401);
  try {
    const access = await ensureAccess(saved);
    if (!access.ok) {
      const response = reply({ message: "Tu sesión expiró. Vuelve a ingresar." }, 401);
      clearSession(response);
      return response;
    }
    const me = await fetchIdentityUser(access.session.accessToken);
    if (!me.ok) {
      const response = remoteError(me.status);
      if (me.status === 401) clearSession(response);
      else if (access.renewed) attachSession(response, access.session);
      return response;
    }
    const response = reply({ user: me.user });
    if (access.renewed) attachSession(response, access.session);
    return response;
  } catch {
    return reply({ message: "No se pudo consultar la sesión. Intenta nuevamente." }, 503);
  }
}
