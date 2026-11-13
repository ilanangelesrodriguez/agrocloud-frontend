import type { NextRequest } from "next/server";

import { identityRequest } from "@/lib/auth/gateway";
import { attachSession, newSession } from "@/lib/auth/cookie-session";
import { loginSchema, identityTokenSchema, homeForUser } from "@/lib/auth/schemas";
import { fetchIdentityUser } from "@/lib/auth/session-service";
import { parseJson, remoteError, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const parsedBody = await parseJson(request);

  if (!parsedBody.ok) return parsedBody.response;
  const parsed = loginSchema.safeParse(parsedBody.body);

  if (!parsed.success) return reply({ message: "Verifica tu correo y contraseña." }, 422);

  try {
    const response = await identityRequest("/auth/login", {
      method: "POST",
      body: { ...parsed.data, correo: parsed.data.correo.trim().toLowerCase() },
    });

    if (!response.ok) {
      return response.status === 422 || response.status === 401
        ? reply({ message: "Credenciales incorrectas o cuenta no disponible." }, 401)
        : remoteError(response.status);
    }
    const pair = identityTokenSchema.safeParse(await response.json());

    if (!pair.success)
      return reply({ message: "Respuesta inesperada del servicio de identidad." }, 502);
    const current = await fetchIdentityUser(pair.data.access_token);

    if (!current.ok) return remoteError(current.status);
    const result = reply({ user: current.user, redirectTo: homeForUser(current.user) });

    attachSession(
      result,
      newSession(pair.data.access_token, pair.data.refresh_token, pair.data.expires_in),
    );

    return result;
  } catch {
    return reply({ message: "No se pudo conectar con el servicio de acceso." }, 503);
  }
}
