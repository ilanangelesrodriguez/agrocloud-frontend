import type { z } from "zod";
import { bffRequest } from "@/lib/api/bff-client";
import { inspectionsPage, type decisionStatus } from "./schema";
export function fetchQuality(
  page: number,
  status: z.infer<typeof decisionStatus>,
  signal: AbortSignal,
) {
  return bffRequest(
    `inspections?page=${page}&decision_status=${status}`,
    inspectionsPage,
    { signal },
    "agricultural",
  );
}
