import { bffRequest } from "@/lib/api/bff-client";
import { offerDetail, offerList, offerHistory } from "./schema";

export function listOffers(signal?: AbortSignal) {
  return bffRequest("billing-offers", offerList, { signal });
}
export function getOffer(key: string, signal?: AbortSignal) {
  return bffRequest("billing-offers/" + encodeURIComponent(key), offerDetail, { signal });
}
export function saveOffer(input: object, key?: string) {
  return bffRequest(
    key ? "billing-offers/" + encodeURIComponent(key) : "billing-offers",
    offerDetail,
    {
      method: key ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export function getOfferHistory(key: string, signal?: AbortSignal) {
  return bffRequest("billing-offers/" + encodeURIComponent(key) + "/versions", offerHistory, {
    signal,
  });
}
