"use client";

import { FiBox, FiEye, FiUsers } from "react-icons/fi";

import Link from "next/link";
import { Table } from "@heroui/react";
import { EmptyState, PagePagination, StatusBadge } from "@agrocloud/ui";

export type RecordRow = {
  id: number;
  title: string;
  detail: string;
  status?: { label: string; tone: "success" | "danger" | "warning" | "neutral" | "info" };
};

export function RecordList({
  resource,
  rows,
  page,
  last,
  onPageChange,
  filtered = false,
}: {
  resource: "producers" | "lots";
  rows: RecordRow[];
  page: number;
  last: number;
  onPageChange: (page: number) => void;
  filtered?: boolean;
}) {
  return (
    <div className="paginated-content  gap-4">
      <p aria-live="polite" className="text-sm text-muted">
        {rows.length} {rows.length === 1 ? "registro visible" : "registros visibles"} en esta
        página.
      </p>
      {rows.length ? (
        <Table className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <Table.ScrollContainer>
            <Table.Content
              aria-label={resource === "lots" ? "Lotes registrados" : "Productores registrados"}
            >
              <Table.Header>
                <Table.Column isRowHeader>
                  {resource === "lots" ? "Lote" : "Productor"}
                </Table.Column>
                <Table.Column>Información</Table.Column>
                <Table.Column>{resource === "lots" ? "Estado" : "Acceso"}</Table.Column>
              </Table.Header>
              <Table.Body items={rows}>
                {(row) => (
                  <Table.Row id={row.id} className="h-20">
                    <Table.Cell>
                      <Link
                        className="rounded-md font-semibold text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                        href={`/${resource}/${row.id}`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {resource === "lots" ? (
                            <FiBox aria-hidden="true" className="shrink-0 text-muted" />
                          ) : (
                            <FiUsers aria-hidden="true" className="shrink-0 text-muted" />
                          )}
                          {row.title}
                        </span>
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="min-w-48 max-w-md whitespace-normal text-sm text-muted">
                      {row.detail || "Sin información adicional"}
                    </Table.Cell>
                    <Table.Cell>
                      {row.status ? (
                        <StatusBadge tone={row.status.tone}>{row.status.label}</StatusBadge>
                      ) : (
                        <Link
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-accent hover:bg-default"
                          href={`/${resource}/${row.id}`}
                        >
                          <FiEye aria-hidden="true" /> Ver detalle
                        </Link>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      ) : (
        <EmptyState
          title={filtered ? "Ningún resultado en esta página" : "No hay registros en esta página"}
          description={
            filtered
              ? "Cambia los filtros o revisa otras páginas."
              : "Registra un nuevo elemento si tienes permisos."
          }
        />
      )}
      <PagePagination last={last} page={page} onChange={onPageChange} />
    </div>
  );
}
