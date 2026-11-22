"use client";
import { Avatar, Tabs } from "@heroui/react";
import { ErrorState, LoadingState, StatusBadge } from "@agrocloud/ui";
import { AdminHeading } from "@/features/admin/components/admin-ui";
import { useCompanyDetails } from "../hooks";
import { companyStatus, companyTone } from "../status";
function DataFields({ fields }: { fields: (string | null | undefined)[][] }) {
  return (
    <dl className="grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-1 break-words text-sm">{value || "Sin información registrada"}</dd>
        </div>
      ))}
    </dl>
  );
}
export function CompanyDetails({ id }: { id: string }) {
  const company = useCompanyDetails(id);
  const data = company.data?.data;
  return (
    <section className="min-w-0 space-y-5">
      <AdminHeading title="Detalle de empresa" />
      {company.isPending ? (
        <LoadingState label="Cargando empresa" />
      ) : company.isError ? (
        <ErrorState error={company.error} retry={() => company.refetch()} />
      ) : data ? (
        <>
          <header className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
            <Avatar className="size-16 shrink-0 rounded-2xl">
              <Avatar.Image
                src={data.logo_url ?? undefined}
                alt="Logo empresarial"
                className="object-contain"
              />
              <Avatar.Fallback>{data.razon_social.slice(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <h2 className="break-words text-xl font-semibold">
                {data.nombre_comercial || data.razon_social}
              </h2>
              <p className="text-sm text-muted">RUC {data.ruc}</p>
              <StatusBadge tone={companyTone(data.estado)}>
                {companyStatus(data.estado)}
              </StatusBadge>
            </div>
          </header>
          <Tabs variant="secondary" className="space-y-4">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Datos de la empresa">
                {[
                  ["information", "Información general"],
                  ["contact", "Contacto y ubicación"],
                  ["verification", "Verificación tributaria"],
                ].map(([key, label]) => (
                  <Tabs.Tab key={key} id={key}>
                    {label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id="information">
              <DataFields
                fields={[
                  ["Razón social", data.razon_social],
                  ["Nombre comercial", data.nombre_comercial],
                  ["RUC", data.ruc],
                  ["Tipo de empresa", data.tipo_empresa],
                  ["Estado de cuenta", companyStatus(data.estado)],
                ]}
              />
            </Tabs.Panel>
            <Tabs.Panel id="contact">
              <DataFields
                fields={[
                  ["Correo", data.correo],
                  ["Teléfono", data.telefono],
                  ["Dirección", data.direccion],
                  ["Departamento", data.departamento],
                  ["Provincia", data.provincia],
                  ["Distrito", data.distrito],
                  ["UBIGEO", data.ubigeo],
                ]}
              />
            </Tabs.Panel>
            <Tabs.Panel id="verification">
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  El resultado tributario es independiente del estado de cuenta en AgroCloud. «No
                  encontrado» no significa que la empresa esté inactiva.
                </p>
                <DataFields
                  fields={[
                    [
                      "Resultado",
                      data.sunat_verificacion?.resultado?.replaceAll("_", " ") ??
                        "Consulta pendiente",
                    ],
                    ["Estado SUNAT", data.sunat_verificacion?.estado],
                    ["Condición SUNAT", data.sunat_verificacion?.condicion],
                    ["Fecha de consulta", "No disponible en el registro actual"],
                  ]}
                />
              </div>
            </Tabs.Panel>
          </Tabs>
        </>
      ) : null}
    </section>
  );
}
