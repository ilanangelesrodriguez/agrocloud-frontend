"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompany, listCompanies } from "./api";

export function useCompaniesPage(page: number) {
  return useQuery({
    queryKey: ["admin", "companies", page],
    queryFn: ({ signal }) => listCompanies(page, signal),
    retry: false,
  });
}
export function useCompanyDetails(id: string) {
  return useQuery({
    queryKey: ["admin", "company", id],
    queryFn: ({ signal }) => getCompany(id, signal),
    retry: false,
  });
}
