import { bffRequest } from "@/lib/api/bff-client";
import { permissionsSchema, rolesSchema } from "./schema";

export function getCompanyRoles(signal?: AbortSignal) {
  return bffRequest("roles", rolesSchema, { signal }, "company");
}
export function getCompanyPermissions(signal?: AbortSignal) {
  return bffRequest("permissions", permissionsSchema, { signal }, "company");
}
