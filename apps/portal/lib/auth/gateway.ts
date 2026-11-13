/** All calls go through the gateway; credentials are never exposed to the browser. */
export async function identityRequest(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT";
    body?: unknown;
    accessToken?: string;
    page?: number;
    service?: "identity" | "agricultural";
    catalogType?: "producto" | "variedad" | "unidad";
    idempotencyKey?: string;
  } = {},
): Promise<Response> {
  const configured = process.env.AGROCLOUD_GATEWAY_URL;

  if (!configured) throw new Error("AGROCLOUD_GATEWAY_URL no está configurada.");
  const base = new URL(configured);

  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  ) {
    throw new Error("AGROCLOUD_GATEWAY_URL es inválida.");
  }
  if (!/^\/[a-zA-Z0-9/-]+$/.test(path) || path.includes("//") || path.includes("..")) {
    throw new Error("Ruta de Identity no autorizada.");
  }
  const url = new URL(`/api/v1/${options.service ?? "identity"}${path}`, base.origin);

  if (options.page !== undefined) url.searchParams.set("page", String(options.page));
  if (options.catalogType) url.searchParams.set("tipo", options.catalogType);
  const multipart = options.body instanceof FormData ? options.body : undefined;

  return fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      ...(options.body !== undefined && !multipart ? { "Content-Type": "application/json" } : {}),
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
    body: multipart ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
    redirect: "error",
  });
}
