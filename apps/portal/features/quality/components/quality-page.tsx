"use client";
import { useState } from "react";
import { Button } from "@heroui/react";
import {
  OperationList,
  OperationWorkspace,
} from "@/features/agricultural/shared/operation-workspace";
import { fetchQuality } from "../api";
export function QualityPage({
  initialStatus = "PENDING",
}: {
  initialStatus?: "PENDING" | "OBSERVED" | "COMPLETED";
}) {
  const [status, setStatus] = useState<"PENDING" | "OBSERVED" | "COMPLETED">(initialStatus);
  return (
    <OperationWorkspace
      title="Calidad"
      description="Gestiona dictámenes pendientes, correcciones y decisiones finalizadas."
      permission="calidad.clasificar"
    >
      <div role="group" aria-label="Estado del dictamen" className="flex flex-wrap gap-2">
        {(
          [
            ["PENDING", "Pendientes"],
            ["OBSERVED", "Observadas"],
            ["COMPLETED", "Finalizadas"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            aria-pressed={status === value}
            variant={status === value ? "primary" : "secondary"}
            onPress={() => setStatus(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <OperationList
        key={status}
        queryKey={["quality", status]}
        fetchPage={async (page, signal) => {
          const result = await fetchQuality(page, status, signal);
          return {
            meta: result.meta,
            rows: result.data.map((item) => ({
              id: item.id_inspeccion,
              title: `Inspección #${item.id_inspeccion}`,
              detail: [
                item.muestreo?.lote?.codigo_lote ?? `Muestreo #${item.id_muestreo}`,
                item.latest_decision?.categoria,
                item.latest_decision ? `Supervisor #${item.latest_decision.id_supervisor}` : null,
                item.latest_decision
                  ? new Date(item.latest_decision.created_at).toLocaleDateString("es-PE")
                  : null,
              ]
                .filter(Boolean)
                .join(" · "),
              status:
                status === "PENDING"
                  ? "Pendiente de dictamen"
                  : status === "OBSERVED"
                    ? "Corrección pendiente"
                    : item.latest_decision?.decision === "APROBADO"
                      ? "Aprobado"
                      : item.latest_decision?.decision === "RECHAZADO"
                        ? "Rechazado"
                        : "Dictamen finalizado",
              href: `/inspections/${item.id_inspeccion}`,
            })),
          };
        }}
      />
    </OperationWorkspace>
  );
}
