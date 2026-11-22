"use client";
import type { z } from "zod";
import { motion, useReducedMotion } from "motion/react";
import type { reportSummary } from "../schema";
import {
  ReportBars,
  ReportChartCard,
  ReportDataTable,
  ReportDistribution,
  ReportEmptyState,
  ReportMetricCard,
} from "./report-visuals";
type Summary = z.infer<typeof reportSummary>;
const decisions = [
  { key: "APROBADO", label: "Aprobados", color: "#14805e", className: "bg-success" },
  { key: "RECHAZADO", label: "Rechazados", color: "#c54048", className: "bg-danger" },
  { key: "OBSERVADO", label: "Observados", color: "#b57915", className: "bg-warning" },
];
export function QualityResults({ data }: { data: Summary }) {
  const reducedMotion = useReducedMotion();
  const quality = data.quality;
  const evaluable = quality.decided_lots > 0;
  const counts = decisions.map((decision) =>
    data.quality_by_producer
      .filter((row) => row.decision === decision.key)
      .reduce((sum, row) => sum + row.total, 0),
  );
  const exact = counts.reduce((a, b) => a + b, 0) === quality.decided_lots;
  const rates = [quality.approval_rate, quality.rejection_rate, quality.observed_rate];
  let cumulative = 0;
  const stops = decisions.map((decision, index) => {
    const start = cumulative;
    cumulative += rates[index] ?? 0;
    return decision.color + " " + start + "% " + cumulative + "%";
  });
  const producers = Array.from(
    new Set(data.quality_by_producer.map((row) => row.id_productor)),
  ).map((id) => ({
    id,
    name: data.quality_by_producer.find((row) => row.id_productor === id)!.productor,
    values: decisions.map((decision) =>
      data.quality_by_producer
        .filter((row) => row.id_productor === id && row.decision === decision.key)
        .reduce((sum, row) => sum + row.total, 0),
    ),
  }));
  const max = Math.max(1, ...producers.map((row) => row.values.reduce((a, b) => a + b, 0)));
  return (
    <motion.div
      className="space-y-6"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.15 }}
    >
      <div>
        <h2 className="text-lg font-semibold">Resumen de calidad</h2>
        <p className="mt-1 text-sm text-muted">
          Indicadores de los lotes registrados en el periodo aplicado.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetricCard title="Lotes con dictamen" value={quality.decided_lots} />
        <ReportMetricCard
          title="Tasa de aprobación"
          value={evaluable ? quality.approval_rate + "%" : "No evaluable"}
          description={evaluable ? "Sobre lotes con dictamen." : "Sin dictámenes registrados."}
        />
        <ReportMetricCard
          title="Incidencias graves sin cerrar"
          value={data.open_critical_incidents}
        />
        <ReportMetricCard
          title="Recepción a dictamen"
          value={
            quality.reception_to_decision_hours === null
              ? "Sin datos"
              : quality.reception_to_decision_hours + " h"
          }
          description="Tiempo promedio en horas."
        />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <ReportChartCard title="Distribución de dictámenes">
          {evaluable ? (
            <>
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div
                  className="grid size-40 shrink-0 place-items-center rounded-full"
                  aria-hidden="true"
                  style={{ background: "conic-gradient(" + stops.join(",") + ")" }}
                >
                  <div className="grid size-28 place-content-center rounded-full bg-surface text-center">
                    <strong className="text-2xl tabular-nums">{quality.decided_lots}</strong>
                    <span className="text-xs text-muted">con dictamen</span>
                  </div>
                </div>
                <ul className="w-full space-y-3">
                  {decisions.map((decision, index) => (
                    <li key={decision.key} className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        aria-hidden="true"
                        className={"size-2 rounded-full " + decision.className}
                      />
                      <span className="flex-1">{decision.label}</span>
                      <strong>
                        {exact ? counts[index] + " · " : ""}
                        {rates[index]}%
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
              {!exact ? (
                <p className="text-xs text-muted">
                  El resumen proporciona porcentajes; el desglose por productor no permite confirmar
                  todas las cantidades absolutas.
                </p>
              ) : null}
            </>
          ) : (
            <ReportEmptyState>
              Sin dictámenes registrados. Las tasas de aprobación, rechazo y observación todavía no
              son evaluables.
            </ReportEmptyState>
          )}
        </ReportChartCard>
        <ReportBars
          title="Hallazgos manuales frecuentes"
          rows={data.frequent_defects.map((row) => ({
            label: row.clase.replaceAll("_", " "),
            value: row.total,
          }))}
        />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <ReportDistribution
          title="Estados de los lotes"
          rows={data.lots_by_status.map((row) => ({
            label: row.estado.replaceAll("_", " "),
            value: row.total,
          }))}
        />
        <ReportDistribution
          title="Estados de las inspecciones"
          rows={data.inspections_by_status.map((row) => ({
            label: row.estado.replaceAll("_", " "),
            value: row.total,
          }))}
        />
      </div>
      <ReportChartCard title="Resultados por productor">
        {producers.length ? (
          <>
            <p className="text-xs text-muted">
              Cantidades de dictámenes por productor y decisión. Las barras comparten la misma
              escala.
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              {decisions.map((decision) => (
                <span key={decision.key} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={"size-2 rounded-full " + decision.className}
                  />
                  {decision.label}
                </span>
              ))}
            </div>
            <ul className="space-y-4">
              {producers.map((row) => (
                <li key={row.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="break-words">{row.name}</span>
                    <strong>{row.values.reduce((a, b) => a + b, 0)}</strong>
                  </div>
                  <div
                    aria-hidden="true"
                    className="flex h-3 overflow-hidden rounded-full bg-default"
                  >
                    {row.values.map((value, index) => (
                      <span
                        key={index}
                        className={decisions[index]!.className}
                        style={{ width: (100 * value) / max + "%" }}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {decisions
                      .map((decision, index) => decision.label + ": " + row.values[index])
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <ReportEmptyState />
        )}
      </ReportChartCard>
      <ReportDataTable
        title="Detalle por productor"
        columns={["Productor", "Decisión", "Lotes"]}
        rows={data.quality_by_producer.map((row) => ({
          id: row.id_productor + ":" + row.decision,
          cells: [row.productor, row.decision.replaceAll("_", " "), row.total],
        }))}
      />
      <ReportBars
        title="Incidencias por producto"
        rows={data.incidents_by_product.map((row) => ({ label: row.producto, value: row.total }))}
      />
      <section className="space-y-3">
        <h2 className="font-semibold">IA y tiempos complementarios</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ReportMetricCard
            title="Duración media de inspección"
            value={
              quality.inspection_hours === null ? "Sin datos" : quality.inspection_hours + " h"
            }
          />
          <ReportMetricCard title="Detecciones IA confirmadas" value={data.ai_review.confirmed} />
          <ReportMetricCard title="Detecciones IA descartadas" value={data.ai_review.discarded} />
          <ReportMetricCard
            title="Evidencias con solicitud IA"
            value={data.ai_review.requested_evidences}
          />
        </div>
        <p className="text-xs text-muted">
          Las decisiones humanas sobre propuestas IA no equivalen a precisión, recall ni mAP del
          modelo.
        </p>
      </section>
    </motion.div>
  );
}
