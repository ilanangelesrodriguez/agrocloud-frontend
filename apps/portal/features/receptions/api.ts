import { bffRequest } from "@/lib/api/bff-client";
import { receptionResponse } from "./schema";

export function registerReception(lotId: number, body: object) {
  return bffRequest(
    "lots/" + lotId + "/reception",
    receptionResponse,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    },
    "agricultural",
  );
}
