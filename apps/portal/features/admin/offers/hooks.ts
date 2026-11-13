"use client";
import { useQuery } from "@tanstack/react-query";
import { getOffer, listOffers } from "./api";

export const offerKeys = {
  list: ["admin", "billing-offers"] as const,
  detail: (key: string) => ["admin", "billing-offers", key] as const,
};
export function useOffers() {
  return useQuery({
    queryKey: offerKeys.list,
    queryFn: ({ signal }) => listOffers(signal),
    retry: false,
  });
}
export function useOffer(key: string) {
  return useQuery({
    queryKey: offerKeys.detail(key),
    queryFn: ({ signal }) => getOffer(key, signal),
    retry: false,
  });
}
