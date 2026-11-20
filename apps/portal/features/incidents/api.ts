import { bffRequest } from "@/lib/api/bff-client";
import {
  incidentsPage,
  incidentResponse,
  responsiblePage,
  incidentEvidences,
  incidentHistory,
} from "./schema";
export function fetchIncidents(page: number, signal?: AbortSignal) {
  return bffRequest(`incidents?page=${page}`, incidentsPage, { signal }, "agricultural");
}
export function fetchResponsibles(page: number, signal?: AbortSignal) {
  return bffRequest(
    `incident-responsibles?page=${page}`,
    responsiblePage,
    { signal },
    "agricultural",
  );
}
export function fetchIncidentEvidences(lot: number, page: number, signal?: AbortSignal) {
  return bffRequest(
    `lots/${lot}/incident-evidences?page=${page}`,
    incidentEvidences,
    { signal },
    "agricultural",
  );
}
export function fetchIncidentHistory(id: number, page: number, signal?: AbortSignal) {
  return bffRequest(
    `incidents/${id}/history?page=${page}`,
    incidentHistory,
    { signal },
    "agricultural",
  );
}
export function saveIncident(lot: number, body: object, id?: number) {
  return bffRequest(
    id ? `incidents/${id}` : `lots/${lot}/incidents`,
    incidentResponse,
    {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    },
    "agricultural",
  );
}
