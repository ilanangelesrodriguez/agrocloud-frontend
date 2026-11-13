import { bffRequest } from "@/lib/api/bff-client";
import { catalog, lotDetail, lotList } from "./schema";
import { producerList } from "@/features/producers/schema";

export function fetchLots(page: number, signal?: AbortSignal) {
  return bffRequest("lots?page=" + page, lotList, { signal }, "agricultural");
}

export function fetchLot(id: string, signal?: AbortSignal) {
  return bffRequest("lots/" + id, lotDetail, { signal }, "agricultural");
}

export function fetchCatalog(type: "producto" | "variedad" | "unidad", signal?: AbortSignal) {
  return bffRequest("catalogs?tipo=" + type, catalog, { signal }, "agricultural");
}

export function fetchLotProducers(page: number, signal?: AbortSignal) {
  return bffRequest("producers?page=" + page, producerList, { signal }, "agricultural");
}

export function createLot({ body, key }: { body: string; key: string }) {
  return bffRequest(
    "lots",
    lotDetail,
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    },
    "agricultural",
  );
}
