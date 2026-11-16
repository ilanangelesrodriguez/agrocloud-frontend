import { CompanySubscription } from "@/features/company/subscription/components/subscription-summary";
import { SubscriptionOffers } from "@/features/plans/components/subscription-offers";
import { offerKey } from "@/features/plans/schema";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string | string[] }>;
}) {
  const selection = offerKey.safeParse((await searchParams).offer);

  return (
    <div className="space-y-8">
      <CompanySubscription />
      <SubscriptionOffers selectedOfferKey={selection.success ? selection.data : undefined} />
    </div>
  );
}
