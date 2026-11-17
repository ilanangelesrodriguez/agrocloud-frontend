import type { Offer } from "./schema";
export const stateLabels = { DRAFT: "Borrador", PUBLISHED: "Publicada", ARCHIVED: "Archivada" };
export const kindLabels = {
  PLAN: "Plan",
  RENEWAL: "Renovación",
  USER_ADDON: "Usuarios adicionales",
  LOT_ADDON: "Lotes adicionales",
  AI_ADDON: "Análisis IA adicionales",
};
export const listKey = ["admin", "billing-offers"];
export const linkClass = "rounded-md font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent";
export function offerTone(status: Offer["status"]): "success" | "warning" | "neutral" {
  if (status === "PUBLISHED") return "success";
  if (status === "DRAFT") return "warning";
  return "neutral";
}
