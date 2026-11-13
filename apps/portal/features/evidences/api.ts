import { bffRequest } from "@/lib/api/bff-client";
import { evidenceResponse, analysisQueued } from "./schema";
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
