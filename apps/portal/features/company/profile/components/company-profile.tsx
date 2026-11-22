"use client";
import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Tabs } from "@heroui/react";
import { FiEdit3, FiFileText, FiShield } from "react-icons/fi";
import { ErrorState, LoadingState, PageHeader, StatusBadge } from "@agrocloud/ui";
import { CreationDrawer } from "@/components/creation-drawer";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { useCompanyProfile } from "../hooks";
import { CompanyEditor } from "./company-editor";
import { CompanyLogoEditor } from "./company-logo-editor";
function CompanyPanel({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.15 }}
    >
      {children}
    </motion.div>
  );
}
function Datum({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm [overflow-wrap:anywhere]">
        {value || "Sin información registrada"}
      </dd>
    </div>
  );
}
export function CompanyProfile() {
  const reducedMotion = useReducedMotion();
  const { data: actor } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const company = useCompanyProfile();
  const profile = company.data?.data;
  const canEdit = canManageCompany(actor, "empresa.editar");
  const active =
    profile?.estado === true ||
    (typeof profile?.estado === "string" &&
      ["ACTIVA", "ACTIVO", "ACTIVE"].includes(profile.estado.trim().toUpperCase()));
  const inactive =
    profile?.estado === false ||
    (typeof profile?.estado === "string" &&
      ["INACTIVA", "INACTIVO", "INACTIVE"].includes(profile.estado.trim().toUpperCase()));
  const accountStatus = active
    ? "Empresa activa"
    : inactive
      ? "Empresa inactiva"
      : "Estado de cuenta sin confirmar";
  const verification = profile?.sunat_verificacion;
  const result = (verification?.resultado ?? "").trim().toUpperCase().replaceAll(" ", "_");
  const verified = [
    "VERIFICADO",
    "VERIFICADA",
    "VERIFIED",
    "ENCONTRADO",
    "ENCONTRADA",
    "FOUND",
    "SUCCESS",
    "EXITOSO",
    "OK",
  ].includes(result);
  const notFound = ["NO_ENCONTRADO", "NO_ENCONTRADA", "NOT_FOUND"].includes(result);
  const providerError = [
    "ERROR",
    "ERROR_PROVEEDOR",
    "PROVIDER_ERROR",
    "UNAVAILABLE",
    "NO_DISPONIBLE",
  ].includes(result);
  const verificationTitle = verified
    ? "Verificado"
    : notFound
      ? "No encontrado"
      : providerError
        ? "Error del proveedor"
        : result && !["PENDIENTE", "PENDING"].includes(result)
          ? "Resultado sin clasificar"
          : "Consulta pendiente";
  const verificationDescription = verified
    ? "La consulta registrada encontró información tributaria para este RUC. Revisa el estado y la condición SUNAT por separado."
    : notFound
      ? "La consulta no encontró información para este RUC. Esto no significa que tu cuenta empresarial esté inactiva ni determina la validez del RUC."
      : providerError
        ? "No se pudo completar la consulta al proveedor. Este resultado no determina la situación tributaria de la empresa."
        : "No hay una verificación concluyente registrada para este RUC.";
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.16 }}
      className="min-w-0 space-y-6"
    >
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
        <>
          <section className="flex min-w-0 flex-col gap-6 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-start sm:p-6">
            <CompanyLogoEditor
              compact
              logoUrl={profile.logo_url}
              companyName={profile.nombre_comercial || profile.razon_social}
              canEdit={canEdit}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Identidad empresarial
              </p>
              <h2 className="break-words text-2xl font-semibold">
                {profile.nombre_comercial || profile.razon_social}
              </h2>
              <p className="break-words text-sm text-muted">{profile.razon_social}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-sm">
                  <FiFileText aria-hidden="true" />
                  RUC {profile.ruc}
                </span>
                <StatusBadge tone={active ? "success" : "neutral"}>{accountStatus}</StatusBadge>
              </div>
            </div>
          </section>
          <Tabs variant="secondary" className="min-w-0 space-y-5">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Datos de la empresa">
                {[
                  ["information", "Información"],
                  ["location", "Ubicación"],
                  ["verification", "Verificación"],
                ].map(([id, label]) => (
                  <Tabs.Tab key={id} id={id}>
                    {label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id="information">
              <CompanyPanel>
                <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
                  <h2 className="text-lg font-semibold">Información general</h2>
                  <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                    <Datum label="Razón social" value={profile.razon_social} />
                    <Datum label="Nombre comercial" value={profile.nombre_comercial} />
                    <Datum label="Actividad de la empresa" value={profile.tipo_empresa} />
                    <Datum label="RUC" value={profile.ruc} />
                  </dl>
                  <h3 className="mb-5 mt-7 border-t border-border pt-6 font-semibold">Contacto</h3>
                  <dl className="grid gap-6 sm:grid-cols-2">
                    <Datum label="Correo de contacto" value={profile.correo} />
                    <Datum label="Teléfono" value={profile.telefono} />
                  </dl>
                </section>
              </CompanyPanel>
            </Tabs.Panel>
            <Tabs.Panel id="location">
              <CompanyPanel>
                <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
                  <h2 className="text-lg font-semibold">Ubicación de la empresa</h2>
                  <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                    <Datum label="Departamento" value={profile.departamento} />
                    <Datum label="Provincia" value={profile.provincia} />
                    <Datum label="Distrito" value={profile.distrito} />
                    <Datum label="UBIGEO" value={profile.ubigeo} />
                    <Datum label="Dirección" value={profile.direccion} />
                  </dl>
                </section>
              </CompanyPanel>
            </Tabs.Panel>
            <Tabs.Panel id="verification">
              <CompanyPanel>
                <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-7">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <FiShield aria-hidden="true" />
                    Verificación tributaria
                  </h2>
                  <StatusBadge
                    tone={verified ? "success" : notFound || providerError ? "warning" : "neutral"}
                  >
                    {verificationTitle}
                  </StatusBadge>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted">
                    {verificationDescription}
                  </p>
                  <dl className="grid gap-6 border-t border-border pt-5 sm:grid-cols-2">
                    <Datum
                      label="Resultado registrado"
                      value={verification?.resultado?.replaceAll("_", " ")}
                    />
                    <Datum label="Estado SUNAT" value={verification?.estado} />
                    <Datum label="Condición SUNAT" value={verification?.condicion} />
                    <Datum
                      label="Última consulta"
                      value="Fecha no disponible en el registro actual"
                    />
                  </dl>
                  <p className="text-xs leading-relaxed text-muted">
                    La verificación tributaria es independiente del estado de tu cuenta en
                    AgroCloud. Si necesitas revisar este resultado, consulta con la administración
                    de la plataforma.
                  </p>
                </section>
              </CompanyPanel>
            </Tabs.Panel>
          </Tabs>
        </>
      ) : null}
    </motion.section>
  );
}
