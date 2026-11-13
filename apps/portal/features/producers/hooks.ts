"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducer, fetchProducers } from "./api";

export function useProducersPage(page: number) {
  return useQuery({
    queryKey: ["agricultural", "producers", page],
    queryFn: ({ signal }) => fetchProducers(page, signal),
    retry: false,
  });
}

export function useProducerDetails(id: string) {
  return useQuery({
    queryKey: ["agricultural", "producers", "detail", id],
    queryFn: async ({ signal }) => ({
      producer: (await fetchProducer(id, signal)).data,
      lot: null,
    }),
    retry: false,
  });
}
