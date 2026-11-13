import type { NextRequest } from "next/server";

import { attachSession, sessionFromRequest } from "@/lib/auth/cookie-session";
import { identityRequest } from "@/lib/auth/gateway";
import { changeEmailSchema } from "@/lib/auth/schemas";
import { ensureAccess } from "@/lib/auth/session-service";
import { parseJson, remoteError, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await parseJson(request);

  if (!body.ok) return body.response;
  const parsed = changeEmailSchema.safeParse(body.body);

  if (!parsed.success)
    return reply({ message: "Introduce tu nuevo correo y contraseña actual." }, 422);
  const saved = sessionFromRequest(request);

  if (!saved) return reply({ message: "Debes iniciar sesión." }, 401);
  try {
    const access = await ensureAccess(saved);

    if (!access.ok) return reply({ message: "Debes iniciar sesión." }, 401);
    const upstream = await identityRequest("/auth/change-email", {
      method: "POST",
      accessToken: access.session.accessToken,
      body: { ...parsed.data, correo: parsed.data.correo.trim().toLowerCase() },
    });

    if (!upstream.ok) {
      const response = remoteError(upstream.status);

      if (access.renewed && upstream.status !== 401) attachSession(response, access.session);

      return response;
    }
    const response = reply({ message: "Se enviará un enlace de confirmación al nuevo correo." });

    if (access.renewed) attachSession(response, access.session);

    return response;
  } catch {
    return reply({ message: "No se pudo solicitar el cambio de correo." }, 503);
  }
}
