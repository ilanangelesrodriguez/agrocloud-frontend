"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLotTraceability } from "./api";

export function useLotTraceability(lotId: number, page: number) {
  return useQuery({
    queryKey: ["agricultural", "lots", "traceability", lotId, page],
    queryFn: ({ signal }) => fetchLotTraceability(lotId, page, signal),
    retry: false,
  });
}
