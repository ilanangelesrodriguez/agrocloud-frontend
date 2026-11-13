import type { z } from "zod";
import { bffRequest } from "@/lib/api/bff-client";
import { companyResponseSchema, editCompanySchema } from "./schema";

export function getCompanyProfile(signal?: AbortSignal) {
  return bffRequest("profile", companyResponseSchema, { signal }, "company");
}
export function updateCompanyProfile(input: z.infer<typeof editCompanySchema>) {
  return bffRequest(
    "profile",
    companyResponseSchema,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "company",
  );
}
