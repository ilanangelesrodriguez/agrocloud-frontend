"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchCatalog, fetchLot, fetchLotProducers, fetchLots } from "./api";

export function useLotsPage(page: number, status = "") {
  return useQuery({
    queryKey: ["agricultural", "lots", page, status],
    queryFn: ({ signal }) => fetchLots(page, signal, status),
    retry: false,
  });
}

export function useLotDetails(id: string, enabled = true) {
  return useQuery({
    queryKey: ["agricultural", "lots", "detail", id],
    enabled,
    // Preservar el shape del caché usado al registrar la recepción.
    queryFn: async ({ signal }) => ({ producer: null, lot: (await fetchLot(id, signal)).data }),
    refetchInterval: ({ state }) =>
      (state.data?.lot.workflow?.evidenceProgress?.ai_pending ?? 0) > 0 ? 5000 : false,
    retry: false,
  });
}

export function useLotCatalogs() {
  return useQueries({
    queries: (["producto", "variedad", "unidad"] as const).map((type) => ({
      queryKey: ["agricultural", "catalog", type],
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchCatalog(type, signal),
      retry: false,
    })),
  });
}

export function useLotProducers(enabled: boolean, page: number) {
  return useQuery({
    enabled,
    queryKey: ["agricultural", "lot-producers", page],
    queryFn: ({ signal }) => fetchLotProducers(page, signal),
    retry: false,
  });
}
