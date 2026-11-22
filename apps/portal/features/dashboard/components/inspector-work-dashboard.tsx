"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Chip, Tabs } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import {
  FiArrowRight,
  FiBox,
  FiCamera,
  FiCheckCircle,
  FiClipboard,
  FiAlertTriangle,
} from "react-icons/fi";
import { InlineNotice } from "@agrocloud/ui";
import type { z } from "zod";
import type { dashboardResponse } from "@/features/agricultural/operations-schema";

type DashboardData = z.infer<typeof dashboardResponse>;
function taskKind(href: string) {
  const path = href.split(/[?#]/)[0] ?? "";
  if (/^\/lots\/[^/]+\/sampling\/?$/.test(path)) return "sampling";
  if (/^\/(inspections|samplings)\//.test(path)) return "inspection";
  return "other";
}
const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
export function InspectorWorkDashboard({
  data,
  updatedAt,
}: {
  data: DashboardData;
  updatedAt: number;
}) {
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState("all");
  const primaryKeys = ["sampling", "inspection", "ai_failed"];
  const primary = primaryKeys.flatMap((key) => data.metrics.filter((metric) => metric.key === key));
  const secondary = data.metrics.filter((metric) => !primaryKeys.includes(metric.key));
  const failed = data.metrics.find((metric) => metric.key === "ai_failed");
  const categories = new Set(data.tasks.map((task) => taskKind(task.href)));
  const showTabs = data.tasks.length > 3 && categories.size > 1;
  const tasks = data.tasks.filter(
    (task) => !showTabs || filter === "all" || taskKind(task.href) === filter,
  );
  return (
    <motion.section
      aria-label="Jornada de inspección"
      className="space-y-6"
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.16 }}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {primary.map((metric) => {
          const warning = metric.key === "ai_failed" && metric.value > 0;
          const Icon =
            metric.key === "sampling"
              ? FiBox
              : metric.key === "inspection"
                ? FiClipboard
                : FiAlertTriangle;
          return (
            <Link
              key={metric.key}
              href={metric.href}
              className={"group min-w-0 rounded-2xl " + focusClass}
            >
              <Card
                className={
                  "h-full rounded-2xl border shadow-sm transition-colors motion-reduce:transition-none " +
                  (warning
                    ? "border-warning/40 bg-warning/5 group-hover:border-warning"
                    : "border-border bg-surface group-hover:border-accent/40")
                }
              >
                <Card.Content className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <Icon
                      aria-hidden="true"
                      className={"size-5 shrink-0 " + (warning ? "text-warning" : "text-accent")}
                    />
                  </div>
                  <p className="text-3xl font-semibold tabular-nums">{metric.value}</p>
                  <p className="text-xs leading-relaxed text-muted">
                    {metric.key === "sampling"
                      ? "Pendientes del equipo · Lotes de la empresa"
                      : metric.key === "inspection"
                        ? "Mis tareas y disponibles · Asignadas a ti o sin inspector"
                        : "En inspecciones asignadas a ti o sin inspector"}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                    {metric.key === "sampling" ? "Ver lotes" : "Revisar inspecciones"}
                    <FiArrowRight aria-hidden="true" />
                  </span>
                </Card.Content>
              </Card>
            </Link>
          );
        })}
      </div>
      {secondary.length ? (
        <section
          aria-label="Otros pendientes"
          className="rounded-2xl border border-border bg-surface px-5 py-4"
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Otros pendientes
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {secondary.map((metric) => (
              <Link
                key={metric.key}
                href={metric.href}
                className={"flex min-w-0 items-center gap-3 rounded-lg " + focusClass}
              >
                <span className="text-xl font-semibold tabular-nums">{metric.value}</span>
                <span className="text-sm text-muted">{metric.label}</span>
                <FiArrowRight aria-hidden="true" className="ml-auto shrink-0 text-accent" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {failed && failed.value > 0 ? (
        <section
          aria-label="Análisis de IA que requieren revisión"
          className="space-y-3 rounded-2xl border border-warning/40 bg-warning/5 p-5"
        >
          <InlineNotice
            status="warning"
            title={
              failed.value === 1
                ? "Hay 1 análisis de IA con error"
                : "Hay " + failed.value + " análisis de IA con error"
            }
            description="Revisa las evidencias afectadas para determinar si corresponde reintentar el análisis o continuar con una evaluación manual."
          />
          <Link
            href={failed.href}
            className={
              "inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-accent " +
              focusClass
            }
          >
            Revisar inspecciones
            <FiArrowRight aria-hidden="true" />
          </Link>
        </section>
      ) : null}
      <section className="space-y-4" aria-labelledby="inspection-activities">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="inspection-activities" className="text-lg font-semibold">
              Actividades para continuar
            </h2>
            <p className="mt-1 text-sm text-muted">
              Muestreos del equipo e inspecciones disponibles para ti.
            </p>
          </div>
          <Chip size="sm" variant="soft">
            {data.tasks.length}{" "}
            {data.tasks.length === 1 ? "actividad mostrada" : "actividades mostradas"}
          </Chip>
        </div>
        {showTabs ? (
          <Tabs
            variant="secondary"
            selectedKey={filter}
            onSelectionChange={(key) => setFilter(String(key))}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Filtrar actividades">
                {[
                  ["all", "Todas"],
                  ["sampling", "Muestreos"],
                  ["inspection", "Inspecciones"],
                  ...(categories.has("other") ? [["other", "Otras"]] : []),
                ].map(([key, label]) => (
                  <Tabs.Tab key={key} id={key}>
                    {label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        ) : null}
        {tasks.length ? (
          <ul className="grid gap-3 lg:grid-cols-2">
            {tasks.map((task, index) => {
              const kind = taskKind(task.href);
              const Icon =
                kind === "sampling" ? FiBox : kind === "inspection" ? FiClipboard : FiCamera;
              return (
                <li key={task.href + task.label + index}>
                  <Link
                    href={task.href}
                    className={
                      "group flex h-full min-w-0 items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40 motion-reduce:transition-none " +
                      focusClass
                    }
                  >
                    <span className="shrink-0 rounded-xl bg-accent/10 p-3 text-accent">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold">{task.label}</h3>
                      <p className="mt-1 text-xs text-muted">
                        {kind === "sampling"
                          ? "Pendiente del equipo · Realizar muestreo"
                          : kind === "inspection"
                            ? "Actividad de inspección disponible"
                            : "Actividad pendiente"}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent">
                        {kind === "sampling"
                          ? "Ir al muestreo"
                          : kind === "inspection"
                            ? "Abrir inspección"
                            : "Ver actividad"}
                        <FiArrowRight aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-6">
            <FiCheckCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <h3 className="font-semibold">
                {data.tasks.length
                  ? "No hay actividades en este filtro"
                  : "No hay actividades en esta bandeja"}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {data.tasks.length
                  ? "Selecciona otra categoría para continuar."
                  : "Consulta los indicadores para revisar otros pendientes disponibles."}
              </p>
            </div>
          </div>
        )}
        <p className="text-xs leading-relaxed text-muted">
          La bandeja muestra una selección de actividades disponibles; su cantidad no equivale al
          total de los indicadores. El orden no representa una prioridad ni una fecha límite.
        </p>
      </section>
      {updatedAt > 0 ? (
        <p className="text-xs text-muted">
          Datos consultados a las{" "}
          {new Intl.DateTimeFormat("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Lima",
          }).format(updatedAt)}{" "}
          (hora de Perú).
        </p>
      ) : null}
    </motion.section>
  );
}
