"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchResponsibles, fetchIncidentEvidences } from "./api";
export function useIncidentOptions(lot: number, creating: boolean, enabled: boolean) {
  const users = useInfiniteQuery({
    queryKey: ["agricultural", "incident-responsibles"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchResponsibles(pageParam, signal),
    getNextPageParam: (page) =>
      page.meta.current_page < page.meta.last_page ? page.meta.current_page + 1 : undefined,
    enabled: enabled && creating,
    retry: false,
  });
  const evidences = useInfiniteQuery({
    queryKey: ["agricultural", "incident-evidences", lot],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchIncidentEvidences(lot, pageParam, signal),
    getNextPageParam: (page) =>
      page.meta.current_page < page.meta.last_page ? page.meta.current_page + 1 : undefined,
    enabled: enabled && !creating,
    retry: false,
  });
  return { users, evidences };
}
