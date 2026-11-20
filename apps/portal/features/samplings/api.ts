import { bffRequest } from "@/lib/api/bff-client";
import { procedurePage, samplingDetail, samplingFruits, samplingResponse } from "./schema";

export function fetchSamplingProcedures(
  page: number,
  signal?: AbortSignal,
  filter?: { producto?: string; producto_id?: number; activo?: boolean },
) {
  const params = new URLSearchParams({ page: String(page) });
  if (filter?.producto_id) params.set("producto_id", String(filter.producto_id));
  if (filter?.producto) params.set("producto", filter.producto);
  if (filter?.activo !== undefined) params.set("activo", String(filter.activo));
  return bffRequest("sampling-procedures?" + params, procedurePage, { signal }, "agricultural");
}

/** Reunir solo las páginas del conjunto filtrado para el selector. */
export async function fetchAllSamplingProcedures(
  signal?: AbortSignal,
  filter?: { producto?: string; producto_id?: number; activo?: boolean },
) {
  const first = await fetchSamplingProcedures(1, signal, filter);
  const data = [...first.data];
  for (let page = 2; page <= first.meta.last_page; page++) {
    const next = await fetchSamplingProcedures(page, signal, filter);
    data.push(...next.data);
  }
  return { data: Array.from(new Map(data.map((item) => [item.id, item])).values()) };
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
