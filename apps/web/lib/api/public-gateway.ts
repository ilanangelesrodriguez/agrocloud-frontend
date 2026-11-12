import { NextResponse } from "next/server";

export function publicReply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function requestIdentity(path: string, body?: object): Promise<Response | undefined> {
  let endpoint: URL;

  try {
    const base = new URL(process.env.AGROCLOUD_GATEWAY_URL ?? "");
    if (!["https:", "http:"].includes(base.protocol)) return;
    endpoint = new URL("/api/v1/identity" + path, base.origin);
  } catch {
    return;
  }

  return fetch(endpoint, {
    method: body ? "POST" : "GET",
    headers: body
      ? { Accept: "application/json", "Content-Type": "application/json" }
      : { Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
}
