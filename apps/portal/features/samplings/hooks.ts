"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchSamplingDetail,
  fetchSamplingFruits,
  fetchSamplingProcedures,
  fetchAllSamplingProcedures,
} from "./api";

export function useAllSamplingProcedures(enabled = true) {
  return useQuery({
    queryKey: ["agricultural", "sampling-procedures", "all"],
    queryFn: ({ signal }) => fetchAllSamplingProcedures(signal),
    enabled,
    retry: false,
  });
}

export function useSamplingProcedures(page: number) {
  return useQuery({
    queryKey: ["agricultural", "sampling-procedures", page],
    queryFn: ({ signal }) => fetchSamplingProcedures(page, signal),
    retry: false,
  });
}

export function useSamplingDetails(id: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ["agricultural", "samplings", "detail", id],
    queryFn: ({ signal }) => fetchSamplingDetail(id, signal),
    retry: false,
  });
}

export function useSamplingFruits(id: string, page: number, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ["agricultural", "samplings", "fruits", id, page],
    queryFn: ({ signal }) => fetchSamplingFruits(id, page, signal),
    retry: false,
  });
}
