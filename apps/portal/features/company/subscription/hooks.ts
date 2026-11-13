"use client";
import { useQuery } from "@tanstack/react-query";
import { getCompanySubscription } from "./api";

export function useCompanySubscription() {
  return useQuery({
    queryKey: ["company", "subscription"],
    queryFn: ({ signal }) => getCompanySubscription(signal),
  });
}
