"use client";

import { Input, Label, TextField } from "@heroui/react";
import { ErrorState, LoadingState } from "@agrocloud/ui";
import { AdminHeading } from "@/features/admin/components/admin-ui";
import { useCompanyDetails } from "../hooks";
import { companyStatus } from "../status";

// Apariencia de campo "solo lectura": fondo y borde verdes suaves (visibles en claro y oscuro),
// sin cursor de texto ni resaltado de foco, para que no parezca editable.
const readOnlyClass =
  "w-full cursor-default border border-accent/25 bg-accent/10 text-foreground shadow-none caret-transparent focus:!border-accent/25 focus:!outline-none focus:!ring-0 focus-visible:!border-accent/25 focus-visible:!outline-none focus-visible:!ring-0";

type Field = {
  label: string;
  value?: string | null;
  /** Ocupa las dos columnas (por ejemplo la dirección). */
  wide?: boolean;
};

export function CompanyDetails({ id }: { id: string }) {
  const company = useCompanyDetails(id);
  const data = company.data?.data;
  const fields: Field[] = data
    ? [
        { label: "RUC", value: data.ruc },
        { label: "Nombre comercial", value: data.nombre_comercial },
        { label: "Estado", value: companyStatus(data.estado) },
        { label: "Tipo de empresa", value: data.tipo_empresa },
        { label: "Dirección", value: data.direccion, wide: true },
        { label: "Correo", value: data.correo },
        { label: "Teléfono", value: data.telefono },
      ]
    : [];

  return (
    <section className="space-y-4">
      <AdminHeading title={data?.razon_social ?? "Detalle de empresa"} />
      {data ? <h2 className="text-xl font-semibold">{data.razon_social}</h2> : null}
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
        <div className="grid gap-x-6 gap-y-5 rounded-card border border-border bg-surface p-5 sm:grid-cols-2">
          {fields.map((field) =>
            field.value ? (
              <TextField
                key={field.label}
                isReadOnly
                className={field.wide ? "min-w-0 sm:col-span-2" : "min-w-0"}
                value={field.value}
              >
                <Label className="text-sm font-medium">{field.label}</Label>
                <Input className={readOnlyClass} tabIndex={-1} />
              </TextField>
            ) : null,
          )}
        </div>
      )}
    </section>
  );
}
