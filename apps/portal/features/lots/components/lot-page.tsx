"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import { CreationDrawer } from "@/components/creation-drawer";
import { RouteDrawer } from "@/components/route-drawer";
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
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
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
  if (mode === "new")
    return (
      <RouteDrawer
        title="Registrar lote"
        description="Identifica el producto, asocia al productor y programa su llegada."
        back={canRead ? "/lots" : "/dashboard"}
        background={canRead ? <LotPage mode="list" /> : null}
      >
        <LotForm
          canRead={canRead}
          canReadProducers={canManageCompany(actor, "productores.ver")}
          onSaved={() => router.replace(canRead ? "/lots" : "/dashboard")}
        />
      </RouteDrawer>
    );
  return (
    <section className="space-y-6">
      <PageHeader
        title="Lotes"
        description="Organiza tus lotes y continúa la recepción, el muestreo y la inspección."
        actions={
          canCreate ? (
            <CreationDrawer
              open={creating}
              busy={busy}
              onOpenChange={setCreating}
              title="Registrar lote"
              description="Identifica el producto, asocia al productor y programa su llegada."
              trigger={
                <Button variant="primary" onPress={() => setCreating(true)}>
                  <FiPlus aria-hidden="true" />
                  Registrar lote
                </Button>
              }
            >
              <LotForm
                canRead={canRead}
                canReadProducers={canManageCompany(actor, "productores.ver")}
                onSaved={() => setCreating(false)}
                onBusyChange={setBusy}
              />
            </CreationDrawer>
          ) : undefined
        }
      />
      <LotList />
    </section>
  );
}
