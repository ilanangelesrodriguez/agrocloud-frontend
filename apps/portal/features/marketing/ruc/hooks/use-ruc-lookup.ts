import { useMutation } from "@tanstack/react-query";

import { rucLookupSchema } from "../schema";

import { fetchPublicJson } from "@/lib/marketing/api/public-client";

export function useRucLookup() {
  return useMutation({
    mutationFn: async (ruc: string) => {
      const result = await fetchPublicJson("/api/public/ruc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruc }),
        signal: AbortSignal.timeout(20_000),
      });

      return rucLookupSchema.parse(result).data;
    },
    retry: 0,
  });
}
