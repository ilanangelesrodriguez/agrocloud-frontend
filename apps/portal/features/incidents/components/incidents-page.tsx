"use client";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
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
  const { data: actor } = useCurrentUser();
  return (
    <OperationWorkspace
      title="Incidencias"
      description="Consulta los problemas y continúa las acciones de seguimiento."
      permission="incidencias.ver"
    >
      <OperationList<z.infer<typeof incidentRecord>>
        layout="incident"
        emptyTitle="Sin incidencias registradas"
        emptyDescription="No se encontraron incidencias para esta vista. Puedes registrar una incidencia desde el expediente del lote correspondiente, si tienes autorización."
        emptyAction={
          canManageCompany(actor, "lotes.ver") ? (
            <Link
              href="/lots"
              className="inline-flex min-h-10 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-accent"
            >
              Consultar lotes →
            </Link>
          ) : undefined
        }
        filterStates={[
          { id: "all", label: "Todas" },
          ...["ABIERTA", "EN_ATENCION", "RESUELTA", "CERRADA"].map((id) => ({
            id: incidentLabels[id],
            label: incidentLabels[id],
          })),
        ]}
        queryKey={["incidents", "all"]}
        renderContent={(incident) => (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Chip
              size="sm"
              variant="soft"
              color={
                incident.gravedad === "CRITICA" || incident.gravedad === "ALTA"
                  ? "danger"
                  : incident.gravedad === "MEDIA"
                    ? "warning"
                    : "default"
              }
            >
              {incidentLabels[incident.gravedad]}
            </Chip>
            <IncidentEditor incident={incident} />
          </div>
        )}
        fetchPage={async (page, signal) => {
          const result = await fetchIncidents(page, signal);
          return {
            meta: result.meta,
            rows: result.data.map((item) => ({
              id: item.id,
              title: item.titulo,
              detail: `Lote #${item.id_lote} · Responsable #${item.responsable}`,
              status: incidentLabels[item.estado],
              href: `/lots/${item.id_lote}`,
              actionLabel: "Ver lote",
              record: item,
            })),
          };
        }}
      />
    </OperationWorkspace>
  );
}
