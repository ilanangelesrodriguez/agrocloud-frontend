"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState, LoadingState, StatusBadge, ErrorState, PagePagination } from "@agrocloud/ui";
import { AdminHeading } from "@/features/admin/components/admin-ui";
import { useCompaniesPage } from "../hooks";
import { companyStatus, companyTone } from "../status";

export function Companies() {
  const [page, setPage] = useState(1);
  const companies = useCompaniesPage(page);

  return (
    <section className="space-y-4">
      <AdminHeading title="Empresas registradas" />
      {companies.isPending ? (
        <LoadingState label="Cargando empresas" />
      ) : companies.isError ? (
        <ErrorState
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
          <PagePagination last={companies.data.meta.last_page} page={page} onChange={setPage} />
        </>
      )}
    </section>
  );
}
