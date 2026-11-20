"use client";
import { useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";
import { ErrorState, LoadingState } from "@agrocloud/ui";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { useAi, useDebouncedModel } from "../hooks";
import { inferencePage, inferenceResult } from "../schema";
export function InferenceHistory() {
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState("");
  const [model, setModel] = useState("");
  const selectedModel = useDebouncedModel(model);
  const [selected, setSelected] = useState("");
  const page = useAi("inferences", inferencePage, {
    offset,
    limit: 30,
    days: 30,
    status: status || undefined,
    model_id: selectedModel || undefined,
  });
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted">
        Historial técnico global de los últimos 30 días. El servicio no identifica empresa, lote o
        inspección. No se muestran imágenes en esta vista.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <CatalogSelect
          label="Estado"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setOffset(0);
          }}
          optional
          emptyLabel="Todos los estados"
          items={[
            { id: "completed", name: "Completadas" },
            { id: "failed", name: "Fallidas" },
            { id: "processing", name: "En procesamiento" },
          ]}
        />
        <TextField
          value={model}
          onChange={(value) => {
            setModel(value);
            setOffset(0);
          }}
        >
          <Label>Modelo exacto (opcional)</Label>
          <Input maxLength={200} />
        </TextField>
      </div>
      {page.isPending ? (
        <LoadingState label="Cargando historial de inferencias" />
      ) : page.isError ? (
        <ErrorState error={page.error} retry={() => page.refetch()} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[
                    "Fecha",
                    "Modelo",
                    "Estado",
                    "Umbral",
                    "Detecciones",
                    "Duración",
                    "Detalle",
                  ].map((title) => (
                    <th key={title} className="p-3 text-left">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.data.items.map((run) => (
                  <tr key={run.request_id} className="border-t border-border">
                    <td className="p-3">{new Date(run.created_at).toLocaleString("es-PE")}</td>
                    <td className="max-w-60 break-all p-3">{run.model_id}</td>
                    <td className="p-3">
                      {
                        {
                          completed: "Completada",
                          failed: "Fallida",
                          processing: "En procesamiento",
                        }[run.status]
                      }
                      {run.error_type ? ` · ${run.error_type}` : ""}
                    </td>
                    <td className="p-3">
                      {run.threshold == null ? "Sin registro histórico" : `${run.threshold * 100}%`}
                    </td>
                    <td className="p-3">{run.detection_count}</td>
                    <td className="p-3">{run.total_ms == null ? "—" : run.total_ms + " ms"}</td>
                    <td className="p-3">
                      {run.status === "completed" ? (
                        <Button size="sm" onPress={() => setSelected(run.request_id)}>
                          Consultar
                        </Button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {page.data.items.length === 0 ? (
              <p className="p-5 text-muted">No hay inferencias para estos filtros.</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <Button isDisabled={offset === 0} onPress={() => setOffset(Math.max(0, offset - 30))}>
              Anterior
            </Button>
            <span>
              {page.data.total} ejecuciones · Página {Math.floor(offset / 30) + 1}
            </span>
            <Button
              isDisabled={offset + 30 >= page.data.total}
              onPress={() => setOffset(offset + 30)}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}
      {selected ? <InferenceDetail key={selected} requestId={selected} /> : null}
    </section>
  );
}
function InferenceDetail({ requestId }: { requestId: string }) {
  const query = useAi(`inferences/${requestId}`, inferenceResult);
  if (query.isPending) return <LoadingState label="Cargando resultado" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  return (
    <section className="space-y-2 rounded-card border border-border bg-surface p-5">
      <h2 className="font-semibold">Resultado técnico seleccionado</h2>
      <p className="break-all text-xs text-muted">{query.data.request_id}</p>
      <p>{query.data.summary.conclusion}</p>
      {query.data.detections.map((item) => (
        <p key={item.id}>
          {item.class_name.replaceAll("_", " ")} · {(item.confidence * 100).toFixed(1)}% de
          confianza
        </p>
      ))}
      <p className="text-sm text-muted">
        La confianza no equivale a una probabilidad calibrada de infestación.
      </p>
    </section>
  );
}
