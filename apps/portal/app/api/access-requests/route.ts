import type { NextRequest } from "next/server";

import {
  accessRequestReferenceSchema,
  accessRequestSchema,
  accessRequestSelectionSchema,
} from "@/features/marketing/access-requests/schema";
import { publicReply, requestIdentity } from "@/lib/marketing/api/public-gateway";
import { isPublicOnboardingEnabled } from "@/lib/marketing/onboarding";
import { getPrivacyVersion } from "@/lib/marketing/privacy-version";
import { isAllowedWebOrigin } from "@/lib/marketing/security/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 12_000;

function reply(message: string, status: number) {
  return publicReply({ message }, status);
}

function validationMessage(errors: unknown): string {
  if (!errors || typeof errors !== "object") {
    return "Revisa el RUC y los datos del formulario. Es posible que ya exista una solicitud.";
  }

  const fields = errors as Record<string, unknown>;

  if (fields.privacy_version || fields.privacy_accepted) {
    return "El aviso de privacidad cambió. Recarga la página y vuelve a revisarlo.";
  }
  if (fields.selected_offer_key)
    return "El plan elegido ya no está disponible. Selecciona una oferta vigente o comienza con el plan gratuito.";
  if (fields.ruc || fields.correo) {
    return "Revisa el RUC y el correo. Puede existir una solicitud o una cuenta registrada.";
  }

  return "Revisa los datos ingresados en el formulario.";
}

export async function POST(request: NextRequest) {
  if (!isPublicOnboardingEnabled()) {
    return reply("La recepción de solicitudes está temporalmente deshabilitada.", 503);
  }

  if (!isAllowedWebOrigin(request)) {
    return reply("Origen de solicitud no permitido.", 403);
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    return reply("Tipo de contenido no admitido.", 415);
  }

  if (Number(request.headers.get("content-length") || "0") > MAX_BYTES) {
    return reply("La solicitud es demasiado grande.", 413);
  }

  let body: unknown;

  try {
    const raw = await request.text();

    if (new TextEncoder().encode(raw).length > MAX_BYTES) {
      return reply("La solicitud es demasiado grande.", 413);
    }

    body = JSON.parse(raw);
  } catch {
    return reply("Los datos recibidos no son válidos.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply("Los datos recibidos no son válidos.", 400);
  }

  const fields = body as Record<string, unknown>;

  // Honeypot: no se envía nada a Identity y no se exponen detalles al robot.
  if (typeof fields.website === "string" && fields.website.trim()) {
    return publicReply({ message: "Solicitud recibida." }, 201);
  }

  const parsed = accessRequestSchema.safeParse(fields);

  if (!parsed.success) {
    return reply("Revisa los datos del formulario y vuelve a intentarlo.", 422);
  }

  const privacyVersion = getPrivacyVersion();

  if (!privacyVersion) {
    return reply("El aviso de privacidad no está disponible en este momento.", 503);
  }

  if (parsed.data.privacy_version !== privacyVersion) {
    return reply("El aviso de privacidad cambió. Recarga el formulario.", 422);
  }

  try {
    const response = await requestIdentity("/access-requests", parsed.data);

    if (!response) return reply("El servicio de solicitudes no está configurado.", 503);

    if (response.status === 201 || response.status === 200) {
      const json: unknown = await response.json().catch(() => null);
      const payload = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
      const reference = accessRequestReferenceSchema.safeParse(payload.reference);
      const selection = accessRequestSelectionSchema.safeParse(payload.selection);

      if (!reference.success) {
        // No provocar un segundo registro con un retry: Identity puede haber guardado la solicitud.
        console.error("Identity: solicitud aceptada sin UUID de referencia válido", {
          status: response.status,
          requestId: response.headers.get("x-request-id") ?? "unknown",
        });
      }

      return publicReply(
        reference.success
          ? {
              message: "Solicitud registrada para revisión.",
              reference: reference.data,
              ...(selection.success ? { selection: selection.data } : {}),
            }
          : { message: "Solicitud recibida para revisión; no se obtuvo un comprobante." },
        201,
      );
    }

    if (response.status === 422 || response.status === 409) {
      const json: unknown = await response.json().catch(() => null);
      const payload = json && typeof json === "object" ? (json as Record<string, unknown>) : {};

      return reply(validationMessage(payload.errors), 422);
    }
    if (response.status === 429) {
      return reply("Se alcanzó el límite de solicitudes. Intenta más tarde.", 429);
    }
    if (response.status === 503) {
      return reply("El servicio de solicitudes está temporalmente indisponible.", 503);
    }

    console.error("Identity: respuesta inesperada en solicitudes", {
      status: response.status,
      requestId: response.headers.get("x-request-id") ?? "unknown",
    });

    return reply("No fue posible registrar la solicitud. Inténtalo más tarde.", 502);
  } catch {
    return reply("No fue posible conectar con el servicio de solicitudes.", 502);
  }
}
