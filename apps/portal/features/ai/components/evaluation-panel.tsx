"use client";
import { useState } from "react";
import { ErrorState, InlineNotice, LoadingState } from "@agrocloud/ui";
import { useAi } from "../hooks";
import { aiEvaluation, confusionMatrix } from "../schema";
import { AiBars, AiMetrics, displayClass, percent } from "./ai-shared";
export function EvaluationPanel() {
  const evaluation = useAi("model/evaluation", aiEvaluation, { version: 2 });
  const matrix = useAi("model/confusion-matrix", confusionMatrix, { version: 2 });
  const [selected, setSelected] = useState("");
  if (evaluation.isPending || matrix.isPending)
    return <LoadingState label="Cargando evaluación científica V2" />;
  if (evaluation.isError)
    return <ErrorState error={evaluation.error} retry={() => evaluation.refetch()} />;
  if (matrix.isError) return <ErrorState error={matrix.error} retry={() => matrix.refetch()} />;
  const data = evaluation.data;
  const metric = data.test_metrics;
  return (
    <section className="space-y-5">
      <InlineNotice
        status="accent"
        title={`Evaluación histórica · Dataset V${data.metadata.dataset_version}`}
        description={`Snapshot del ${new Date(data.metadata.evaluation_created_at).toLocaleDateString("es-PE")}. Conjunto Test: ${data.dataset.splits.test} imágenes. Estas métricas no son estadísticas de producción.`}
      />
      <AiMetrics
        items={[
          { label: "mAP@50", value: percent(metric.map50) },
          { label: "mAP@50–95", value: percent(metric.map50_95) },
          { label: "Precisión", value: percent(metric.precision) },
          { label: "Recall", value: percent(metric.recall) },
          { label: "F1 reportado por Roboflow", value: percent(metric.f1_reported) },
          {
            label: "Latencia mediana en evaluación",
            value: metric.median_latency_ms == null ? "Sin dato" : `${metric.median_latency_ms} ms`,
          },
          { label: "Imágenes", value: data.dataset.images },
          { label: "Anotaciones", value: data.dataset.annotations },
        ]}
      />
      <p className="text-sm text-muted">
        El mAP no equivale a exactitud. El F1 reportado conserva el método de agregación de la
        evaluación original.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <AiBars
          title="Distribución del dataset"
          rows={Object.entries(data.dataset.splits).map(([key, value]) => ({
            label:
              (
                { train: "Entrenamiento", valid: "Validación", test: "Prueba" } as Record<
                  string,
                  string
                >
              )[key] ?? key,
            value,
          }))}
        />
        <AiBars
          title="Anotaciones por clase"
          rows={Object.entries(data.dataset.annotations_by_class).map(([key, value]) => ({
            label: displayClass(key),
            value,
          }))}
        />
      </div>
      <section className="overflow-x-auto rounded-card border border-border bg-surface p-5">
        <h2 className="mb-3 font-semibold">Rendimiento por clase en Test</h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {["Clase", "Instancias", "mAP@50", "Precisión", "Recall", "F1"].map((label) => (
                <th key={label} className="p-3 text-left">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.per_class_test.map((row) => (
              <tr key={row.class_name} className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium">
                  {displayClass(row.class_name)}
                </th>
                <td className="p-3">{row.ground_truth_instances ?? "—"}</td>
                {[row.map50, row.precision, row.recall, row.f1].map((value, index) => (
                  <td key={index} className="p-3">
                    {percent(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="space-y-3 overflow-x-auto rounded-card border border-border bg-surface p-5">
        <h2 className="font-semibold">Matriz de confusión · Test</h2>
        <p className="text-sm text-muted">
          Filas: clase real. Columnas: predicción. Umbral histórico:{" "}
          {(matrix.data.confidence_threshold * 100).toFixed(0)}%. Background representa omisiones o
          falsos positivos.
        </p>
        <table className="text-xs">
          <caption className="sr-only">Matriz de confusión de la evaluación V2</caption>
          <thead>
            <tr>
              <th scope="col">Real / Predicción</th>
              {matrix.data.classes.map((name) => (
                <th scope="col" className="p-2" key={name}>
                  {displayClass(name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.data.matrix.map((row, i) => (
              <tr key={matrix.data.classes[i]}>
                <th scope="row" className="p-2 text-left">
                  {displayClass(matrix.data.classes[i])}
                </th>
                {row.map((value, j) => (
                  <td key={j} className="border border-border p-1">
                    <button
                      type="button"
                      className={`min-h-10 min-w-12 rounded-lg p-2 ${value ? "bg-accent/15 font-semibold" : "bg-default text-muted"}`}
                      onClick={() =>
                        setSelected(
                          `${displayClass(matrix.data.classes[i])} → ${displayClass(matrix.data.classes[j])}: ${value}`,
                        )
                      }
                      aria-label={`${matrix.data.classes[i]}, predicción ${matrix.data.classes[j]}, ${value}`}
                    >
                      {value}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p aria-live="polite" className="text-sm">
          {selected || "Selecciona una celda para consultar su valor."}
        </p>
      </section>
      <ul className="space-y-2 text-sm text-muted">
        {data.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}
