import { notFound } from "next/navigation";
import { OfferPage } from "@/features/plans/components/offers";
import { offerKey } from "@/features/plans/schema";
export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!offerKey.safeParse(key).success || key === "new") notFound();
  return <OfferPage edit offerId={key} />;
}
