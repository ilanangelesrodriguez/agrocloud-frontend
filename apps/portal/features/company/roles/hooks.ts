"use client";
import { useQuery } from "@tanstack/react-query";
import { getCompanyPermissions, getCompanyRoles } from "./api";

export function useCompanyRoles() {
  return useQuery({
    queryKey: ["company", "roles"],
    queryFn: ({ signal }) => getCompanyRoles(signal),
  });
}
export function useCompanyPermissions() {
  return useQuery({
    queryKey: ["company", "permissions"],
    queryFn: ({ signal }) => getCompanyPermissions(signal),
  });
}
