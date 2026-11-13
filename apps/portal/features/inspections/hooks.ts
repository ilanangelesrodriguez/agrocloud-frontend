"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInspection } from "./api";

export function useInspectionDetails(id: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ["agricultural", "inspections", "detail", id],
    queryFn: ({ signal }) => fetchInspection(id, signal),
    refetchInterval: ({ state }) =>
      state.data?.data.evidencias?.some(
        ({ estado_ia }) => estado_ia === "EN_COLA" || estado_ia === "PROCESANDO",
      )
        ? 5000
        : false,
    retry: false,
  });
}
