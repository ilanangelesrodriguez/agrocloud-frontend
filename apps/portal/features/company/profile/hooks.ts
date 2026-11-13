"use client";
import { useQuery } from "@tanstack/react-query";
import { getCompanyProfile } from "./api";

export function useCompanyProfile() {
  return useQuery({
    queryKey: ["company", "profile"],
    queryFn: ({ signal }) => getCompanyProfile(signal),
  });
}
