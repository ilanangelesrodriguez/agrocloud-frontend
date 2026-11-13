"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserScope } from "./policy";
import { getUser, listUsers } from "./api";
import { bffRequest } from "@/lib/api/bff-client";
import { rolesSchema } from "@/features/company/roles/schema";
import { companyPageSchema } from "@/features/admin/companies/schema";

export const userKeys = {
  list: (scope: UserScope, page: number) => [scope, "users", page] as const,
  detail: (scope: UserScope, id: string) => [scope, "user", id] as const,
};

export function useUsersPage(scope: UserScope, enabled: boolean, page: number) {
  return useQuery({
    enabled,
    queryKey: userKeys.list(scope, page),
    queryFn: ({ signal }) => listUsers(scope, page, signal),
    retry: false,
  });
}
export function useUserDetail(scope: UserScope, enabled: boolean, id: string) {
  return useQuery({
    enabled,
    queryKey: userKeys.detail(scope, id),
    queryFn: ({ signal }) => getUser(scope, id, signal),
    retry: false,
  });
}
export function useUserRoleOptions(scope: UserScope, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: [scope, "roles"],
    queryFn: ({ signal }) => bffRequest("roles", rolesSchema, { signal }, scope),
    retry: false,
  });
}
export function useAdminCompanyOptions(enabled: boolean, page: number) {
  return useQuery({
    enabled,
    queryKey: ["admin", "companies", page],
    queryFn: ({ signal }) => bffRequest("companies?page=" + page, companyPageSchema, { signal }),
    retry: false,
  });
}
