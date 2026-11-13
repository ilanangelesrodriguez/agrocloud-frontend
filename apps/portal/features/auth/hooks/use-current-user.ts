"use client";

import { useQuery } from "@tanstack/react-query";

import { authRequest } from "../request";

import { identityUserSchema } from "@/lib/auth/schemas";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async ({ signal }) => {
      const data = await authRequest("/api/auth/session", { signal });

      return identityUserSchema.parse((data as { user?: unknown }).user);
    },
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
