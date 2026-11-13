import { bffRequest } from "@/lib/api/bff-client";
import { inspectionCreated, inspectionDetail } from "./schema";

export function startSamplingInspection(id: string) {
  return bffRequest(
    "samplings/" + id + "/inspections",
    inspectionCreated,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    "agricultural",
  );
}

export function fetchInspection(id: string, signal?: AbortSignal) {
  return bffRequest("inspections/" + id, inspectionDetail, { signal }, "agricultural");
}
