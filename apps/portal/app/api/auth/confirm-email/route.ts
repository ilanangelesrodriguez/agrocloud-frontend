import type { NextRequest } from "next/server";

import { clearSession } from "@/lib/auth/cookie-session";
import { identityRequest } from "@/lib/auth/gateway";
import { confirmEmailSchema } from "@/lib/auth/schemas";
import { parseJson, remoteError, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await parseJson(request);
  if (!body.ok) return body.response;
  const parsed = confirmEmailSchema.safeParse(body.body);
  if (!parsed.success) return reply({ message: "Enlace de confirmación incorrecto." }, 422);
  try {
    const upstream = await identityRequest("/auth/confirm-email", {
      method: "POST", body: parsed.data,
    });
    if (!upstream.ok) return remoteError(upstream.status);
    const response = reply({ message: "Correo confirmado. Inicia sesión con el nuevo correo." });
    clearSession(response);
    return response;
  } catch {
    return reply({ message: "No se pudo confirmar el cambio de correo." }, 503);
  }
}
