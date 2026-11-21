import { bffRequest } from "@/lib/api/bff-client";
import { evidenceResponse, analysisQueued, analysisBatch } from "./schema";
import { fetchSamplingFruits } from "@/features/samplings/api";

export { fetchSamplingFruits };

export function uploadEvidence(inspectionId: string, body: FormData) {
  return bffRequest(
    "inspections/" + inspectionId + "/evidences",
    evidenceResponse,
    {
      method: "POST",
      body,
    },
    "agricultural",
  );
}

export function analyzeEvidence(photoId: number) {
  return bffRequest(
    "evidences/" + photoId + "/analyze",
    analysisQueued,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    "agricultural",
  );
}

export function requestAnalysisBatch(
  inspectionId: string,
  evidenceIds: number[],
  idempotencyKey: string,
) {
  return bffRequest(
    "inspections/" + inspectionId + "/analyses",
    analysisBatch,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidenceIds, idempotencyKey }),
    },
    "agricultural",
  );
}

export function fetchAnalysisBatch(inspectionId: string, batchId: string, signal?: AbortSignal) {
  return bffRequest(
    "inspections/" + inspectionId + "/analyses/" + batchId,
    analysisBatch,
    { signal },
    "agricultural",
  );
}

export function retryAnalysisBatch(inspectionId: string, batchId: string) {
  return bffRequest(
    "inspections/" + inspectionId + "/analyses/" + batchId + "/retry",
    analysisBatch,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    "agricultural",
  );
}
