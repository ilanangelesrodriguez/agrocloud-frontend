import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "agrocloud_portal_session";
const AAD = Buffer.from("agrocloud-portal-auth:v1");
const MAX_COOKIE_CHARS = 3800;

export interface PortalSession {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  sessionExpiresAt: number;
}

function key(): Buffer {
  const secret = process.env.AUTH_COOKIE_SECRET?.trim() ?? "";
  const decoded = Buffer.from(secret, "base64");
  if (decoded.length !== 32 || decoded.toString("base64") !== secret) {
    throw new Error("Configura AUTH_COOKIE_SECRET como 32 bytes codificados en base64.");
  }
  return decoded;
}

function seal(value: PortalSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(AAD);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const result = Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
  if (result.length > MAX_COOKIE_CHARS) throw new Error("La sesión supera el tamaño admitido de cookie.");
  return result;
}

export function unseal(raw: string | undefined): PortalSession | null {
  if (!raw || raw.length > MAX_COOKIE_CHARS) return null;
  try {
    const packed = Buffer.from(raw, "base64url");
    if (packed.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), packed.subarray(0, 12));
    decipher.setAAD(AAD);
    decipher.setAuthTag(packed.subarray(12, 28));
    const value: unknown = JSON.parse(Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString("utf8"));
    if (!value || typeof value !== "object") return null;
    const session = value as Partial<PortalSession>;
    if (typeof session.accessToken !== "string" || typeof session.refreshToken !== "string" ||
      !Number.isFinite(session.accessExpiresAt) || !Number.isFinite(session.sessionExpiresAt) ||
      (session.sessionExpiresAt ?? 0) <= Date.now()) return null;
    return session as PortalSession;
  } catch {
    return null;
  }
}

export function sessionFromRequest(request: NextRequest): PortalSession | null {
  return unseal(request.cookies.get(SESSION_COOKIE)?.value);
}

export function attachSession(response: NextResponse, session: PortalSession): void {
  response.cookies.set(SESSION_COOKIE, seal(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, Math.floor((session.sessionExpiresAt - Date.now()) / 1000)),
  });
  response.headers.set("Cache-Control", "no-store");
}

export function clearSession(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
}

/** Bound the encrypted cookie lifetime; actual session validity is decided by Identity. */
export function newSession(accessToken: string, refreshToken: string, expiresIn: number): PortalSession {
  const days = Number(process.env.AUTH_SESSION_MAX_AGE_DAYS || "14");
  if (!Number.isInteger(days) || days < 1 || days > 90) {
    throw new Error("AUTH_SESSION_MAX_AGE_DAYS debe estar entre 1 y 90.");
  }
  return {
    accessToken, refreshToken,
    accessExpiresAt: Date.now() + expiresIn * 1000,
    sessionExpiresAt: Date.now() + days * 86_400_000,
  };
}
