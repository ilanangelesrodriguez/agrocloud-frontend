import { bffRequest } from "@/lib/api/bff-client";
import { decisionResponseSchema, requestPageSchema } from "./schema";

export function listAccessRequests(page: number, signal?: AbortSignal) {
  return bffRequest("access-requests?page=" + page, requestPageSchema, { signal });
}

export function submitAccessRequestDecision(id: number, body: object) {
  return bffRequest("access-requests/" + id + "/decision", decisionResponseSchema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
