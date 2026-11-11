import { ApiError } from "./errors";

export interface ApiClientOptions {
  /** Gateway base URL. Example: http://localhost:4000 */
  baseUrl: string;
  /** Provide the current token from a trusted server session, not localStorage. */
  getAccessToken?: () => string | null | Promise<string | null>;
  fetcher?: typeof fetch;
}

export type ApiRequestOptions = RequestInit;

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetcher = options.fetcher ?? fetch;

  if (!/^https?:\/\//.test(baseUrl)) {
    throw new Error("API baseUrl must be an absolute http(s) URL");
  }

  async function request<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
    // Disallow absolute URLs: this client must only communicate with the configured Gateway.
    if (!path.startsWith("/") || path.startsWith("//") || /^(?:https?:)?\/\//i.test(path)) {
      throw new Error("API path must be an absolute path starting with a single /");
    }

    const headers = new Headers(init.headers);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    const accessToken = await options.getAccessToken?.();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: init.cache ?? "no-store",
    });
    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get("content-type") ?? "";
    const payload: unknown = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
      const err = body.error && typeof body.error === "object"
        ? (body.error as Record<string, unknown>)
        : {};
      const message = typeof err.message === "string"
        ? err.message
        : `HTTP ${response.status}: ${response.statusText}`;
      const code = typeof err.code === "string" ? err.code : undefined;
      throw new ApiError(message, response.status, code, payload);
    }
    return payload as T;
  }

  return {
    request,
    get: (path, options) => request(path, { ...options, method: "GET" }),
  };
}
