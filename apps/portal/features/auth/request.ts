export class AuthRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AuthRequestError";
  }
}

/** Requests go to same-origin BFF only, never directly to Identity. */
export async function authRequest(path: string, options: RequestInit = {}): Promise<unknown> {
  if (!path.startsWith("/api/auth/")) throw new Error("Ruta no autorizada.");
  let response: Response;
  try {
    response = await fetch(path, { ...options, cache: "no-store", credentials: "same-origin" });
  } catch {
    throw new AuthRequestError("No hay conexión con el servicio. Intenta nuevamente.", 0);
  }
  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = json && typeof json === "object" && "message" in json && typeof json.message === "string"
      ? json.message : "No se pudo completar la operación.";
    throw new AuthRequestError(message, response.status);
  }
  return json;
}

export function postAuth(path: string, body: unknown = {}): Promise<unknown> {
  return authRequest(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
