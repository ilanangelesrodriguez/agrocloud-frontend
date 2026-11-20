import { bffRequest } from "@/lib/api/bff-client";
import { procedurePage, samplingDetail, samplingFruits, samplingResponse } from "./schema";

export function fetchSamplingProcedures(page: number, signal?: AbortSignal) {
  return bffRequest("sampling-procedures?page=" + page, procedurePage, { signal }, "agricultural");
}

/** La API no filtra por producto: reunir todas las páginas antes de seleccionar. */
export async function fetchAllSamplingProcedures(signal?: AbortSignal) {
  const first = await fetchSamplingProcedures(1, signal);
  const data = [...first.data];
  for (let page = 2; page <= first.meta.last_page; page++) {
    const next = await fetchSamplingProcedures(page, signal);
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
