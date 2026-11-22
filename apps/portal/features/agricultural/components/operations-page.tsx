"use client";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { bffRequest } from "@/lib/api/bff-client";
import { inspectionsPage, samplingsPage } from "../operations-schema";
import { OperationList, OperationWorkspace } from "../shared/operation-workspace";
export function OperationsPage({ mode }: { mode: "samplings" | "inspections" }) {
  const sampling = mode === "samplings";
  const { data: actor } = useCurrentUser();
  return (
    <OperationWorkspace
      title={sampling ? "Muestreos registrados" : "Inspecciones"}
      description={
        sampling
          ? "Muestras de tu empresa, frutos seleccionados e inspecciones vinculadas."
          : "Consulta y continúa las operaciones de tu empresa."
      }
      permission={sampling ? "muestreos.ver" : "inspecciones.ver"}
    >
      <OperationList
        key={mode}
        layout={sampling ? "sampling" : "inspection"}
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
                detail: `${item.lote?.codigo_lote ?? "Lote #" + item.id_lote} · ${item.tamano_muestra} ${item.tamano_muestra === 1 ? "fruto" : "frutos"}`,
                status:
                  item.estado === "EN_INSPECCION"
                    ? "En inspección"
                    : item.estado === "COMPLETADO"
                      ? "Completado"
                      : item.estado.charAt(0) +
                        item.estado.slice(1).replaceAll("_", " ").toLocaleLowerCase("es"),
                actionLabel: "Ver muestreo",
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
              detail:
                (item.muestreo?.lote?.codigo_lote ?? `Muestreo #${item.id_muestreo}`) +
                (item.id_inspector ? " · Inspector #" + item.id_inspector : ""),
              status:
                item.estado === "EN_CAPTURA"
                  ? "En captura"
                  : item.estado === "VALIDADA"
                    ? "Validada"
                    : item.estado.replaceAll("_", " "),
              actionLabel:
                item.estado === "VALIDADA"
                  ? "Ver resultados"
                  : item.estado === "EN_CAPTURA" &&
                      actor?.rol?.codigo === "INSPECTOR" &&
                      canManageCompany(actor, "inspecciones.capturar") &&
                      (item.id_inspector == null || item.id_inspector === actor?.id_usuario)
                    ? "Continuar inspección"
                    : "Consultar inspección",
              href: `/inspections/${item.id_inspeccion}`,
            })),
          };
        }}
      />
    </OperationWorkspace>
  );
}
