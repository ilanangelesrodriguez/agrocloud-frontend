import { bffRequest } from "@/lib/api/bff-client";
import { procedurePage, samplingDetail, samplingFruits, samplingResponse } from "./schema";

export function fetchSamplingProcedures(page: number, signal?: AbortSignal) {
  return bffRequest("sampling-procedures?page=" + page, procedurePage, { signal }, "agricultural");
}

export function registerSampling(lotId: number, input: object) {
  return bffRequest(
    "lots/" + lotId + "/samplings",
    samplingResponse,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "agricultural",
  );
}

export function fetchSamplingDetail(id: string, signal?: AbortSignal) {
  return bffRequest("samplings/" + id, samplingDetail, { signal }, "agricultural");
}

export function fetchSamplingFruits(id: string, page: number, signal?: AbortSignal) {
  return bffRequest(
    "samplings/" + id + "/fruits?page=" + page,
    samplingFruits,
    { signal },
    "agricultural",
  );
}
