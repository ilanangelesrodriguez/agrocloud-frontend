"use client";
import type { z } from "zod";
import type { incidentRecord } from "../schema";
import {
  OperationList,
  OperationWorkspace,
} from "@/features/agricultural/shared/operation-workspace";
import { fetchIncidents } from "../api";
import { incidentLabels } from "../schema";
import { IncidentEditor } from "./incident-editor";
export function IncidentsPage() {
  return (
    <OperationWorkspace
      title="Incidencias"
      description="Consulta los problemas y continúa las acciones de seguimiento."
      permission="incidencias.ver"
    >
      <OperationList<z.infer<typeof incidentRecord>>
        queryKey={["incidents", "all"]}
        renderContent={(incident) => <IncidentEditor incident={incident} />}
        fetchPage={async (page, signal) => {
          const result = await fetchIncidents(page, signal);
          return {
            meta: result.meta,
            rows: result.data.map((item) => ({
              id: item.id,
              title: item.titulo,
              detail: `Lote #${item.id_lote} · Gravedad ${incidentLabels[item.gravedad].toLocaleLowerCase("es")}`,
              status: incidentLabels[item.estado],
              href: `/lots/${item.id_lote}`,
              record: item,
            })),
          };
        }}
      />
    </OperationWorkspace>
  );
}
