"use client";
import { useState } from "react";
import Link from "next/link";
import { Avatar, Table } from "@heroui/react";
import { EmptyState, LoadingState, StatusBadge, ErrorState, PagePagination } from "@agrocloud/ui";
import { AdminHeading } from "@/features/admin/components/admin-ui";
import { AdminFilterBar, matchesSearch } from "@/features/admin/components/admin-filter-bar";
import { useCompaniesPage } from "../hooks";
import { companyStatus, companyTone } from "../status";
export function Companies() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const companies = useCompaniesPage(page);
  const rows = (companies.data?.data ?? []).filter(
    (company) =>
      matchesSearch([company.ruc, company.razon_social, company.nombre_comercial], search) &&
      (status === "all" ||
        (status === "Activa"
          ? companyTone(company.estado) === "success"
          : companyTone(company.estado) === "danger")),
  );
  return (
    <section className="space-y-4">
      <AdminHeading title="Empresas registradas" />
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        placeholder="Empresa, nombre comercial o RUC"
        states={[
          { id: "all", label: "Todas" },
          { id: "Activa", label: "Activas" },
          { id: "Inactiva", label: "Inactivas" },
        ]}
      />
      {companies.isPending ? (
        <LoadingState label="Cargando empresas" />
      ) : companies.isError ? (
        <ErrorState error={companies.error} retry={() => companies.refetch()} />
      ) : (
        <div className="paginated-content">
          {rows.length ? (
            <Table className="overflow-hidden rounded-2xl border border-border bg-surface">
              <Table.ScrollContainer>
                <Table.Content aria-label="Empresas registradas" className="min-w-[720px]">
                  <Table.Header>
                    <Table.Column isRowHeader>Empresa</Table.Column>
                    <Table.Column>RUC</Table.Column>
                    <Table.Column>Estado</Table.Column>
                    <Table.Column>Verificación tributaria</Table.Column>
                    <Table.Column>Acciones</Table.Column>
                  </Table.Header>
                  <Table.Body items={rows}>
                    {(company) => (
                      <Table.Row id={company.id_empresa}>
                        <Table.Cell>
                          <div className="flex items-center gap-3 py-2">
                            <Avatar className="size-10 shrink-0 rounded-xl">
                              <Avatar.Image
                                src={company.logo_url ?? undefined}
                                alt=""
                                className="object-contain"
                              />
                              <Avatar.Fallback>
                                {company.razon_social.trim().slice(0, 2).toUpperCase()}
                              </Avatar.Fallback>
                            </Avatar>
                            <div className="min-w-0 max-w-xs">
                              <Link
                                href={"/admin/companies/" + company.id_empresa}
                                className="break-words text-sm font-semibold text-accent"
                              >
                                {company.nombre_comercial || company.razon_social}
                              </Link>
                              <p className="mt-1 break-words text-xs text-muted">
                                {company.razon_social}
                              </p>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{company.ruc}</Table.Cell>
                        <Table.Cell>
                          <StatusBadge tone={companyTone(company.estado)}>
                            {companyStatus(company.estado)}
                          </StatusBadge>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-muted">
                            {company.sunat_verificacion?.resultado?.replaceAll("_", " ") ||
                              "Consulta pendiente"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <Link
                            href={"/admin/companies/" + company.id_empresa}
                            className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-accent"
                          >
                            Ver detalle
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          ) : (
            <EmptyState
              title="Sin empresas para esta vista"
              description="Cambia los filtros o consulta otra página."
            />
          )}
          <PagePagination last={companies.data.meta.last_page} page={page} onChange={setPage} />
        </div>
      )}
    </section>
  );
}
