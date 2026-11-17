import { RouteDrawer } from "@/components/route-drawer";
import { OfferList } from "@/features/admin/offers/components/offer-list";
import { notFound } from "next/navigation";

import { OfferEdit } from "@/features/admin/offers/components/offer-detail";
import { offerKey } from "@/features/plans/schema";
export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!offerKey.safeParse(key).success || key === "new") notFound();

  return (
    <RouteDrawer
      title="Editar oferta"
      description="Consulta la información y completa las acciones disponibles sin salir del listado."
      back="/admin/plans"
      background={<OfferList />}
    >
      <OfferEdit offerId={key} />
    </RouteDrawer>
  );
}
