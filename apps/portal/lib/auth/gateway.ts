/** All calls go through the gateway; credentials are never exposed to the browser. */
export async function identityRequest(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT";
    body?: unknown;
    accessToken?: string;
    page?: number;
    service?: "identity" | "agricultural" | "notifications" | "ai";
    aiQuery?: {
      days?: number;
      model_id?: string;
      status?: string;
      offset?: number;
      limit?: number;
      version?: number;
    };
    notificationQuery?: { limit: number; cursor?: string; unread?: boolean };
    agriculturalStatus?: string;
    decisionStatus?: "PENDING" | "OBSERVED" | "COMPLETED";
    procedureFilter?: { producto?: string; producto_id?: number; activo?: boolean };
    reportFilter?: {
      from?: string;
      to?: string;
      producto?: string;
      variedad?: string;
      producer_id?: string;
      model_id?: string;
    };
    catalogType?:
      "producto" | "variedad" | "unidad" | "metodo" | "defecto" | "categoria" | "motivo";
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
  if (
    (path !== "/" && !/^\/[a-zA-Z0-9/-]+$/.test(path)) ||
    path.includes("//") ||
    path.includes("..")
  ) {
    throw new Error("Ruta de Identity no autorizada.");
  }
  const url = new URL(`/api/v1/${options.service ?? "identity"}${path}`, base.origin);

  if (options.page !== undefined) url.searchParams.set("page", String(options.page));
  if (options.agriculturalStatus) url.searchParams.set("estado", options.agriculturalStatus);
  if (options.decisionStatus) url.searchParams.set("decision_status", options.decisionStatus);
  if (options.procedureFilter?.producto_id)
    url.searchParams.set("producto_id", String(options.procedureFilter.producto_id));
  if (options.procedureFilter?.producto)
    url.searchParams.set("producto", options.procedureFilter.producto);
  if (options.procedureFilter?.activo !== undefined)
    url.searchParams.set("activo", String(options.procedureFilter.activo));
  if (options.reportFilter)
    for (const [key, value] of Object.entries(options.reportFilter)) {
      if (value) url.searchParams.set(key, value);
    }
  if (options.catalogType) url.searchParams.set("tipo", options.catalogType);
  if (options.notificationQuery) {
    url.searchParams.set("limit", String(options.notificationQuery.limit));
    if (options.notificationQuery.cursor)
      url.searchParams.set("cursor", options.notificationQuery.cursor);
    if (options.notificationQuery.unread !== undefined)
      url.searchParams.set("unread", String(options.notificationQuery.unread));
  }
  if (options.aiQuery)
    for (const [name, value] of Object.entries(options.aiQuery)) {
      if (value !== undefined && value !== "") url.searchParams.set(name, String(value));
    }
  if (
    options.service === "ai" &&
    (!process.env.AI_SERVICE_API_KEY || (options.method && options.method !== "GET"))
  )
    throw new Error("Configura la integración privada de IA.");
  const multipart = options.body instanceof FormData ? options.body : undefined;

  return fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.service === "ai" ? { "X-API-Key": process.env.AI_SERVICE_API_KEY! } : {}),
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      ...(options.body !== undefined && !multipart ? { "Content-Type": "application/json" } : {}),
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
    body: multipart ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    signal: AbortSignal.timeout(
      (options.service === undefined || options.service === "identity") &&
        options.method === "POST" &&
        /^\/subscription\/orders\/AGRO-[0-9A-HJKMNP-TV-Z]{26}\/(charge|complete-3ds)$/.test(path)
        ? 50_000
        : 15_000,
    ),
    cache: "no-store",
    redirect: "error",
  });
}
