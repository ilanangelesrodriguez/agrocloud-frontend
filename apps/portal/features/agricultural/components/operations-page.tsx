"use client";
import type { z } from "zod";
import type { incidentRecord } from "../operations-schema";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { LoadingState, ErrorState, InlineNotice, PageHeader, StatusBadge } from "@agrocloud/ui";
import { bffRequest } from "@/lib/api/bff-client";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { samplingsPage, inspectionsPage, incidentsPage, lotList } from "../operations-schema";
import { OperationalSummary } from "./operational-summary";
import { IncidentEditor } from "./incident-editor";

type Mode = "samplings" | "inspections" | "quality" | "incidents" | "reports" | "production";
const labels: Record<Mode, string> = {
  samplings: "Muestreos",
  inspections: "Inspecciones",
  quality: "Calidad",
  incidents: "Incidencias",
  reports: "Reportes",
  production: "Lotes liberados para producción",
};
const permissions: Record<Mode, string> = {
  samplings: "muestreos.ver",
  inspections: "inspecciones.ver",
  quality: "calidad.clasificar",
  incidents: "lotes.ver",
  reports: "reportes.operativos",
  production: "lotes.ver",
};
type OperationRow = {
  id: number;
  title: string;
  detail: string;
  status: string;
  href: string;
  incident?: z.infer<typeof incidentRecord>;
};
async function fetchRows(
  mode: Exclude<Mode, "reports">,
  page: number,
  signal: AbortSignal,
): Promise<{ meta: { current_page: number; last_page: number }; rows: OperationRow[] }> {
  const options = { signal };
  if (mode === "samplings") {
    const result = await bffRequest(
      `samplings?page=${page}`,
      samplingsPage,
      options,
      "agricultural",
    );
    return {
      meta: result.meta,
      rows: result.data.map((item) => ({
        id: item.id_muestreo,
        title: `Muestreo #${item.id_muestreo}`,
        detail: `${item.lote?.codigo_lote ?? "Lote #" + item.id_lote} · ${item.metodo} · ${item.tamano_muestra} frutos`,
        status: item.estado,
        href: `/samplings/${item.id_muestreo}`,
      })),
    };
  }
  if (mode === "incidents") {
    const result = await bffRequest(
      `incidents?page=${page}`,
      incidentsPage,
      options,
      "agricultural",
    );
    return {
      meta: result.meta,
      rows: result.data.map((item) => ({
        id: item.id,
        title: item.titulo,
        detail: `Lote #${item.id_lote} · ${item.gravedad}`,
        status: item.estado,
        href: `/lots/${item.id_lote}`,
        incident: item,
      })),
    };
  }
  if (mode === "production") {
    const result = await bffRequest(
      `lots?page=${page}&estado=CLASIFICADO`,
      lotList,
      options,
      "agricultural",
    );
    return {
      meta: result.meta,
      rows: result.data.map((item) => ({
        id: item.id_lote,
        title: item.codigo_lote,
        detail: `${item.producto} · ${item.peso_kg} ${item.unidad_medida}`,
        status: item.estado,
        href: `/lots/${item.id_lote}`,
      })),
    };
  }
  const result = await bffRequest(
    `inspections?page=${page}${mode === "quality" ? "&estado=VALIDADA" : ""}`,
    inspectionsPage,
    options,
    "agricultural",
  );
  return {
    meta: result.meta,
    rows: result.data.map((item) => ({
      id: item.id_inspeccion,
      title: `Inspección #${item.id_inspeccion}`,
      detail: item.muestreo?.lote?.codigo_lote ?? `Muestreo #${item.id_muestreo}`,
      status: item.estado,
      href: `/inspections/${item.id_inspeccion}`,
    })),
  };
}
export function OperationsPage({ mode }: { mode: Mode }) {
  const session = useCurrentUser();
  const allowed =
    canManageCompany(session.data, permissions[mode]) &&
    (mode !== "quality" || canManageCompany(session.data, "inspecciones.ver"));
  if (session.isPending) return <LoadingState label="Verificando permisos" />;
  if (!allowed)
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="Tu cuenta no tiene permiso para consultar este módulo."
      />
    );
  return (
    <section className="space-y-5">
      <PageHeader
        title={labels[mode]}
        description={
          mode === "quality"
            ? "Inspecciones validadas disponibles para revisión y dictamen."
            : mode === "production"
              ? "Lotes aprobados sin incidencias altas o críticas pendientes de cierre."
              : "Consulta y continúa las operaciones de tu empresa."
        }
      />
      {mode === "reports" ? <OperationalSummary /> : <OperationsList key={mode} mode={mode} />}
    </section>
  );
}
function OperationsList({ mode }: { mode: Exclude<Mode, "reports"> }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["agricultural", "operations", mode, page],
    queryFn: ({ signal }) => fetchRows(mode, page, signal),
  });
  if (query.isPending) return <LoadingState label="Cargando operaciones" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  return (
    <>
      <ul className="space-y-3">
        {query.data.rows.map((row) => (
          <li key={row.id} className="space-y-3 rounded-card border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={row.href} className="font-semibold text-accent">
                {row.title}
              </Link>
              <StatusBadge tone="neutral">{row.status.replaceAll("_", " ")}</StatusBadge>
            </div>
            <p className="text-sm text-muted">{row.detail}</p>
            {row.incident ? <IncidentEditor incident={row.incident} /> : null}
          </li>
        ))}
      </ul>
      {query.data.rows.length === 0 ? (
        <p className="rounded-card border border-border p-5 text-muted">
          No hay registros para esta vista.
        </p>
      ) : null}
      <nav aria-label="Paginación" className="flex items-center gap-4">
        <Button isDisabled={page <= 1 || query.isFetching} onPress={() => setPage(page - 1)}>
          Anterior
        </Button>
        <span>
          Página {query.data.meta.current_page} de {query.data.meta.last_page}
        </span>
        <Button
          isDisabled={page >= query.data.meta.last_page || query.isFetching}
          onPress={() => setPage(page + 1)}
        >
          Siguiente
        </Button>
      </nav>
    </>
  );
}
