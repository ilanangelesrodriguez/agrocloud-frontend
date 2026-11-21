import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function reply(data: object, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function remoteError(status: number): NextResponse {
  if (status === 401) return reply({ message: "La sesión no es válida o ha expirado." }, 401);
  if (status === 403) return reply({ message: "No tienes permisos para esta operación." }, 403);
  if (status === 410) return reply({ message: "El enlace ha expirado o ya fue utilizado." }, 410);
  if (status === 422)
    return reply({ message: "Revisa los datos ingresados o la vigencia del enlace." }, 422);
  if (status === 429) return reply({ message: "Demasiados intentos. Intenta más tarde." }, 429);
  if (status === 503 || status >= 500)
    return reply({ message: "El servicio no está disponible. Intenta más tarde." }, 503);

  return reply({ message: "No fue posible completar la operación." }, 400);
}

/** Require same-origin JSON writes; reject oversized bodies and malformed payloads. */
export async function parseJson(
  request: NextRequest,
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  if (
    request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json"
  ) {
    return { ok: false, response: reply({ message: "Solo se permite JSON." }, 415) };
  }
  if (!isAllowedOrigin(request)) {
    return {
      ok: false,
      response: reply({ message: "Origen no permitido." }, 403),
    };
  }
  if (Number(request.headers.get("content-length") ?? "0") > 12_000) {
    return { ok: false, response: reply({ message: "Solicitud demasiado grande." }, 413) };
  }
  try {
    const raw = await request.text();

    if (new TextEncoder().encode(raw).length > 12_000) {
      return { ok: false, response: reply({ message: "Solicitud demasiado grande." }, 413) };
    }

    return { ok: true, body: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, response: reply({ message: "Solicitud inválida." }, 400) };
  }
}

export function validatePost(request: NextRequest): NextResponse | null {
  return isAllowedOrigin(request) ? null : reply({ message: "Origen no permitido." }, 403);
}

export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return true;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}
