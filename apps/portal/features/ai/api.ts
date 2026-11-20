import type { z } from "zod";
import { bffRequest } from "@/lib/api/bff-client";
export type AiFilters = {
  days?: number;
  model_id?: string;
  status?: string;
  offset?: number;
  limit?: number;
  version?: number;
};
export type CompanyAiFilters = {
  from?: string;
  to?: string;
  model_id?: string;
  producto?: string;
  variedad?: string;
  producer_id?: string;
};
export function fetchAi<T>(
  path: string,
  schema: z.ZodType<T>,
  filter: AiFilters = {},
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter))
    if (value !== undefined && value !== "") params.set(key, String(value));
  return bffRequest(`${path}?${params}`, schema, { signal }, "ai");
}
export function fetchCompanyAi<T>(
  section: string,
  schema: z.ZodType<T>,
  filter: CompanyAiFilters,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) if (value) params.set(key, value);
  return bffRequest(`reports/ai/${section}?${params}`, schema, { signal }, "agricultural");
}
