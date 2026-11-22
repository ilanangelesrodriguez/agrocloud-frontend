import type { NextRequest } from "next/server";

import { identityRequest } from "@/lib/auth/gateway";
import { activationSchema, onboardingSchema } from "@/lib/auth/schemas";
import { parseJson, remoteError, reply } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await parseJson(request);

  if (!body.ok) return body.response;
  const parsed = activationSchema.safeParse(body.body);

  if (!parsed.success)
    return reply({ message: "Revisa la contraseña y el enlace de invitación." }, 422);
  try {
    const upstream = await identityRequest("/auth/activate", {
      method: "POST",
      body: parsed.data,
    });

    if (!upstream.ok) return remoteError(upstream.status);

    const json: unknown = await upstream.json().catch(() => null);
    const onboarding = onboardingSchema.safeParse(
      json && typeof json === "object" && "onboarding" in json ? json.onboarding : undefined,
    );
    return reply({
      message: "Cuenta activada. Ya puedes iniciar sesión.",
      ...(onboarding.success ? { onboarding: onboarding.data } : {}),
    });
  } catch {
    return reply({ message: "No se pudo contactar con el servicio." }, 503);
  }
}
