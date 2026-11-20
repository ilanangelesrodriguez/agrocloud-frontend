import type { z } from "zod";

export type BffScope = "admin" | "company" | "agricultural" | "notifications" | "ai";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Cliente único BFF: valida la respuesta y propaga el error del servicio. */
export async function bffRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options?: RequestInit,
  scope: BffScope = "admin",
): Promise<T> {
  const response = await fetch("/api/" + scope + "/" + path, {
    ...options,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      typeof payload?.message === "string" ? payload.message : "No se pudo completar la operación.",
      response.status,
    );
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error("La respuesta del servicio no es válida.");
  return parsed.data;
}
