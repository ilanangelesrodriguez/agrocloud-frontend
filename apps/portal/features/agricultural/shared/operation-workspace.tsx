"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ErrorState,
  InlineNotice,
  LoadingState,
  PageHeader,
  StatusBadge,
  PagePagination,
} from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
export type OperationRow<T = unknown> = {
  id: number;
  title: string;
  detail: string;
  status: string;
  href: string;
  record?: T;
};
export type OperationPage<T = unknown> = {
  meta: { current_page: number; last_page: number };
  rows: OperationRow<T>[];
};
export function OperationWorkspace({
  title,
  description,
  permission,
  children,
}: {
  title: string;
  description: string;
  permission: string;
  children: ReactNode;
}) {
  const session = useCurrentUser();
  if (session.isPending) return <LoadingState label="Verificando permisos" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;
  if (!canManageCompany(session.data, permission))
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="Tu cuenta no tiene permiso para consultar este módulo."
      />
    );
  return (
    <section className="space-y-5">
      <PageHeader title={title} description={description} />
      {children}
    </section>
  );
}
export function OperationList<T = unknown>({
  queryKey,
  fetchPage,
  renderContent,
}: {
  queryKey: string[];
  fetchPage: (page: number, signal: AbortSignal) => Promise<OperationPage<T>>;
  renderContent?: (record: T) => ReactNode;
}) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["agricultural", ...queryKey, page],
    queryFn: ({ signal }) => fetchPage(page, signal),
    retry: false,
  });
  if (query.isPending) return <LoadingState label="Cargando operaciones" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  return (
    <div className="paginated-content">
      <ul className="space-y-3">
        {query.data.rows.map((row) => (
          <li key={row.id} className="space-y-3 rounded-card border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={row.href} className="font-semibold text-accent">
                {row.title}
              </Link>
              <StatusBadge tone="neutral">{row.status}</StatusBadge>
            </div>
            <p className="text-sm text-muted">{row.detail}</p>
            {row.record !== undefined && renderContent ? renderContent(row.record) : null}
          </li>
        ))}
      </ul>
      {query.data.rows.length === 0 ? (
        <p className="rounded-card border border-border p-5 text-muted">
          No hay registros para esta vista.
        </p>
      ) : null}
      <PagePagination
        page={page}
        last={query.data.meta.last_page}
        isDisabled={query.isFetching}
        onChange={setPage}
      />
    </div>
  );
}
