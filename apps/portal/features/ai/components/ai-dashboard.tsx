"use client";
import Link from "next/link";
import { ErrorState, InlineNotice, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canReadModel, canMonitorAi, canReadAiHistory } from "../policy";
import { ModelPanel } from "./model-panel";
import { EvaluationPanel } from "./evaluation-panel";
import { MonitoringPanel } from "./monitoring-panel";
import { InferenceHistory } from "./inference-history";
export type AiView = "summary" | "model" | "evaluation" | "monitoring" | "inferences";
export function AiDashboard({ view = "summary" }: { view?: AiView }) {
  const session = useCurrentUser();
  const user = session.data;
  if (session.isPending) return <LoadingState label="Verificando acceso de IA" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;
  const allowed =
    user?.rol?.codigo === "SUPERADMIN" &&
    (view === "model" || view === "evaluation"
      ? canReadModel(user)
      : view === "inferences"
        ? canReadAiHistory(user)
        : canMonitorAi(user));
  if (!allowed)
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="Esta consulta requiere autorización de plataforma para su ámbito de datos."
      />
    );
  const links = [
    { href: "/admin/ai", label: "Resumen", allowed: canMonitorAi(user) },
    { href: "/admin/ai/model", label: "Modelo y versiones", allowed: canReadModel(user) },
    { href: "/admin/ai/evaluation", label: "Evaluación científica", allowed: canReadModel(user) },
    { href: "/admin/ai/monitoring", label: "Monitoreo global", allowed: canMonitorAi(user) },
    {
      href: "/admin/ai/inferences",
      label: "Historial restringido",
      allowed: canReadAiHistory(user),
    },
  ];
  return (
    <section className="space-y-5">
      <PageHeader
        title="Inteligencia artificial"
        description="Evaluación científica histórica y monitoreo técnico global. Las operaciones empresariales permanecen en Agricultural."
      />
      <nav aria-label="Consultas de inteligencia artificial" className="flex flex-wrap gap-2">
        {links
          .filter((item) => item.allowed)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-accent"
            >
              {item.label}
            </Link>
          ))}
      </nav>
      {view === "model" ? (
        <ModelPanel />
      ) : view === "evaluation" ? (
        <EvaluationPanel />
      ) : view === "inferences" ? (
        <InferenceHistory />
      ) : (
        <MonitoringPanel />
      )}
    </section>
  );
}
