"use client";

import Link from "next/link";
import { EmptyState, PagePagination } from "@agrocloud/ui";

export type RecordRow = { id: number; title: string; detail: string };

export function RecordList({
  resource,
  rows,
  page,
  last,
  onPageChange,
}: {
  resource: "producers" | "lots";
  rows: RecordRow[];
  page: number;
  last: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="grid gap-4">
      {rows.length ? (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {rows.map((row) => (
            <li key={row.id} className="p-4">
              <Link
                className="font-semibold text-accent underline"
                href={"/" + resource + "/" + row.id}
              >
                {row.title}
              </Link>
              <p className="text-sm text-muted">{row.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No hay registros en esta página"
          description="Puedes cambiar de página o registrar un nuevo elemento si tienes permisos."
        />
      )}
      <PagePagination last={last} page={page} onChange={onPageChange} />
    </div>
  );
}
