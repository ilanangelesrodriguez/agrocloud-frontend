import { RouteDrawer } from "@/components/route-drawer";

import { notFound } from "next/navigation";

import { ProducerPage } from "@/features/producers/components/producer-page";
import { positiveInteger } from "@/lib/auth/authorized-identity";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!positiveInteger(id)) notFound();

  return (
    <RouteDrawer
      title="Editar productor"
      description="Consulta la información y completa las acciones disponibles sin salir del listado."
      back="/producers"
      background={<ProducerPage mode="list" />}
    >
      <ProducerPage id={id} mode="edit" />
    </RouteDrawer>
  );
}
