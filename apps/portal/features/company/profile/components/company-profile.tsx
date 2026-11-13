"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { ErrorState, LoadingState, PageHeader } from "@agrocloud/ui";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { useCompanyProfile } from "../hooks";
import { CompanyEditor } from "./company-editor";

/** Vista empresarial: no consulta endpoints administrativos. */
export function CompanyProfile() {
  const { data: actor } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const company = useCompanyProfile();
  const profile = company.data?.data;

  return (
    <section className="space-y-4">
      <PageHeader title="Mi empresa" />
      {company.isPending ? <LoadingState label="Cargando datos de la empresa" /> : null}
      {company.isError ? (
        <ErrorState error={company.error} retry={() => void company.refetch()} />
      ) : null}
      {profile ? (
        <dl className="grid gap-4 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
          {[
            ["Razón social", profile.razon_social],
            ["RUC", profile.ruc],
            ["Nombre comercial", profile.nombre_comercial],
            ["Tipo", profile.tipo_empresa],
            ["Dirección", profile.direccion],
            ["Correo", profile.correo],
            ["Teléfono", profile.telefono],
            [
              "Estado",
              typeof profile.estado === "boolean"
                ? profile.estado
                  ? "Activa"
                  : "Inactiva"
                : profile.estado,
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="break-words">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {profile && canManageCompany(actor, "empresa.editar") ? (
        editing ? (
          <CompanyEditor close={() => setEditing(false)} profile={profile} />
        ) : (
          <Button variant="secondary" onPress={() => setEditing(true)}>
            Editar empresa
          </Button>
        )
      ) : null}
    </section>
  );
}
