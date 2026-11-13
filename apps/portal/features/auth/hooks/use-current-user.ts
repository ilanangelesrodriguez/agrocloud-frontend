"use client";

import { useQuery } from "@tanstack/react-query";
import { identityUserSchema } from "@/lib/auth/schemas";
import { authRequest } from "../request";

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
