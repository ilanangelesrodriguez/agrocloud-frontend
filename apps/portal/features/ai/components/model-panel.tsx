"use client";
import { ErrorState, InlineNotice, LoadingState } from "@agrocloud/ui";
import { useAi } from "../hooks";
import { aiModel, aiVersions } from "../schema";
import { AiMetrics } from "./ai-shared";
export function ModelPanel() {
  const model = useAi("model", aiModel);
  const versions = useAi("model/versions", aiVersions);
  if (model.isPending || versions.isPending)
    return <LoadingState label="Consultando modelo y versiones" />;
  if (model.isError) return <ErrorState error={model.error} retry={() => model.refetch()} />;
  if (versions.isError)
    return <ErrorState error={versions.error} retry={() => versions.refetch()} />;
  const data = model.data;
  return (
    <section className="space-y-5">
      <AiMetrics
        items={[
          { label: "Familia del modelo", value: data.family ?? "Sin evaluación asociada" },
          { label: "Proveedor", value: data.provider },
          { label: "Confianza mínima efectiva", value: (100 * data.threshold).toFixed(0) + "%" },
          { label: "Concurrencia por proceso", value: data.max_concurrent_inferences },
        ]}
      />
      <div className="space-y-3 rounded-card border border-border bg-surface p-5">
        <h2 className="font-semibold">Configuración desplegada</h2>
        <p className="break-all text-sm">Modelo de inferencia: {data.inference_model_id}</p>
        <p className="break-all text-sm">Modelo entrenado: {data.training_model_id}</p>
        <p className="text-sm">
          Imagen máxima: {(data.max_image_bytes / 1048576).toFixed(1)} MiB ·{" "}
          {data.max_image_pixels.toLocaleString("es-PE")} píxeles
        </p>
        <p className="text-sm">
          Máximo por lote: {data.max_batch_size} · Espera del proveedor:{" "}
          {data.provider_timeout_seconds} s
        </p>
        <p className="text-sm">La revisión humana es obligatoria.</p>
      </div>
      {!data.evaluation_matches_configured ? (
        <InlineNotice
          status="warning"
          title="La evaluación V2 no corresponde al modelo configurado"
          description="El snapshot histórico continúa disponible, pero no representa el rendimiento del modelo desplegado actualmente."
        />
      ) : null}
      <section className="space-y-3 rounded-card border border-border bg-surface p-5">
        <h2 className="font-semibold">Versiones con evaluación registrada</h2>
        {versions.data.versions.map((version) => (
          <article key={version.version} className="rounded-xl border border-border p-4">
            <h3 className="font-medium">
              Dataset V{version.version} · {version.metadata.model_architecture}
            </h3>
            <p className="break-all text-sm text-muted">{version.metadata.model_id}</p>
            <p className="text-sm">
              Evaluación:{" "}
              {new Date(version.metadata.evaluation_created_at).toLocaleDateString("es-PE")} ·{" "}
              {version.is_configured ? "Corresponde al modelo configurado" : "Snapshot histórico"}
            </p>
          </article>
        ))}
      </section>
    </section>
  );
}
