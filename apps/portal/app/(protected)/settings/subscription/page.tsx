import { CompanyReadView } from "@/features/company/components/company-views";
import { SubscriptionOffers } from "@/features/plans/components/subscription-offers";

export default function Page() {
  return (
    <div className="space-y-8">
      <CompanyReadView view="subscription" />
      <SubscriptionOffers />
    </div>
  );
}
