"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchLots } from "@/features/lots/api";
import { fetchProducers } from "@/features/producers/api";
import { getCompanySubscription } from "@/features/company/subscription/api";

/** Lee únicamente endpoints existentes y respeta el ámbito de la empresa autenticada. */
export function useOperationalDashboard(permissions: {
  lots: boolean;
  producers: boolean;
  subscription: boolean;
}) {
  const lots = useQuery({
    enabled: permissions.lots,
    queryKey: ["agricultural", "lots", 1],
    queryFn: ({ signal }) => fetchLots(1, signal),
    retry: false,
  });
  const producers = useQuery({
    enabled: permissions.producers,
    queryKey: ["agricultural", "producers", 1],
    queryFn: ({ signal }) => fetchProducers(1, signal),
    retry: false,
  });
  const subscription = useQuery({
    enabled: permissions.subscription,
    queryKey: ["company", "subscription"],
    queryFn: ({ signal }) => getCompanySubscription(signal),
    retry: false,
  });

  return { lots, producers, subscription };
}
