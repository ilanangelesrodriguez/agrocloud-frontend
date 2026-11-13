"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSamplingFruits } from "./api";

export function useEvidenceFruits(samplingId: number, page: number, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ["agricultural", "samplings", "fruits", String(samplingId), page],
    queryFn: ({ signal }) => fetchSamplingFruits(String(samplingId), page, signal),
    retry: false,
  });
}
