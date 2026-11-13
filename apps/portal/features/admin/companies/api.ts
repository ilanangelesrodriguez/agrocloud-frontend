import { bffRequest } from "@/lib/api/bff-client";
import { companyPageSchema, companyResponseSchema } from "./schema";

export function listCompanies(page: number, signal?: AbortSignal) {
  return bffRequest("companies?page=" + page, companyPageSchema, { signal });
}
export function getCompany(id: string, signal?: AbortSignal) {
  return bffRequest("companies/" + encodeURIComponent(id), companyResponseSchema, { signal });
}
