"use client";

import { useQuery } from "@tanstack/react-query";
import { listAccessRequests } from "./api";

export const accessRequestKeys = {
  list: (page: number) => ["admin", "access-requests", page] as const,
  all: ["admin", "access-requests"] as const,
};

export function useAccessRequests(page: number) {
  return useQuery({
    queryKey: accessRequestKeys.list(page),
    queryFn: ({ signal }) => listAccessRequests(page, signal),
    retry: false,
  });
}
