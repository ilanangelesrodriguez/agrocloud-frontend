"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { FiEdit3, FiArrowLeft } from "react-icons/fi";
import { LoadingState, PageHeader, ErrorState, InlineNotice } from "@agrocloud/ui";
import type { UserPolicy } from "../policy";
import { useUserDetail } from "../hooks";
import { userStatus } from "./user-status";
import { SharedUserForm } from "./user-form";

export function SharedUserDetails({ id, policy }: { id: string; policy: UserPolicy }) {
  const { scope } = policy;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const user = useUserDetail(scope, policy.canRead, id);

  if (!policy.canRead) {
    return (
      <InlineNotice
        title="Acceso restringido"
        status="warning"
        description="No tienes permiso para consultar usuarios."
      />
    );
  }
  const record = user.data?.data;

  return (
    <section className="space-y-4">
      <PageHeader title="Detalle de usuario" />
      {user.isPending ? (
        <LoadingState label="Cargando usuario" />
      ) : user.isError ? (
        <ErrorState
          error={user.error}
          retry={() => {
            void user.refetch();
          }}
        />
      ) : record ? (
        <div className="space-y-4 rounded-card border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">
            {record.nombre} {record.apellido}
          </h2>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="inline font-semibold">Correo </dt>
              <dd className="inline break-words">{record.correo}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Rol </dt>
              <dd className="inline">{record.rol?.nombre ?? "Sin rol"}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Estado </dt>
              <dd className="inline">{userStatus(record)}</dd>
            </div>
            {record.cargo ? (
              <div>
                <dt className="inline font-semibold">Cargo </dt>
                <dd className="inline">{record.cargo}</dd>
              </div>
            ) : null}
            {record.telefono ? (
              <div>
                <dt className="inline font-semibold">Teléfono </dt>
                <dd className="inline">{record.telefono}</dd>
              </div>
            ) : null}
          </dl>
          {policy.canEdit && record.rol?.codigo !== "SUPERADMIN" ? (
            <Button isDisabled={saving} variant="secondary" onPress={() => setEditing(!editing)}>
              {editing ? <FiArrowLeft aria-hidden="true" /> : <FiEdit3 aria-hidden="true" />}
              {editing ? "Volver al detalle" : "Editar usuario"}
            </Button>
          ) : null}
          {editing && policy.canEdit && record.rol?.codigo !== "SUPERADMIN" ? (
            <SharedUserForm
              key={JSON.stringify([
                id,
                record.rol?.id_rol,
                record.estado,
                record.pending_activation,
                record.nombre,
                record.apellido,
                record.telefono,
                record.cargo,
              ])}
              policy={policy}
              onSaved={() => setEditing(false)}
              onBusyChange={setSaving}
              user={record}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
