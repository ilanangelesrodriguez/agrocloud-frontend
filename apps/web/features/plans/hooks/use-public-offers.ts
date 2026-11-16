import { useQuery } from "@tanstack/react-query";

import { publicOffersSchema } from "../schema";

import { fetchPublicJson } from "@/lib/api/public-client";

export function usePublicOffers() {
  return useQuery({
    queryKey: ["public-offers"],
    queryFn: async ({ signal }) => {
      const result = await fetchPublicJson("/api/public/offers", { signal });

      return publicOffersSchema.parse(result).data;
    },
    retry: false,
  });
}
