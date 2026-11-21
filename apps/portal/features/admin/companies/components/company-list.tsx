"use client";

import { FiBriefcase } from "react-icons/fi";

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
        <div className="paginated-content">
          {companies.data.data.length ? (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              {companies.data.data.map((company) => (
                <li
                  key={company.id_empresa}
                  className="space-y-2 p-5 transition-colors hover:bg-default/40"
                >
                  <Link
                    className="rounded-md font-semibold text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                    href={"/admin/companies/" + company.id_empresa}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiBriefcase aria-hidden="true" className="shrink-0 text-accent" />
                      {company.razon_social}
                    </span>
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
        </div>
      )}
    </section>
  );
}
