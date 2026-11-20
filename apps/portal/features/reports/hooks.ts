"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchReport } from "./api";
import type { ReportFilter } from "./schema";
export function useReport(filter: ReportFilter) {
  return useQuery({
    queryKey: ["agricultural", "reports", filter],
    queryFn: ({ signal }) => fetchReport(filter, signal),
    retry: false,
  });
}
