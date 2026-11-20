"use client";
import { bffRequest } from "@/lib/api/bff-client";
import { inspectionsPage, samplingsPage } from "../operations-schema";
import { OperationList, OperationWorkspace } from "../shared/operation-workspace";
export function OperationsPage({ mode }: { mode: "samplings" | "inspections" }) {
  const sampling = mode === "samplings";
  return (
    <OperationWorkspace
      title={sampling ? "Muestreos" : "Inspecciones"}
      description="Consulta y continúa las operaciones de tu empresa."
      permission={sampling ? "muestreos.ver" : "inspecciones.ver"}
    >
      <OperationList
        key={mode}
        queryKey={[mode, "all"]}
        fetchPage={async (page, signal) => {
          if (sampling) {
            const result = await bffRequest(
              `samplings?page=${page}`,
              samplingsPage,
              { signal },
              "agricultural",
            );
            return {
              meta: result.meta,
              rows: result.data.map((item) => ({
                id: item.id_muestreo,
                title: `Muestreo #${item.id_muestreo}`,
                detail: `${item.lote?.codigo_lote ?? "Lote #" + item.id_lote} · ${item.tamano_muestra} frutos`,
                status: item.estado.replaceAll("_", " ").toLocaleLowerCase("es"),
                href: `/samplings/${item.id_muestreo}`,
              })),
            };
          }
          const result = await bffRequest(
            `inspections?page=${page}`,
            inspectionsPage,
            { signal },
            "agricultural",
          );
          return {
            meta: result.meta,
            rows: result.data.map((item) => ({
              id: item.id_inspeccion,
              title: `Inspección #${item.id_inspeccion}`,
              detail: item.muestreo?.lote?.codigo_lote ?? `Muestreo #${item.id_muestreo}`,
              status: item.estado === "EN_CAPTURA" ? "En captura" : "Validada",
              href: `/inspections/${item.id_inspeccion}`,
            })),
          };
        }}
      />
    </OperationWorkspace>
  );
}
