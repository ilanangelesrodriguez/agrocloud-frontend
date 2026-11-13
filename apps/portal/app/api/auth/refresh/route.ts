import type { NextRequest } from "next/server";

import { attachSession, clearSession, sessionFromRequest } from "@/lib/auth/cookie-session";
import { renewSession } from "@/lib/auth/session-service";
import { reply, validatePost } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const forbidden = validatePost(request);
  if (forbidden) return forbidden;
  const saved = sessionFromRequest(request);
  if (!saved) return reply({ message: "Debes iniciar sesión." }, 401);
  try {
    const renewed = await renewSession(saved);
    if (!renewed) {
      const response = reply({ message: "La sesión ha expirado." }, 401);
      clearSession(response);
      return response;
    }
    const response = reply({ message: "Sesión renovada." });
    attachSession(response, renewed);
    return response;
  } catch {
    return reply({ message: "No se pudo renovar la sesión por un error temporal." }, 503);
  }
}
