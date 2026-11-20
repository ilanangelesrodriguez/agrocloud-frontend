"use client";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";
import { ErrorState, LoadingState, FormNotice } from "@agrocloud/ui";
import { OperationWorkspace } from "@/features/agricultural/shared/operation-workspace";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { useReport } from "../hooks";
import type { ReportFilter } from "../schema";
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
  const [filter, setFilter] = useState<ReportFilter>({});
  const [error, setError] = useState("");
  const [producer, setProducer] = useState("");
  const all = useReport({});
  const query = useReport(filter);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const next = Object.fromEntries(
      ["from", "to", "producto", "variedad"].map((key) => [
        key,
        String(fields.get(key) ?? "").trim() || undefined,
      ]),
    );
    if (next.from && next.to && next.from > next.to) {
      setError("La fecha final debe ser igual o posterior a la inicial.");
      return;
    }
    setError("");
    setFilter({ ...next, producer_id: producer || undefined });
  }
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
        all.data?.quality_by_producer.find(
          (item) => String(item.id_productor) === filter.producer_id,
        )?.productor ?? "Todos",
      ],
      ["Lotes con dictamen", data.quality.decided_lots],
      ["Aprobación (%)", data.quality.approval_rate],
      ["Rechazo (%)", data.quality.rejection_rate],
      ["Observados (%)", data.quality.observed_rate],
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
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-card border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {(
          [
            ["from", "Desde", "date"],
            ["to", "Hasta", "date"],
            ["producto", "Producto", "text"],
            ["variedad", "Variedad", "text"],
          ] as const
        ).map(([name, label, type]) => (
          <TextField key={name} name={name}>
            <Label>{label}</Label>
            <Input type={type} maxLength={150} />
          </TextField>
        ))}
        <CatalogSelect
          label="Productor"
          value={producer}
          onChange={setProducer}
          optional
          emptyLabel="Todos los productores"
          items={Array.from(
            new Map(
              (all.data?.quality_by_producer ?? []).map((item) => [item.id_productor, item]),
            ).values(),
          ).map((item) => ({ id: String(item.id_productor), name: item.productor }))}
        />
        <div className="flex items-end gap-2">
          <Button type="submit" isPending={query.isFetching}>
            Aplicar filtros
          </Button>
          <Button isDisabled={!query.data || query.isFetching} onPress={exportCsv}>
            Exportar CSV
          </Button>
        </div>
        {error ? <FormNotice message={error} /> : null}
      </form>
      {query.isPending ? (
        <LoadingState label="Cargando reportes" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Aprobación", query.data.quality.approval_rate + "%"],
              ["Rechazo", query.data.quality.rejection_rate + "%"],
              ["Observados", query.data.quality.observed_rate + "%"],
              [
                "Recepción a dictamen",
                query.data.quality.reception_to_decision_hours === null
                  ? "Sin datos"
                  : query.data.quality.reception_to_decision_hours + " h",
              ],
              [
                "Duración de inspección",
                query.data.quality.inspection_hours === null
                  ? "Sin datos"
                  : query.data.quality.inspection_hours + " h",
              ],
              ["Incidencias graves sin cerrar", query.data.open_critical_incidents],
              ["Detecciones IA confirmadas", query.data.ai_review.confirmed],
              ["Detecciones IA descartadas", query.data.ai_review.discarded],
              ["Evidencias con solicitud IA", query.data.ai_review.requested_evidences],
            ].map(([label, value]) => (
              <article key={label} className="rounded-card border border-border bg-surface p-5">
                <h2 className="text-sm text-muted">{label}</h2>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-card border border-border bg-surface p-5">
              <h2 className="mb-3 font-semibold">Hallazgos manuales frecuentes</h2>
              {query.data.frequent_defects.length ? (
                query.data.frequent_defects.map((item) => (
                  <p key={item.clase} className="flex justify-between gap-3">
                    <span>{item.clase}</span>
                    <strong>{item.total}</strong>
                  </p>
                ))
              ) : (
                <p className="text-muted">Sin hallazgos en este periodo.</p>
              )}
            </section>
            <section className="rounded-card border border-border bg-surface p-5">
              <h2 className="mb-3 font-semibold">Incidencias por producto</h2>
              {query.data.incidents_by_product.map((item) => (
                <p key={item.producto} className="flex justify-between gap-3">
                  <span>{item.producto}</span>
                  <strong>{item.total}</strong>
                </p>
              ))}
            </section>
            <section className="rounded-card border border-border bg-surface p-5 sm:col-span-2">
              <h2 className="mb-3 font-semibold">Resultados por productor</h2>
              {query.data.quality_by_producer.map((item) => (
                <p key={item.id_productor + item.decision} className="flex justify-between gap-3">
                  <span>
                    {item.productor} · {item.decision.toLocaleLowerCase("es")}
                  </span>
                  <strong>{item.total}</strong>
                </p>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
