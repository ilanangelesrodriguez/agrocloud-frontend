"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import Link from "next/link";
import { ErrorState, InlineNotice, LoadingState, PageHeader } from "@agrocloud/ui";
import { LotList } from "./lot-list";
import { LotDetails } from "./lot-details";
import { LotForm } from "./lot-form";

export function LotPage({
  mode,
  id,
  stage = "overview",
}: {
  mode: "list" | "new" | "detail";
  id?: string;
  stage?: "overview" | "reception" | "sampling";
}) {
  const session = useCurrentUser();
  const actor = session.data;
  const canRead = canManageCompany(actor, "lotes.ver");
  const canCreate = canManageCompany(actor, "lotes.crear");
  const allowed = mode === "new" ? canCreate : canRead;
  if (session.isPending) return <LoadingState label="Verificando acceso a lotes" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;
  if (!allowed)
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="No tienes permiso para esta operación."
      />
    );
  if (mode === "detail" && id) return <LotDetails id={id} stage={stage} />;
  return (
    <section className="space-y-6">
      <PageHeader
        title={mode === "new" ? "Registrar lote" : "Lotes"}
        description={
          mode === "new"
            ? "Identifica el producto, asocia al productor y programa su llegada para iniciar el flujo operativo."
            : "Organiza tus lotes y continúa la recepción, el muestreo y la inspección."
        }
        actions={
          mode === "list" && canCreate ? (
            <Link
              href="/lots/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
            >
              Registrar lote
            </Link>
          ) : canRead && mode === "new" ? (
            <Link href="/lots" className="text-sm font-medium text-accent">
              Volver a lotes
            </Link>
          ) : undefined
        }
      />
      {mode === "list" ? (
        <LotList />
      ) : (
        <div className="max-w-4xl rounded-2xl border border-border bg-surface p-5 sm:p-8">
          <LotForm
            canRead={canRead}
            canReadProducers={canManageCompany(actor, "productores.ver")}
          />
        </div>
      )}
    </section>
  );
}
