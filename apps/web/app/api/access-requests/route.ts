import { NextRequest, NextResponse } from "next/server";
import { accessRequestSchema } from "@/features/access-requests/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 12_000;
const PATH = "/api/v1/identity/access-requests";

function reply(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
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
    return NextResponse.json(
      { message: "Solicitud recibida." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  }
  const parsed = accessRequestSchema.safeParse(values);
  if (!parsed.success) return reply("Revisa los datos del formulario y vuelve a intentarlo.", 422);

  const base = process.env.AGROCLOUD_GATEWAY_URL;
  if (!base)
    return reply("El servicio de solicitudes no está configurado. Inténtalo más tarde.", 503);
  let endpoint: URL;
  try {
    const url = new URL(base);
    if (!["https:", "http:"].includes(url.protocol)) throw new Error("Invalid protocol");
    endpoint = new URL(url.origin + PATH);
  } catch {
    return reply("La configuración del servicio no está disponible.", 503);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 201 || response.status === 200)
      return reply("Solicitud registrada para revisión.", 201);
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
