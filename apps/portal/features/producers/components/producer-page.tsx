"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { ResourceShell } from "@/features/agricultural/shared/resource-shell";
import { ProducerList } from "./producer-list";
import { ProducerDetails } from "./producer-details";
import { ProducerForm } from "./producer-form";

export function ProducerPage({
  mode,
  id,
}: {
  mode: "list" | "new" | "detail" | "edit";
  id?: string;
}) {
  const session = useCurrentUser();
  const actor = session.data;
  const canRead = canManageCompany(actor, "productores.ver");
  const canCreate = canManageCompany(actor, "productores.crear");
  const canEdit = canManageCompany(actor, "productores.editar");
  const allowed = mode === "new" ? canCreate : mode === "edit" ? canRead && canEdit : canRead;

  return (
    <ResourceShell
      title="Productores"
      base="/producers"
      mode={mode}
      canRead={canRead}
      canCreate={canCreate}
      allowed={allowed}
      isPending={session.isPending}
      createForm={(onSaved, onBusyChange) => (
        <ProducerForm canRead={canRead} onSaved={onSaved} onBusyChange={onBusyChange} />
      )}
    >
      {(mode === "list" || mode === "new") && canRead ? <ProducerList /> : null}
      {id && (mode === "detail" || mode === "edit") ? (
        <ProducerDetails id={id} edit={mode === "edit"} canEdit={canEdit} />
      ) : null}
    </ResourceShell>
  );
}
