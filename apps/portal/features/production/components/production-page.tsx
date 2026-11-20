"use client";
import {
  OperationList,
  OperationWorkspace,
} from "@/features/agricultural/shared/operation-workspace";
import { fetchReleasedLots } from "../api";
export function ProductionPage() {
  return (
    <OperationWorkspace
      title="Lotes liberados para producción"
      description="Lotes aprobados sin incidencias altas o críticas pendientes de cierre."
      permission="produccion.ver"
    >
      <OperationList
        queryKey={["production"]}
        fetchPage={async (page, signal) => {
          const result = await fetchReleasedLots(page, signal);
          return {
            meta: result.meta,
            rows: result.data.map((lot) => ({
              id: lot.id_lote,
              title: lot.codigo_lote,
              detail: `${lot.producto} · ${lot.peso_kg} ${lot.unidad_medida}`,
              status: "Liberado",
              href: `/lots/${lot.id_lote}`,
            })),
          };
        }}
      />
    </OperationWorkspace>
  );
}
