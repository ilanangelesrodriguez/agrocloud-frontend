import { RouteDrawer } from "@/components/route-drawer";
import { Companies } from "@/features/admin/companies/components/company-list";
import { notFound } from "next/navigation";

import { CompanyDetails } from "@/features/admin/companies/components/company-details";
import { positiveInteger } from "@/lib/auth/admin-route";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return (
    <RouteDrawer
      title="Detalle de empresa"
      description="Consulta la información y completa las acciones disponibles sin salir del listado."
      back="/admin/companies"
      background={<Companies />}
    >
      <CompanyDetails id={id} />
    </RouteDrawer>
  );
}
