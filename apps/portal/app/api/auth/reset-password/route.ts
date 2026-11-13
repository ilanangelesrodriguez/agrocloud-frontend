import type { NextRequest } from "next/server";

import { clearSession } from "@/lib/auth/cookie-session";
import { identityRequest } from "@/lib/auth/gateway";
import { resetSchema } from "@/lib/auth/schemas";
import { parseJson, remoteError, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await parseJson(request);

  if (!body.ok) return body.response;
  const parsed = resetSchema.safeParse(body.body);

  if (!parsed.success) return reply({ message: "Revisa los datos y la nueva contraseña." }, 422);
  try {
    const upstream = await identityRequest("/auth/reset-password", {
      method: "POST",
      body: { ...parsed.data, correo: parsed.data.correo.trim().toLowerCase() },
    });

    if (!upstream.ok) return remoteError(upstream.status);
    const response = reply({ message: "Contraseña actualizada. Inicia sesión nuevamente." });

    clearSession(response);

    return response;
  } catch {
    return reply({ message: "No se pudo contactar con el servicio." }, 503);
  }
}
