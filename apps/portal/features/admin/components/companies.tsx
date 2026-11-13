"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { EmptyState, LoadingState, StatusBadge } from "@agrocloud/ui";

import { adminRequest } from "../api";
import { companyPageSchema, companyResponseSchema } from "../schema";

import { AdminError, AdminHeading, AdminPagination } from "./admin-ui";

function companyStatus(status: string | boolean) {
  if (typeof status === "string") return status;

  return status ? "Activa" : "Inactiva";
}

function companyTone(status: string | boolean): "success" | "danger" | "warning" {
  if (typeof status === "boolean") return status ? "success" : "danger";
  const value = status.toUpperCase();
  if (["ACTIVA", "ACTIVO", "ACTIVE", "APROBADA"].includes(value)) return "success";
  if (["INACTIVA", "INACTIVO", "SUSPENDIDA"].includes(value)) return "danger";
  return "warning";
}

export function Companies() {
  const [page, setPage] = useState(1);
  const companies = useQuery({
    queryKey: ["admin", "companies", page],
    queryFn: ({ signal }) => adminRequest("companies?page=" + page, companyPageSchema, { signal }),
    retry: false,
  });

  return (
    <section className="space-y-4">
      <AdminHeading title="Empresas registradas" />
      {companies.isPending ? (
        <LoadingState label="Cargando empresas" />
      ) : companies.isError ? (
        <AdminError
          error={companies.error}
          retry={() => {
            void companies.refetch();
          }}
        />
      ) : (
        <>
          {companies.data.data.length ? (
            <ul className="divide-y divide-border rounded-card border border-border bg-surface">
              {companies.data.data.map((company) => (
                <li key={company.id_empresa} className="p-4">
                  <Link
                    className="font-semibold text-accent underline"
                    href={"/admin/companies/" + company.id_empresa}
                  >
                    {company.razon_social}
                  </Link>
                  <p className="text-sm text-muted">
                    {company.ruc} ·{" "}
                    <StatusBadge tone={companyTone(company.estado)}>
                      {companyStatus(company.estado)}
                    </StatusBadge>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No hay empresas en esta página"
              description="Cuando se registren empresas aparecerán aquí."
            />
          )}
          <AdminPagination last={companies.data.meta.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}

export function CompanyDetails({ id }: { id: string }) {
  const company = useQuery({
    queryKey: ["admin", "company", id],
    queryFn: ({ signal }) =>
      adminRequest("companies/" + encodeURIComponent(id), companyResponseSchema, { signal }),
    retry: false,
  });
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
        <AdminError
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
