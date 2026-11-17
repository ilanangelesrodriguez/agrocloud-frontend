import { RouteDrawer } from "@/components/route-drawer";
import { LotPage } from "@/features/lots/components/lot-page";
import { notFound } from "next/navigation";

import { InspectionDetails } from "@/features/inspections/components/inspection-details";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return (
    <RouteDrawer
      title={`Inspección #${id}`}
      description="Consulta la información y completa las acciones disponibles sin salir del listado."
      back="/lots"
      background={<LotPage mode="list" />}
    >
      <InspectionDetails id={id} />
    </RouteDrawer>
  );
}
