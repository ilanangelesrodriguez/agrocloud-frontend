"use client";

import Link from "next/link";
import { ErrorState, LoadingState } from "@agrocloud/ui";
import { AdminHeading } from "@/features/admin/components/admin-ui";
import { useCompanyDetails } from "../hooks";
import { companyStatus } from "../status";

export function CompanyDetails({ id }: { id: string }) {
  const company = useCompanyDetails(id);
  const data = company.data?.data;
  const fields = data
    ? [
        ["RUC", data.ruc],
        ["Nombre comercial", data.nombre_comercial],
        ["Estado", companyStatus(data.estado)],
        ["Tipo de empresa", data.tipo_empresa],
        ["Dirección", data.direccion],
        ["Correo", data.correo],
        ["Teléfono", data.telefono],
      ]
    : [];

  return (
    <section className="space-y-4">
      <AdminHeading title={data?.razon_social ?? "Detalle de empresa"} />
      <Link className="inline-block text-accent underline" href="/admin/companies">
        Volver a empresas
      </Link>
      {company.isPending ? (
        <LoadingState label="Cargando empresa" />
      ) : company.isError ? (
        <ErrorState
          error={company.error}
          retry={() => {
            void company.refetch();
          }}
        />
      ) : (
        <dl className="grid gap-4 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
          {fields.map(([label, value]) =>
            value ? (
              <div key={label} className="min-w-0">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="break-words">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
      )}
    </section>
  );
}
