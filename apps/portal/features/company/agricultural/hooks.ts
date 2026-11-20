"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany, canReadProcedures } from "../navigation";
import { fetchMasterCatalog } from "./api";
import type { CatalogType } from "./schema";

export function useAgriculturalSettingsAccess() {
  const actor = useCurrentUser();
  const canRead = canManageCompany(actor.data, "empresa.editar");
  return {
    actor,
    canRead,
    canReadProcedures: canReadProcedures(actor.data),
    canWrite: canRead && actor.data?.rol?.codigo === "ADMIN",
  };
}
export function useMasterCatalog(type: CatalogType, enabled: boolean) {
  return useQuery({
    queryKey: ["agricultural", "catalog", "admin", type],
    queryFn: ({ signal }) => fetchMasterCatalog(type, signal),
    enabled,
    retry: false,
  });
}
