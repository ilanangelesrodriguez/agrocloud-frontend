import { CompanySubscription } from "@/features/company/subscription/components/subscription-summary";
import { SubscriptionOffers } from "@/features/plans/components/subscription-offers";

export default function Page() {
  return (
    <div className="space-y-8">
      <CompanySubscription />
      <SubscriptionOffers />
    </div>
  );
}
