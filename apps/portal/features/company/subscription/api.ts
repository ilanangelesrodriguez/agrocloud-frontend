import { bffRequest } from "@/lib/api/bff-client";
import { subscriptionSchema } from "./schema";

export function getCompanySubscription(signal?: AbortSignal) {
  return bffRequest("subscription", subscriptionSchema, { signal }, "company");
}
