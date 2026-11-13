import { bffRequest } from "@/lib/api/bff-client";
import { traceabilityResponse } from "./schema";

export function fetchLotTraceability(lotId: number, page: number, signal?: AbortSignal) {
  return bffRequest(
    "lots/" + lotId + "/traceability?page=" + page,
    traceabilityResponse,
    { signal },
    "agricultural",
  );
}
