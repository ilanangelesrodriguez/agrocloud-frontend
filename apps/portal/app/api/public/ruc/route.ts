import type { NextRequest } from "next/server";

import { rucLookupSchema, rucSchema } from "@/features/marketing/ruc/schema";
import { publicReply, requestIdentity } from "@/lib/marketing/api/public-gateway";
import { isAllowedWebOrigin } from "@/lib/marketing/security/origin";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!isAllowedWebOrigin(request)) {
    return publicReply({ message: "Origen de solicitud no permitido." }, 403);
  }

  const type = request.headers.get("content-type") ?? "";

  if (type.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    return publicReply({ message: "Tipo de contenido no admitido." }, 415);
  }

  if (Number(request.headers.get("content-length") ?? "0") > 1024) {
    return publicReply({ message: "La solicitud es demasiado grande." }, 413);
  }

  let body: { ruc?: unknown } | null;

  try {
    const raw = await request.text();

    if (new TextEncoder().encode(raw).length > 1024) {
      return publicReply({ message: "La solicitud es demasiado grande." }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return publicReply({ message: "Los datos recibidos no son válidos." }, 400);
  }

  const ruc = rucSchema.safeParse(body?.ruc);

  if (!ruc.success) {
    return publicReply({ message: "El RUC debe contener exactamente 11 dígitos." }, 422);
  }

  try {
    const response = await requestIdentity("/public/ruc/lookup", { ruc: ruc.data });

    if (!response || response.status === 503) {
      return publicReply({ message: "La consulta RUC está temporalmente indisponible." }, 503);
    }
    if (response.status === 429) {
      return publicReply({ message: "Alcanzaste el límite de consultas. Intenta más tarde." }, 429);
    }
    if (response.status === 422) {
      return publicReply({ message: "Revisa el RUC ingresado." }, 422);
    }
    if (response.ok) {
      const result = rucLookupSchema.safeParse(await response.json());

      if (result.success && result.data.data.ruc === ruc.data) {
        return publicReply(result.data);
      }
    }
  } catch {
    // El formulario permite continuar con los datos ingresados manualmente.
  }

  return publicReply({ message: "No se pudo consultar el RUC en este momento." }, 502);
}
