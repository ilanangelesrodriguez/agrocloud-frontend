import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { attachSession, sessionFromRequest } from "./cookie-session";
import { identityRequest } from "./gateway";
import { remoteError, reply } from "./route-utils";
import { ensureAccess, fetchIdentityUser } from "./session-service";

export function positiveInteger(value: string) {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

export async function adminIdentity(
  request: NextRequest,
  path: string,
  schema: z.ZodType<object>,
  options: { page?: number; body?: object } = {},
) {
  const saved = sessionFromRequest(request);
  if (!saved) return remoteError(401);

  try {
    const access = await ensureAccess(saved);
    if (!access.ok) return remoteError(access.reason === "expired" ? 401 : 503);

    const finish = (response: NextResponse) => {
      if (access.renewed && response.status !== 401) attachSession(response, access.session);
      return response;
    };

    const accessToken = access.session.accessToken;

    try {
      const identity = await fetchIdentityUser(accessToken);
      if (!identity.ok) return finish(remoteError(identity.status));
      if (identity.user.rol?.codigo !== "SUPERADMIN") return finish(remoteError(403));

      const upstream = await identityRequest(path, {
        accessToken,
        page: options.page,
        method: options.body ? "POST" : "GET",
        body: options.body,
      });
      if (upstream.status === 404) return finish(reply({ message: "Registro no encontrado." }, 404));
      if (upstream.status === 409) {
        return finish(reply({ message: "La solicitud cambió o ya fue decidida. Actualiza el listado." }, 409));
      }
      if (upstream.status === 422) {
        const payload = await upstream.json().catch(() => null);
        const errors: unknown = payload?.errors;
        const firstError = errors && typeof errors === "object"
          ? Object.values(errors).flat().find((value): value is string => typeof value === "string")
          : undefined;

        return finish(reply({ message: firstError ?? "Revisa los datos de la decisión." }, 422));
      }
      if (!upstream.ok) return finish(remoteError(upstream.status));

      const parsed = schema.safeParse(await upstream.json());

      return finish(parsed.success
        ? reply(parsed.data)
        : reply({ message: "Identity devolvió una respuesta inesperada." }, 502));
    } catch {
      return finish(remoteError(503));
    }
  } catch {
    return remoteError(503);
  }
}
