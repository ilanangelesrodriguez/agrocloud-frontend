"use client";
import Link from "next/link";
import { InlineNotice, StatusBadge } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import type { Lot } from "../schema";
export function LotWorkflow({ lot, active }: { lot: Lot; active?: string }) {
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
  return (
    <section className="space-y-4" aria-label="Continuidad operativa del lote">
      <h2 className="text-lg font-semibold">Flujo de trabajo</h2>
      {flow.evidenceProgress ? (
        <p className="text-sm text-muted">
          Frutos fotografiados: {flow.evidenceProgress.captured_fruits} de{" "}
          {flow.evidenceProgress.sampled_fruits} · Revisados:{" "}
          {flow.evidenceProgress.reviewed_fruits} de {flow.evidenceProgress.sampled_fruits}
        </p>
      ) : null}
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {flow.stages.map((stage, index) => (
          <li
            key={stage.key}
            className={`rounded-2xl border bg-surface p-4 ${active === stage.key || flow.currentStage === stage.key ? "border-accent" : "border-border"}`}
          >
            <p className="mb-2 font-semibold">
              {index + 1}. {stage.label}
            </p>
            <StatusBadge tone={stage.done ? "success" : "neutral"}>
              {stage.status === "manual"
                ? "Vía manual disponible"
                : stage.done
                  ? "Completado"
                  : stage.status === "in_progress"
                    ? "En proceso"
                    : "Pendiente"}
            </StatusBadge>
          </li>
        ))}
      </ol>
      {flow.blockingReasons.map((reason) => (
        <InlineNotice
          key={reason}
          status="warning"
          title="Atención requerida"
          description={reason}
        />
      ))}
      {action ? (
        <div className="space-y-3 rounded-card border border-border bg-surface p-5">
          <h3 className="font-semibold">Siguiente actividad</h3>
          <p>{action.label}</p>
          {(action.canExecute ?? canManageCompany(actor, action.permission)) ? (
            <Link
              href={action.href}
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 font-medium text-accent-foreground"
            >
              Continuar
            </Link>
          ) : (
            <p className="text-sm text-muted">
              Esta actividad corresponde al equipo autorizado para realizarla.
            </p>
          )}
        </div>
      ) : (
        <InlineNotice
          status={flow.currentStage === "completed" ? "success" : "warning"}
          title={
            flow.currentStage === "completed"
              ? "Flujo completado"
              : flow.currentStage === "rejected"
                ? "Lote rechazado"
                : "Lote anulado"
          }
          description="Consulta el dictamen y la trazabilidad para revisar el resultado."
        />
      )}
    </section>
  );
}
