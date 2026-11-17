import type { NextRequest } from "next/server";

export function isAllowedWebOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) return true;

  const configured = process.env.WEB_PUBLIC_ORIGIN;

  if (!configured) {
    return process.env.NODE_ENV !== "production" && origin === request.nextUrl.origin;
  }

  try {
    const expected = new URL(configured);

    if (process.env.NODE_ENV === "production" && expected.protocol !== "https:") {
      return false;
    }

    return origin === expected.origin;
  } catch {
    return false;
  }
}
