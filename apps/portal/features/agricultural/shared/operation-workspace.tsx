"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { Chip, Input, Label, TextField, Tabs } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import {
  EmptyState,
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
  actionLabel?: string;
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
  layout = "default",
  emptyTitle = "No hay registros para esta vista",
  emptyDescription = "Los nuevos registros aparecerán aquí cuando estén disponibles.",
  emptyAction,
  filterStates,
}: {
  queryKey: string[];
  fetchPage: (page: number, signal: AbortSignal) => Promise<OperationPage<T>>;
  renderContent?: (record: T) => ReactNode;
  layout?: "default" | "sampling" | "inspection" | "incident";
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  filterStates?: { id: string; label: string }[];
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const query = useQuery({
    queryKey: ["agricultural", ...queryKey, page],
    queryFn: ({ signal }) => fetchPage(page, signal),
    retry: false,
  });
  if (query.isPending) return <LoadingState label="Cargando operaciones" />;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const term = search
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
  const visible =
    layout !== "default"
      ? query.data.rows.filter(
          (row) =>
            (row.title + " " + row.detail)
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLocaleLowerCase("es")
              .includes(term) &&
            ((layout !== "inspection" && layout !== "incident") ||
              status === "all" ||
              row.status === status),
        )
      : query.data.rows;
  return (
    <div className={layout !== "default" ? "space-y-4" : "paginated-content"}>
      {layout !== "default" ? (
        <>
          <TextField variant="secondary" value={search} onChange={setSearch}>
            <Label>
              {layout === "incident"
                ? "Buscar incidencia en esta página"
                : layout === "inspection"
                  ? "Buscar inspección en esta página"
                  : "Buscar muestreo en esta página"}
            </Label>
            <Input
              variant="secondary"
              placeholder={
                layout === "incident"
                  ? "Título, identificador de lote o responsable"
                  : layout === "inspection"
                    ? "Código de lote o número de inspección"
                    : "Código de lote o número de muestreo"
              }
            />
          </TextField>
          <p className="text-xs text-muted" role="status">
            {visible.length}{" "}
            {layout === "incident"
              ? visible.length === 1
                ? "incidencia visible"
                : "incidencias visibles"
              : layout === "inspection"
                ? visible.length === 1
                  ? "inspección visible"
                  : "inspecciones visibles"
                : visible.length === 1
                  ? "muestreo visible"
                  : "muestreos visibles"}{" "}
            en la página {page}. La búsqueda y los filtros se limitan a los registros cargados;
            revisa las demás páginas para consultar otros registros.
          </p>
        </>
      ) : null}
      {layout === "incident" && filterStates ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {filterStates
            .filter((state) => state.id !== "all")
            .map((state) => (
              <div
                key={state.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3"
              >
                <p className="text-xs text-muted">{state.label}</p>
                <strong className="text-lg tabular-nums">
                  {query.data.rows.filter((row) => row.status === state.id).length}
                </strong>
              </div>
            ))}
        </div>
      ) : null}
      {layout === "inspection" || layout === "incident" ? (
        <Tabs
          variant="secondary"
          selectedKey={status}
          onSelectionChange={(key) => setStatus(String(key))}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Filtrar registros de la página">
              {(filterStates
                ? filterStates.map((state) => [state.id, state.label])
                : [
                    ["all", "Todas"],
                    ["En captura", "En captura"],
                    ["Validada", "Validadas"],
                  ]
              ).map(([key, label]) => (
                <Tabs.Tab key={key} id={key}>
                  {label}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      ) : null}
      <ul className={layout !== "default" ? "grid items-start gap-4 lg:grid-cols-2" : "space-y-3"}>
        {visible.map((row) => (
          <li key={row.id} className="space-y-3 rounded-card border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={row.href} className="font-semibold text-accent">
                {row.title}
              </Link>
              {layout !== "default" ? (
                <Chip
                  size="sm"
                  variant="soft"
                  color={
                    row.status === "Completado" || row.status === "Validada"
                      ? "success"
                      : row.status === "En inspección" || row.status === "En captura"
                        ? "accent"
                        : "default"
                  }
                >
                  {row.status}
                </Chip>
              ) : (
                <StatusBadge tone="neutral">{row.status}</StatusBadge>
              )}
            </div>
            <p className="break-words text-sm text-muted">{row.detail}</p>
            {layout !== "default" ? (
              <Link
                href={row.href}
                className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-accent hover:bg-default"
              >
                {row.actionLabel ?? (layout === "incident" ? "Ver lote" : "Ver muestreo")} →
              </Link>
            ) : null}
            {row.record !== undefined && renderContent ? renderContent(row.record) : null}
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <div className="space-y-3">
          <EmptyState
            title={search || status !== "all" ? "No hay coincidencias en esta página" : emptyTitle}
            description={
              search || status !== "all"
                ? "Cambia los filtros o revisa las demás páginas."
                : emptyDescription
            }
          />
          {emptyAction}
        </div>
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
