"use client";
import { useState } from "react";
import { ErrorState, InlineNotice, LoadingState } from "@agrocloud/ui";
import { Input, Label, TextField, FieldError } from "@heroui/react";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { useAi, useDebouncedModel } from "../hooks";
import {
  technicalOverview,
  technicalDaily,
  technicalErrors,
  technicalClasses,
  aiReady,
} from "../schema";
import { AiBars, AiMetrics, displayClass } from "./ai-shared";
export function MonitoringPanel() {
  const [days, setDays] = useState("30");
  const [model, setModel] = useState("");
  const selectedModel = useDebouncedModel(model);
  const filters = { days: Number(days), model_id: selectedModel || undefined };
  const overview = useAi("stats/overview", technicalOverview, filters, true);
  const daily = useAi("stats/daily", technicalDaily, filters, true);
  const errors = useAi("stats/errors", technicalErrors, filters, true);
  const classes = useAi("stats/classes", technicalClasses, filters, true);
  const ready = useAi("ready", aiReady, {}, true);
  return (
    <section className="space-y-5">
      <div className="grid gap-3 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
        <CatalogSelect
          label="Periodo"
          value={days}
          onChange={setDays}
          items={[7, 30, 90, 365].map((day) => ({ id: String(day), name: `${day} días` }))}
        />
        <TextField variant="secondary" value={model} onChange={setModel}>
          <Label>Modelo (identificador exacto, opcional)</Label>
          <Input
            placeholder="Ingresa modelo (identificador exacto, opcional)"
            variant="secondary"
            maxLength={200}
          />
          <FieldError />
        </TextField>
      </div>
      <p className="text-sm text-muted">
        Ámbito global del servicio. Latencias de ejecuciones completadas; actualización cada 30
        segundos mientras la vista está activa.
      </p>
      {overview.isPending ? (
        <LoadingState label="Cargando métricas globales" />
      ) : overview.isError ? (
        <ErrorState error={overview.error} retry={() => overview.refetch()} />
      ) : (
        <AiMetrics
          items={[
            { label: "Inferencias", value: overview.data.total },
            { label: "Completadas", value: overview.data.completed },
            { label: "En procesamiento", value: overview.data.processing },
            { label: "Fallidas", value: overview.data.failed },
            {
              label: "Tasa de éxito",
              value:
                overview.data.success_rate_percent == null
                  ? "Sin datos"
                  : overview.data.success_rate_percent + "%",
            },
            {
              label: "Latencia media",
              value:
                overview.data.mean_total_ms == null
                  ? "Sin datos"
                  : overview.data.mean_total_ms + " ms",
            },
            {
              label: "Latencia p50",
              value:
                overview.data.p50_total_ms == null
                  ? "Sin datos"
                  : overview.data.p50_total_ms + " ms",
            },
            {
              label: "Latencia p95",
              value:
                overview.data.p95_total_ms == null
                  ? "Sin datos"
                  : overview.data.p95_total_ms + " ms",
            },
          ]}
        />
      )}
      {ready.isError ? (
        <InlineNotice
          status="warning"
          title="Disponibilidad no confirmada"
          description="El servicio no informó disponibilidad. No se ejecutó una inferencia contra el proveedor para comprobarla."
        />
      ) : ready.data ? (
        <InlineNotice
          status={ready.data.ready ? "success" : "warning"}
          title={
            ready.data.ready ? "Configuración y base de datos disponibles" : "Servicio no preparado"
          }
          description="Esta comprobación no confirma disponibilidad real de Roboflow ni ejecuta una inferencia."
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {daily.isError ? (
          <ErrorState error={daily.error} retry={() => daily.refetch()} />
        ) : daily.data ? (
          <AiBars
            title="Actividad diaria (UTC)"
            rows={daily.data.items.map((item) => ({
              label: item.day,
              value: item.completed + item.failed + item.processing,
            }))}
          />
        ) : null}
        {errors.isError ? (
          <ErrorState error={errors.error} retry={() => errors.refetch()} />
        ) : errors.data ? (
          <AiBars
            title="Errores registrados"
            rows={errors.data.errors.map((item) => ({
              label: item.error_type ?? "Sin clasificación",
              value: item.count,
            }))}
          />
        ) : null}
        {classes.isError ? (
          <ErrorState error={classes.error} retry={() => classes.refetch()} />
        ) : classes.data ? (
          <AiBars
            title="Predicciones por clase (no precisión científica)"
            rows={classes.data.classes.map((item) => ({
              label: displayClass(item.class_name),
              value: item.count,
            }))}
          />
        ) : null}
      </div>
    </section>
  );
}
