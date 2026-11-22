import type { AccessRequestPayload } from "./schema";

export type RequestSelection = { type: "FREE" | "PAID"; name: string };
type ApiResponse = { message?: string; reference?: string; selection?: RequestSelection };

export class AccessRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AccessRequestError";
  }
}

export async function sendAccessRequest(
  data: AccessRequestPayload & { website?: string },
): Promise<ApiResponse> {
  let response: Response;

  try {
    response = await fetch("/api/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new AccessRequestError(
      "No se pudo conectar con el servicio. Inténtalo nuevamente más tarde.",
      0,
    );
  }

  const payload: ApiResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AccessRequestError(
      payload.message ?? "No se pudo registrar la solicitud. Verifica los datos.",
      response.status,
    );
  }

  return payload;
}
