export async function fetchPublicJson(path: string, options: RequestInit = {}): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(path, { ...options, cache: "no-store" });
  } catch {
    throw new Error("No se pudo conectar con el servicio. Intenta más tarde.");
  }
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof payload?.message === "string" ? payload.message : "El servicio no está disponible.",
    );
  }

  return payload;
}
