import type { z } from "zod";
import type { IdentityUser } from "./schemas";

import { NextResponse, type NextRequest } from "next/server";

import { attachSession, sessionFromRequest } from "./cookie-session";
import { identityRequest } from "./gateway";
import { remoteError, reply } from "./route-utils";
import { ensureAccess, fetchIdentityUser } from "./session-service";

export function positiveInteger(value: string) {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

export async function authorizedIdentity(
  request: NextRequest,
  authorize: (user: IdentityUser) => string | null,
  schema: z.ZodType<object> | "image",
  options: Parameters<typeof identityRequest>[1] & { operation?: string } = {},
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
      const path = authorize(identity.user);

      if (!path) return finish(remoteError(403));

      const upstream = await identityRequest(path, {
        ...options,
        accessToken,
        method: options.method ?? (options.body ? "POST" : "GET"),
        body: options.body,
      });

      if (upstream.status === 404)
        return finish(reply({ message: "Registro no encontrado." }, 404));
      if (upstream.status === 409) {
        return finish(
          reply(
            {
              message: path.startsWith("/billing-offers")
                ? "Esta oferta fue modificada por otro administrador. Actualiza la información antes de guardar."
                : path === "/subscription/orders"
                  ? "Ya existe una orden pendiente o la oferta dejó de aplicar a tu suscripción."
                  : "El registro cambió. Actualiza la página antes de continuar.",
            },
            409,
          ),
        );
      }
      if (upstream.status === 422) {
        const payload = await upstream.json().catch(() => null);
        const errors: unknown = payload?.errors;
        const firstError =
          errors && typeof errors === "object"
            ? Object.values(errors)
                .flat()
                .find((value): value is string => typeof value === "string")
            : undefined;

        const message =
          payload?.message === "Producer RUC already exists in this company."
            ? "Ya existe un productor con este RUC en tu empresa."
            : undefined;

        return finish(
          reply(
            {
              message:
                firstError ??
                message ??
                "Identity no permite completar esta operación con los datos o el estado actuales.",
            },
            422,
          ),
        );
      }
      if (!upstream.ok) return finish(remoteError(upstream.status));

      if (schema === "image") {
        const mime = upstream.headers.get("content-type")?.split(";")[0];

        if (!mime || !["image/jpeg", "image/png", "image/webp"].includes(mime) || !upstream.body) {
          return finish(reply({ message: "La imagen recibida no es válida." }, 502));
        }

        return finish(
          new NextResponse(upstream.body, {
            headers: {
              "Content-Type": mime,
              "Cache-Control": "no-store",
              "X-Content-Type-Options": "nosniff",
            },
          }),
        );
      }

      const parsed = schema.safeParse(await upstream.json().catch(() => null));

      if (!parsed.success) {
        // eslint-disable-next-line no-console -- Registra solo códigos y rutas del contrato en el servidor.
        console.warn("Contrato del servicio inesperado", {
          service: options.service ?? "identity",
          operation: options.operation ?? "admin",
          issues: parsed.error.issues.map(({ code, path }) => ({ code, path })),
        });
      }

      return finish(
        parsed.success
          ? reply(parsed.data, upstream.status)
          : reply(
              {
                message:
                  options.service === "agricultural"
                    ? "Agricultural devolvió una respuesta inesperada."
                    : "Identity devolvió una respuesta inesperada.",
              },
              502,
            ),
      );
    } catch {
      return finish(reply({ message: "No se pudo conectar con el Gateway." }, 502));
    }
  } catch {
    return remoteError(503);
  }
}
