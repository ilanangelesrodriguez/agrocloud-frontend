"use client";

import { useQuery } from "@tanstack/react-query";
import type { IdentityUser } from "@/lib/auth/schemas";
import { canManageCompany } from "@/features/company/navigation";
import { getCompanyProfile } from "./api";

export type CompanyBrand = {
  name: string;
  logoUrl: string | null;
  companyId: number | null;
  platform: boolean;
  available: boolean;
};

export function useCompanyBrand(user: IdentityUser | undefined): CompanyBrand {
  const enabled = canManageCompany(user, "empresa.ver");
  const query = useQuery({
    queryKey: ["company", "profile"],
    queryFn: ({ signal }) => getCompanyProfile(signal),
    enabled,
    retry: false,
    staleTime: 60000,
  });
  const company =
    enabled && query.data && query.data.data.id_empresa === user?.id_empresa
      ? query.data.data
      : undefined;
  const platform = user?.rol?.codigo === "SUPERADMIN" || !user?.id_empresa;
  return {
    companyId: user?.id_empresa ?? null,
    platform,
    available: !!company,
    name: platform
      ? "Administración de plataforma"
      : company?.nombre_comercial || company?.razon_social || "Organización vinculada",
    logoUrl: company?.logo_url ?? null,
  };
}
