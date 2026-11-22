"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { bffRequest } from "@/lib/api/bff-client";
import { producerList } from "@/features/agricultural/schema";
import { Button } from "@heroui/react";
import { ErrorState, LoadingState } from "@agrocloud/ui";
import { OperationWorkspace } from "@/features/agricultural/shared/operation-workspace";
import { ReportFilters, useAnalysisFilter } from "./report-filters";
import { QualityResults } from "./quality-results";
import { useReport } from "../hooks";
export function ReportsPage() {
  return (
    <OperationWorkspace
      title="Reportes de calidad"
      description="Resultados de los lotes registrados en el periodo seleccionado. Los tiempos se expresan en horas."
      permission="reportes.operativos"
    >
      <ReportContent />
    </OperationWorkspace>
  );
}
function ReportContent() {
  const { filter, apply, revision } = useAnalysisFilter();
  const producers = useInfiniteQuery({
    queryKey: ["agricultural", "report-producers"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      bffRequest(`reports/producers?page=${pageParam}`, producerList, { signal }, "agricultural"),
    getNextPageParam: (page) =>
      page.meta.current_page < page.meta.last_page ? page.meta.current_page + 1 : undefined,
    staleTime: 60000,
    retry: false,
  });
  const producerOptions = producers.data?.pages.flatMap((page) => page.data) ?? [];
  const query = useReport(filter);
  function exportCsv() {
    if (!query.data) return;
    const data = query.data;
    const rows: (string | number)[][] = [
      ["Indicador", "Valor"],
      ["Desde (registro del lote, UTC)", filter.from ?? "Sin límite"],
      ["Hasta (registro del lote, UTC)", filter.to ?? "Sin límite"],
      ["Producto", filter.producto ?? "Todos"],
      ["Variedad", filter.variedad ?? "Todas"],
      [
        "Productor",
        producerOptions.find((item) => String(item.id_productor) === filter.producer_id)
          ?.nombre_razon_social ??
          (filter.producer_id ? "Productor #" + filter.producer_id : "Todos"),
      ],
      ["Lotes con dictamen", data.quality.decided_lots],
      [
        "Aprobación (%)",
        data.quality.decided_lots > 0 ? data.quality.approval_rate : "No evaluable",
      ],
      ["Rechazo (%)", data.quality.decided_lots > 0 ? data.quality.rejection_rate : "No evaluable"],
      [
        "Observados (%)",
        data.quality.decided_lots > 0 ? data.quality.observed_rate : "No evaluable",
      ],
      ["Recepción a dictamen (horas)", data.quality.reception_to_decision_hours ?? "Sin datos"],
      ["Inspección (horas)", data.quality.inspection_hours ?? "Sin datos"],
      ["IA confirmadas", data.ai_review.confirmed],
      ["IA descartadas", data.ai_review.discarded],
      ["Evidencias con solicitud IA", data.ai_review.requested_evidences],
      ...data.quality_by_producer.map((row) => [row.productor + " · " + row.decision, row.total]),
      ...data.frequent_defects.map((row) => ["Hallazgo · " + row.clase, row.total]),
      ...data.lots_by_status.map((row) => ["Lotes · " + row.estado, row.total]),
      ...data.inspections_by_status.map((row) => ["Inspecciones · " + row.estado, row.total]),
      ...data.incidents_by_product.map((row) => ["Incidencias · " + row.producto, row.total]),
    ];
    const escape = (value: string | number) => {
      const text = String(value);
      return '"' + (/^[=+@-]/.test(text) ? "'" : "") + text.replaceAll('"', '""') + '"';
    };
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + rows.map((row) => row.map(escape).join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "agrocloud-calidad.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="space-y-5">
      <ReportFilters
        key={revision}
        filter={filter}
        onApply={apply}
        busy={query.isFetching}
        producers={producerOptions.map((item) => ({
          id: String(item.id_productor),
          name: item.nombre_razon_social,
        }))}
        exportAction={
          <Button
            type="button"
            variant="secondary"
            isDisabled={!query.data || query.isFetching}
            onPress={exportCsv}
          >
            Exportar CSV
          </Button>
        }
      >
        {producers.hasNextPage ? (
          <Button
            type="button"
            size="sm"
            variant="tertiary"
            isPending={producers.isFetchingNextPage}
            onPress={() => void producers.fetchNextPage()}
          >
            Cargar más productores
          </Button>
        ) : null}
        {producers.isError ? (
          <ErrorState error={producers.error} retry={() => producers.refetch()} />
        ) : null}
      </ReportFilters>
      <p className="text-xs text-muted">
        Fechas UTC de registro del lote. Los tiempos representan promedios en horas; no se filtra
        por fecha del dictamen.
      </p>
      {query.isPending ? (
        <LoadingState label="Cargando reportes" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : (
        <QualityResults data={query.data} />
      )}
    </div>
  );
}
