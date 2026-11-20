import type { z } from "zod";
import { bffRequest } from "@/lib/api/bff-client";
import { catalog } from "@/features/agricultural/schema";
import { catalogCreated, catalogUpdated, procedureCreated, procedureResponse } from "./schema";
import type { CatalogType, catalogInput, procedureInput } from "./schema";

export function fetchMasterCatalog(type: CatalogType, signal?: AbortSignal) {
  return bffRequest("catalogs?tipo=" + type, catalog, { signal }, "agricultural");
}
export function createCatalog(input: z.infer<typeof catalogInput>) {
  return bffRequest("catalogs", catalogCreated, json("POST", input), "agricultural");
}
export function toggleCatalog(id: number, estado: boolean) {
  return bffRequest("catalogs/" + id, catalogUpdated, json("PATCH", { estado }), "agricultural");
}
export function createProcedure(input: z.infer<typeof procedureInput>) {
  return bffRequest("sampling-procedures", procedureCreated, json("POST", input), "agricultural");
}
export function toggleProcedure(id: number, activo: boolean) {
  return bffRequest(
    "sampling-procedures/" + id,
    procedureResponse,
    json("PATCH", { activo }),
    "agricultural",
  );
}
function json(method: "POST" | "PATCH", body: object): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
