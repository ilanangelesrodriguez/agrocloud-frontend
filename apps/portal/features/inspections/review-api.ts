import type { z } from "zod";
import { bffRequest } from "@/lib/api/bff-client";
import { evidenceResponse, inspectionCreated } from "@/features/agricultural/inspection";
import { detectionResponse, findingResponse, decisionResponse } from "./review-schema";

function save<T>(
  path: string,
  input: object,
  response: z.ZodType<T>,
  method: "POST" | "PATCH" = "POST",
) {
  return bffRequest(
    path,
    response,
    { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "agricultural",
  );
}
export function decideDetection(id: number, index: number, input: object) {
  return save(`evidences/${id}/detections/${index}`, input, detectionResponse, "PATCH");
}
export function reviewPhoto(id: number, input: object) {
  return save(`evidences/${id}/review`, input, evidenceResponse);
}
export function discardPhoto(id: number, input: object) {
  return save(`evidences/${id}/discard`, input, evidenceResponse);
}
export function cancelPhotoAnalysis(id: number, input: object) {
  return save(`evidences/${id}/analysis/cancel`, input, evidenceResponse);
}
export function addFinding(id: string, input: object) {
  return save(`inspections/${id}/findings`, input, findingResponse);
}
export function validateInspection(id: string, input: object) {
  return save(`inspections/${id}/validate`, input, inspectionCreated);
}
export function issueDecision(id: string, input: object) {
  return save(`inspections/${id}/decisions`, input, decisionResponse);
}
