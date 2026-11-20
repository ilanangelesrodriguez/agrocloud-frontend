export {
  incidentsPage,
  incidentRecord,
  incidentInput,
  incidentUpdate,
  incidentResponse,
  responsiblePage,
  incidentEvidences,
  incidentHistory,
} from "@/features/agricultural/operations-schema";
export const incidentLabels: Record<string, string> = {
  ABIERTA: "Abierta",
  EN_ATENCION: "En atención",
  RESUELTA: "Resuelta",
  CERRADA: "Cerrada",
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
};
