import { RouteDrawer } from "@/components/route-drawer";
import { CompanyUsersList } from "@/features/company/users/components";
import { notFound } from "next/navigation";

import { CompanyUserDetails } from "@/features/company/users/components";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return (
    <RouteDrawer
      title="Usuario y permisos"
      description="Consulta la información y completa las acciones disponibles sin salir del listado."
      back="/settings/users"
      background={<CompanyUsersList />}
    >
      <CompanyUserDetails id={id} />
    </RouteDrawer>
  );
}
