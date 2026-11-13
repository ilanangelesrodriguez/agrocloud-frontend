import type { z } from "zod";

export async function adminRequest<T>(path: string, schema: z.ZodType<T>, options?: RequestInit) {
  const response = await fetch("/api/admin/" + path, { ...options, cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.message === "string" ? payload.message : "No se pudo completar la operación.");
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error("La respuesta del servicio no es válida.");

  return parsed.data;
}
