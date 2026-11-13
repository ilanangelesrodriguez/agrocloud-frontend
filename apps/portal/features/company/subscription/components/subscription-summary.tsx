"use client";

import { ErrorState, InlineNotice, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCompanySubscription } from "../hooks";

/** Resumen de derechos provistos por Identity; el checkout sigue en Billing. */
export function CompanySubscription() {
  const plan = useCompanySubscription();
  const subscription = plan.data?.subscription;

  return (
    <section className="space-y-4">
      <PageHeader title="Suscripción" />
      {plan.isError ? (
        <ErrorState error={plan.error} retry={() => void plan.refetch()} />
      ) : plan.isPending ? (
        <LoadingState label="Cargando suscripción" />
      ) : subscription ? (
        <div className="space-y-4 rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">{subscription.plan}</h2>
          <p>
            {plan.data.active ? "Vigente" : "Sin vigencia"} · {subscription.estado}
          </p>
          <p>Vencimiento: {subscription.vence_en.slice(0, 10)}</p>
          <ul className="space-y-2">
            {plan.data.rights.map((right) => (
              <li key={right.recurso} className="flex flex-wrap justify-between gap-2">
                <span>{right.recurso === "analisis_ia" ? "Análisis IA" : right.recurso}</span>
                <span className="tabular-nums">
                  {right.consumido} de {right.limite} utilizados
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <InlineNotice
          status="warning"
          title="Sin suscripción asignada"
          description="Tu empresa no tiene una suscripción asignada actualmente."
        />
      )}
    </section>
  );
}
