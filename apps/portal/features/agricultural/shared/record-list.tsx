"use client";

import Link from "next/link";
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
    <div className="grid gap-4">
      <p aria-live="polite" className="text-sm text-muted">
        {rows.length} {rows.length === 1 ? "registro visible" : "registros visibles"} en esta
        página.
      </p>
      {rows.length ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <Link
                  className="font-semibold text-accent underline"
                  href={`/${resource}/${row.id}`}
                >
                  {row.title}
                </Link>
                <p className="text-sm text-muted">{row.detail}</p>
              </div>
              {row.status ? (
                <StatusBadge tone={row.status.tone}>{row.status.label}</StatusBadge>
              ) : null}
            </li>
          ))}
        </ul>
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
