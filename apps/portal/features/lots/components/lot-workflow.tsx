"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { InlineNotice, StatusBadge } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import type { Lot } from "../schema";
const phases = [
  { name: "Ingreso", keys: ["reception"] },
  { name: "Inspección", keys: ["sampling", "inspection", "evidence"] },
  { name: "Análisis y revisión", keys: ["analysis", "review"] },
  { name: "Resultado", keys: ["validation", "decision"] },
];
export function LotWorkflow({
  lot,
  onOpenIncidents,
}: {
  lot: Lot;
  active?: string;
  onOpenIncidents?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const { data: actor } = useCurrentUser();
  const flow = lot.workflow;
  if (!flow)
    return (
      <InlineNotice
        status="warning"
        title="Resumen operativo no disponible"
        description="Actualiza el expediente cuando el servicio agrícola esté disponible."
      />
    );
  const action = flow.nextAction;
  const required = flow.stages.filter((stage) => stage.key !== "analysis");
  const done = required.filter((stage) => stage.done).length;
  const current = flow.stages.find((stage) => stage.key === flow.currentStage);
  const canContinue =
    !!action && action.canExecute !== false && canManageCompany(actor, action.permission);
  return (
    <motion.section
      className="space-y-4"
      aria-label="Continuidad operativa del lote"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.15 }}
    >
      {action ? (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-accent/25 bg-accent/5 p-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Siguiente actividad
            </h2>
            <p className="mt-2 break-words text-lg font-semibold">{action.label}</p>
            {!canContinue ? (
              <p className="mt-2 text-sm text-muted">
                {flow.currentStage === "reception"
                  ? "La recepción debe ser confirmada por el personal autorizado."
                  : flow.blockingReasons.length
                    ? "Revisa los requisitos indicados antes de continuar."
                    : "Esta actividad corresponde al equipo autorizado para realizarla."}
              </p>
            ) : null}
          </div>
          {canContinue ? (
            <Link
              href={
                flow.currentStage === "blocked" && action.permission === "incidencias.ver"
                  ? `/lots/${lot.id_lote}#incidents`
                  : action.href
              }
              onClick={(event) => {
                if (
                  flow.currentStage === "blocked" &&
                  action.permission === "incidencias.ver" &&
                  onOpenIncidents &&
                  !event.ctrlKey &&
                  !event.metaKey &&
                  !event.shiftKey &&
                  !event.altKey
                ) {
                  event.preventDefault();
                  onOpenIncidents();
                }
              }}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
            >
              Continuar →
            </Link>
          ) : null}
        </div>
      ) : (
        <InlineNotice
          status={flow.currentStage === "completed" ? "success" : "warning"}
          title={
            flow.currentStage === "completed"
              ? "Flujo completado"
              : flow.currentStage === "rejected"
                ? "Lote rechazado"
                : flow.currentStage === "cancelled"
                  ? "Lote anulado"
                  : "Sin siguiente actividad disponible"
          }
          description="Consulta el dictamen y la trazabilidad para revisar el resultado."
        />
      )}
      {flow.blockingReasons.length ? (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <h3 className="text-sm font-semibold">Atención requerida</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
            {flow.blockingReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Progreso del lote</h2>
          <p className="text-xs text-muted">
            {done} de {required.length} etapas obligatorias completadas
          </p>
        </div>
        {current ? <p className="text-sm text-muted">Etapa actual: {current.label}</p> : null}
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {phases.map((phase, index) => {
            const stages = flow.stages.filter((stage) => phase.keys.includes(stage.key));
            const mandatory = stages.filter((stage) => stage.key !== "analysis");
            const complete = mandatory.length > 0 && mandatory.every((stage) => stage.done);
            const active = phase.keys.includes(flow.currentStage);
            return (
              <li key={phase.name}>
                <details
                  className={
                    "h-full rounded-xl border p-3 " +
                    (active ? "border-accent bg-accent/5" : "border-border")
                  }
                >
                  <summary className="flex cursor-pointer list-none items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold " +
                        (complete
                          ? "bg-success/15 text-success"
                          : active
                            ? "bg-accent text-accent-foreground"
                            : "bg-default text-muted")
                      }
                    >
                      {complete ? <FiCheck /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium">
                      {phase.name}
                      {active ? (
                        <span className="block text-xs text-accent">En curso</span>
                      ) : complete ? (
                        <span className="block text-xs text-muted">Completada</span>
                      ) : null}
                    </span>
                    <FiChevronDown aria-hidden="true" className="shrink-0 text-muted" />
                  </summary>
                  <ul className="mt-4 space-y-3 border-t border-border pt-3">
                    {stages.map((stage) => (
                      <li key={stage.key} className="space-y-1">
                        <p className="text-xs font-medium">{stage.label}</p>
                        <StatusBadge tone={stage.done ? "success" : "neutral"}>
                          {stage.status === "manual"
                            ? "Vía manual"
                            : stage.done
                              ? "Completada"
                              : stage.status === "in_progress"
                                ? "En proceso"
                                : stage.key === "analysis"
                                  ? "Opcional"
                                  : "Pendiente"}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ol>
        <p className="text-xs leading-relaxed text-muted">
          La IA es opcional y no se incluye en el total de etapas obligatorias. La continuidad y los
          requisitos se toman del flujo del servicio agrícola.
        </p>
        {flow.evidenceProgress ? (
          <p className="border-t border-border pt-3 text-xs text-muted">
            Frutos fotografiados: {flow.evidenceProgress.captured_fruits} de{" "}
            {flow.evidenceProgress.sampled_fruits} · Revisados:{" "}
            {flow.evidenceProgress.reviewed_fruits} de {flow.evidenceProgress.sampled_fruits}
          </p>
        ) : null}
      </div>
    </motion.section>
  );
}
