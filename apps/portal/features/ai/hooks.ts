"use client";
import type { z } from "zod";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAi, fetchCompanyAi, type AiFilters, type CompanyAiFilters } from "./api";
export function useAi<T>(
  path: string,
  schema: z.ZodType<T>,
  filter: AiFilters = {},
  monitoring = false,
) {
  return useQuery({
    queryKey: ["ai", path, filter],
    queryFn: ({ signal }) => fetchAi(path, schema, filter, signal),
    staleTime: monitoring ? 15000 : 300000,
    refetchInterval: monitoring ? 30000 : false,
    refetchIntervalInBackground: false,
    retry: false,
  });
}
export function useCompanyAi<T>(section: string, schema: z.ZodType<T>, filter: CompanyAiFilters) {
  return useQuery({
    queryKey: ["agricultural", "ai", section, filter],
    queryFn: ({ signal }) => fetchCompanyAi(section, schema, filter, signal),
    staleTime: 30000,
    retry: false,
  });
}

export function useDebouncedModel(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), 400);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
}
