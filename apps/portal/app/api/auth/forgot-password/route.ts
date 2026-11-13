import type { NextRequest } from "next/server";

import { identityRequest } from "@/lib/auth/gateway";
import { forgotSchema } from "@/lib/auth/schemas";
import { parseJson, remoteError, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await parseJson(request);
  if (!body.ok) return body.response;
  const parsed = forgotSchema.safeParse(body.body);
  if (!parsed.success) return reply({ message: "Introduce un correo válido." }, 422);
  try {
    const upstream = await identityRequest("/auth/forgot-password", {
      method: "POST", body: { correo: parsed.data.correo.trim().toLowerCase() },
    });
    if (!upstream.ok) return remoteError(upstream.status);
    return reply({ message: "Si la cuenta reúne las condiciones, recibirá un enlace de recuperación." });
  } catch {
    return reply({ message: "No se pudo contactar con el servicio." }, 503);
  }
}
