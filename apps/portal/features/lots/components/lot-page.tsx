"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { ResourceShell } from "@/features/agricultural/shared/resource-shell";
import { LotList } from "./lot-list";
import { LotDetails } from "./lot-details";
import { LotForm } from "./lot-form";

export function LotPage({ mode, id }: { mode: "list" | "new" | "detail"; id?: string }) {
  const session = useCurrentUser();
  const actor = session.data;
  const canRead = canManageCompany(actor, "lotes.ver");
  const canCreate = canManageCompany(actor, "lotes.crear");
  const allowed = mode === "new" ? canCreate : canRead;

  return (
    <ResourceShell
      title="Lotes"
      base="/lots"
      mode={mode}
      canRead={canRead}
      canCreate={canCreate}
      allowed={allowed}
      isPending={session.isPending}
      createForm={(onSaved, onBusyChange) => <LotForm canRead={canRead} canReadProducers={canManageCompany(actor, "productores.ver")} onSaved={onSaved} onBusyChange={onBusyChange} />}
    >
      {(mode === "list" || mode === "new") && canRead ? <LotList /> : null}
      {id && mode === "detail" ? <LotDetails id={id} /> : null}
    </ResourceShell>
  );
}
