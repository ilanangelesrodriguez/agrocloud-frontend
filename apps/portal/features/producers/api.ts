import { bffRequest } from "@/lib/api/bff-client";
import { producerDetail, producerList } from "./schema";
import { z } from "zod";

const lookupResult = z.object({
  ruc: z.string(), resultado: z.string(), razon_social: z.string().nullable(),
  estado: z.string().nullable(), condicion: z.string().nullable(),
});

export function lookupProducerRuc(ruc: string) {
  return bffRequest("producer-lookup?ruc=" + encodeURIComponent(ruc), lookupResult, undefined, "agricultural");
}

/** Conservar la ruta y verbos del gateway agrícola existente. */
export function fetchProducers(page: number, signal?: AbortSignal) {
  return bffRequest("producers?page=" + page, producerList, { signal }, "agricultural");
}

export function fetchProducer(id: string, signal?: AbortSignal) {
  return bffRequest("producers/" + id, producerDetail, { signal }, "agricultural");
}

export function saveProducer(id: number | undefined, input: object) {
  return bffRequest(
    id ? "producers/" + id : "producers",
    producerDetail,
    {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "agricultural",
  );
}
