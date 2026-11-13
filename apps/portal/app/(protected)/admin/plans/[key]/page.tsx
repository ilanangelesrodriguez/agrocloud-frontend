import { notFound } from "next/navigation";

import { OfferDetails } from "@/features/admin/offers/components/offer-detail";
import { offerKey } from "@/features/plans/schema";
export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!offerKey.safeParse(key).success || key === "new") notFound();

  return <OfferDetails offerId={key} />;
}
