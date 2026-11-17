"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import {
  FiBriefcase,
  FiCheckCircle,
  FiEdit3,
  FiFileText,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
} from "react-icons/fi";
import { ErrorState, LoadingState, PageHeader, StatusBadge } from "@agrocloud/ui";
import { CreationDrawer } from "@/components/creation-drawer";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { useCompanyProfile } from "../hooks";
import { CompanyEditor } from "./company-editor";

export function CompanyProfile() {
  const { data: actor } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const company = useCompanyProfile();
  const profile = company.data?.data;
  const canEdit = canManageCompany(actor, "empresa.editar");
  const active =
    profile?.estado === true ||
    (typeof profile?.estado === "string" &&
      ["ACTIVA", "ACTIVO", "ACTIVE"].includes(profile.estado.toUpperCase()));
  const verification = profile?.sunat_verificacion;
  return (
    <section className="min-w-0 space-y-6">
      <PageHeader
        title="Mi empresa"
        description="Información de tu organización, datos de contacto y verificación tributaria."
        actions={
          profile && canEdit ? (
            <CreationDrawer
              open={editing}
              onOpenChange={setEditing}
              busy={saving}
              title="Editar empresa"
              description="Actualiza los datos generales y de contacto de tu organización. El RUC y el estado son administrados por la plataforma."
              trigger={
                <Button variant="primary" onPress={() => setEditing(true)}>
                  <FiEdit3 aria-hidden="true" /> Editar empresa
                </Button>
              }
            >
              <CompanyEditor
                profile={profile}
                close={() => setEditing(false)}
                onBusyChange={setSaving}
              />
            </CreationDrawer>
          ) : undefined
        }
      />
      {company.isPending ? (
        <LoadingState label="Cargando datos de la empresa" />
      ) : company.isError ? (
        <ErrorState error={company.error} retry={() => void company.refetch()} />
      ) : profile ? (
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6">
            <section className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <span className="rounded-2xl bg-accent/10 p-4 text-accent">
                  <FiBriefcase aria-hidden="true" className="size-7" />
                </span>
                <StatusBadge tone={active ? "success" : "neutral"}>
                  {typeof profile.estado === "boolean"
                    ? active
                      ? "Empresa activa"
                      : "Empresa inactiva"
                    : profile.estado.replaceAll("_", " ")}
                </StatusBadge>
              </div>
              <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
                Razón social
              </p>
              <h2 className="break-words text-2xl font-semibold tracking-tight [overflow-wrap:anywhere]">
                {profile.razon_social}
              </h2>
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-default px-3 py-2 font-mono text-sm">
                <FiFileText aria-hidden="true" /> RUC {profile.ruc}
              </p>
              <dl className="mt-7 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted">Nombre comercial</dt>
                  <dd className="mt-2 break-words text-sm font-medium [overflow-wrap:anywhere]">
                    {profile.nombre_comercial || "Sin nombre comercial registrado"}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted">Actividad de la empresa</dt>
                  <dd className="mt-2 break-words text-sm font-medium">
                    {profile.tipo_empresa || "Sin actividad registrada"}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FiMail aria-hidden="true" className="text-accent" /> Contacto y ubicación
              </h2>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                    <FiMail aria-hidden="true" /> Correo de contacto
                  </dt>
                  <dd className="mt-2 break-words text-sm [overflow-wrap:anywhere]">
                    {profile.correo || "Sin correo registrado"}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                    <FiPhone aria-hidden="true" /> Teléfono
                  </dt>
                  <dd className="mt-2 break-words text-sm">
                    {profile.telefono || "Sin teléfono registrado"}
                  </dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                    <FiMapPin aria-hidden="true" /> Dirección
                  </dt>
                  <dd className="mt-2 break-words text-sm [overflow-wrap:anywhere]">
                    {profile.direccion || "Sin dirección registrada"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
          <section className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <span className="mb-5 inline-flex rounded-xl bg-accent/10 p-3 text-accent">
              <FiShield aria-hidden="true" className="size-6" />
            </span>
            <h2 className="text-lg font-semibold">Verificación tributaria</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Resultado registrado para los datos tributarios de tu empresa.
            </p>
            <dl className="mt-6 space-y-5">
              {[
                ["Resultado", verification?.resultado],
                ["Estado SUNAT", verification?.estado],
                ["Condición SUNAT", verification?.condicion],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 border-t border-border pt-4">
                  <dt className="text-xs font-medium text-muted">{label}</dt>
                  <dd className="mt-2 break-words text-sm font-medium">
                    {value ? value.replaceAll("_", " ") : "Sin información registrada"}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 flex items-start gap-2 rounded-xl bg-default p-4 text-xs leading-relaxed text-muted">
              <FiCheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> La
              verificación tributaria se actualiza al modificar la razón social.
            </p>
          </section>
        </div>
      ) : null}
    </section>
  );
}
