import type { IdentityUser } from "./schemas";
import type { PortalSession } from "./cookie-session";

import { createHash } from "node:crypto";

import { identityRequest } from "./gateway";
import { identityTokenSchema, identityUserSchema } from "./schemas";

/**
 * Best-effort per-process coalescing. For multi-instance production deployments,
 * use a shared distributed session/refresh coordinator before scaling horizontally.
 */
const inFlight = new Map<string, { promise: Promise<PortalSession | null>; until: number }>();
const RECENT_MS = 12_000;

export async function renewSession(session: PortalSession): Promise<PortalSession | null> {
  const cacheKey = createHash("sha256").update(session.refreshToken).digest("hex");
  const now = Date.now();

  for (const [k, v] of inFlight) if (v.until < now) inFlight.delete(k);
  const existing = inFlight.get(cacheKey);

  if (existing && existing.until >= now) return existing.promise;
  const pending = (async () => {
    const response = await identityRequest("/auth/refresh", {
      method: "POST",
      body: { refresh_token: session.refreshToken },
    });

    if (response.status === 401 || response.status === 422) return null;
    if (!response.ok) throw new Error("Identity temporalmente indisponible.");
    const parsed = identityTokenSchema.safeParse(await response.json());

    if (!parsed.success) throw new Error("Respuesta de renovación incorrecta.");

    return {
      accessToken: parsed.data.access_token,
      refreshToken: parsed.data.refresh_token,
      accessExpiresAt: Date.now() + parsed.data.expires_in * 1000,
      sessionExpiresAt: session.sessionExpiresAt,
    };
  })();

  if (inFlight.size >= 256) inFlight.clear();
  inFlight.set(cacheKey, { promise: pending, until: now + RECENT_MS });
  try {
    return await pending;
  } catch (error) {
    inFlight.delete(cacheKey);
    throw error;
  }
}

export type SessionStatus =
  | { ok: true; session: PortalSession; renewed: boolean }
  | { ok: false; reason: "expired" | "unavailable" };

export async function ensureAccess(session: PortalSession): Promise<SessionStatus> {
  if (Date.now() >= session.sessionExpiresAt) return { ok: false, reason: "expired" };
  if (session.accessExpiresAt > Date.now() + 45_000) return { ok: true, session, renewed: false };
  const renewed = await renewSession(session);

  return renewed ? { ok: true, session: renewed, renewed: true } : { ok: false, reason: "expired" };
}

export async function fetchIdentityUser(
  accessToken: string,
): Promise<{ ok: true; user: IdentityUser } | { ok: false; status: number }> {
  const response = await identityRequest("/auth/me", { accessToken });

  if (!response.ok) return { ok: false, status: response.status };
  const json: unknown = await response.json();
  const parsed = identityUserSchema.safeParse((json as { data?: unknown })?.data);

  if (!parsed.success) return { ok: false, status: 502 };

  return { ok: true, user: parsed.data };
}
