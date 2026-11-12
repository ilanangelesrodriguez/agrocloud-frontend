import type { NextRequest } from "next/server";

import { accessRequestReferenceSchema, accessRequestSchema } from "@/features/access-requests/schema";
import { publicReply, requestIdentity } from "@/lib/api/public-gateway";
import { getPrivacyVersion } from "@/lib/privacy-version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 12_000;

function reply(message: string, status: number) {
  return publicReply({ message }, status);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return reply("Origen de solicitud no permitido.", 403);
  const type = request.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("application/json"))
    return reply("Tipo de contenido no admitido.", 415);
  const length = Number(request.headers.get("content-length") || "0");
  if (length > MAX_BYTES) return reply("La solicitud es demasiado grande.", 413);

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BYTES)
      return reply("La solicitud es demasiado grande.", 413);
    body = JSON.parse(raw);
  } catch {
    return reply("Los datos recibidos no son válidos.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return reply("Los datos recibidos no son válidos.", 400);
  const values = body as Record<string, unknown>;
  // Se rechaza silenciosamente el campo señuelo para no informar al robot.
  if (typeof values.website === "string" && values.website.trim()) {
    return publicReply({ message: "Solicitud recibida." }, 201);
  }
  const parsed = accessRequestSchema.safeParse(values);
  if (!parsed.success) return reply("Revisa los datos del formulario y vuelve a intentarlo.", 422);

  const privacyVersion = getPrivacyVersion();
  if (!privacyVersion) {
    return reply("El aviso de privacidad no está disponible en este momento.", 503);
  }
  if (parsed.data.privacy_version !== privacyVersion) {
    return reply("El aviso de privacidad cambió. Recarga el formulario y revísalo nuevamente.", 422);
  }

  try {
    const response = await requestIdentity("/access-requests", parsed.data);
    if (!response) return reply("El servicio de solicitudes no está configurado.", 503);
    if (response.status === 201 || response.status === 200) {
      const payload = await response.json().catch(() => null);
      const reference = accessRequestReferenceSchema.safeParse(payload?.reference);

      return publicReply(
        reference.success
          ? { message: "Solicitud registrada para revisión.", reference: reference.data }
          : { message: "Solicitud registrada. No se recibió una referencia." },
        201,
      );
    }
    if (response.status === 422 || response.status === 409)
      return reply(
        "Verifica el RUC y el correo. Es posible que la empresa ya tenga una solicitud o cuenta.",
        422,
      );
    if (response.status === 429)
      return reply("Se alcanzó el límite de solicitudes. Intenta nuevamente más tarde.", 429);
    if (response.status === 503)
      return reply("El servicio de solicitudes no está disponible en este momento.", 503);
    return reply("No fue posible registrar la solicitud. Inténtalo nuevamente más tarde.", 502);
  } catch {
    return reply("No fue posible conectar con el servicio de solicitudes.", 502);
  }
}
