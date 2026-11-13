"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import {
  EmptyState,
  ErrorState,
  InlineNotice,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "@agrocloud/ui";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany, settingsLinks } from "@/features/company/navigation";
import { useOperationalDashboard } from "../hooks";

function formatLimit(value: number): string {
  return new Intl.NumberFormat("es-PE").format(value);
}

export function OperationalDashboard() {
  const session = useCurrentUser();
  const user = session.data;
  const access = {
    lots: canManageCompany(user, "lotes.ver"),
    producers: canManageCompany(user, "productores.ver"),
    subscription: canManageCompany(user, "suscripciones.ver"),
  };
  // El hook siempre se invoca en el mismo orden; las consultas no autorizadas no se ejecutan.
  const { lots, producers, subscription } = useOperationalDashboard(access);

  if (session.isPending) return <LoadingState label="Cargando panel empresarial" lines={4} />;
  if (session.isError) {
    return <ErrorState error={session.error} retry={() => void session.refetch()} />;
  }
  if (!user) return null;
  if (user.rol?.codigo === "SUPERADMIN") {
    return (
      <div className="grid gap-3">
        <InlineNotice
          description="La plataforma dispone de su propia administración global."
          status="warning"
          title="Panel empresarial"
        />
        <Link className="font-medium text-accent underline" href="/admin">
          Ir a administración global
        </Link>
      </div>
    );
  }

  const links = [
    { href: "/producers", label: "Productores", permission: "productores.ver" },
    { href: "/lots", label: "Lotes", permission: "lotes.ver" },
    ...settingsLinks,
  ].filter(({ permission }) => canManageCompany(user, permission));

  const recentLots = lots.data?.data ?? [];
  const pending = recentLots.filter((lot) => lot.estado === "PENDIENTE_RECEPCION");
  const received = recentLots.filter((lot) => lot.estado === "RECIBIDO");
  const rights = subscription.data?.rights ?? [];

  return (
    <section className="space-y-7">
      <PageHeader
        title={`Bienvenido, ${user.nombre}`}
        description="Operaciones y consumo real consultados a los servicios de tu empresa."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Empresa asignada" value={user.id_empresa ?? "Sin asignar"} />
        <MetricCard title="Rol actual" value={user.rol?.nombre ?? user.rol?.codigo ?? "Sin rol"} />
        {access.lots && lots.data ? (
          <MetricCard title="Lotes en la página consultada" value={recentLots.length} />
        ) : null}
        {access.producers && producers.data ? (
          <MetricCard
            title="Productores en la página consultada"
            value={producers.data.data.length}
          />
        ) : null}
      </div>

      {(access.lots && lots.isPending) || (access.producers && producers.isPending) ? (
        <LoadingState label="Consultando registros agrícolas" lines={2} />
      ) : null}
      {access.lots && lots.isError ? (
        <ErrorState
          error={lots.error}
          retry={() => void lots.refetch()}
          title="No se pudieron cargar los lotes"
        />
      ) : null}
      {access.producers && producers.isError ? (
        <ErrorState
          error={producers.error}
          retry={() => void producers.refetch()}
          title="No se pudieron cargar los productores"
        />
      ) : null}

      {access.lots && lots.data ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Lotes por atender</h2>
            <Link className="text-sm font-medium text-accent underline" href="/lots">
              Ver todos los lotes
            </Link>
          </div>
          <p className="text-sm text-muted">
            {pending.length} pendientes de recepción y {received.length} recibidos, de los{" "}
            {recentLots.length} lotes de la primera página. No es un total global.
          </p>
          {recentLots.length ? (
            <ul className="divide-y divide-border rounded-card border border-border bg-surface">
              {recentLots.slice(0, 6).map((lot) => (
                <li
                  key={lot.id_lote}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      className="font-semibold text-accent underline"
                      href={`/lots/${lot.id_lote}`}
                    >
                      {lot.codigo_lote}
                    </Link>
                    <p className="text-sm text-muted">{lot.producto}</p>
                  </div>
                  <StatusBadge
                    tone={
                      lot.estado === "RECIBIDO"
                        ? "success"
                        : lot.estado === "PENDIENTE_RECEPCION"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {lot.estado.replaceAll("_", " ")}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No hay lotes en la primera página"
              description="Registra un lote cuando tengas autorización para hacerlo."
            />
          )}
        </section>
      ) : null}

      {access.subscription ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Cupos del servicio</h2>
            <Link
              className="text-sm font-medium text-accent underline"
              href="/settings/subscription"
            >
              Ver suscripción
            </Link>
          </div>
          {subscription.isPending ? <LoadingState label="Consultando cupos" lines={2} /> : null}
          {subscription.isError ? (
            <ErrorState
              error={subscription.error}
              retry={() => void subscription.refetch()}
              title="No se pudieron consultar los cupos"
            />
          ) : null}
          {subscription.data ? (
            rights.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rights.map((right) => (
                  <div
                    key={right.recurso}
                    className="rounded-card border border-border bg-surface p-4"
                  >
                    <p className="text-sm font-medium text-muted">
                      {right.recurso === "analisis_ia" ? "Análisis IA" : right.recurso}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {formatLimit(right.consumido)} / {formatLimit(right.limite)}
                    </p>
                    <p className="mt-1 text-xs text-muted">Consumo informado por Identity</p>
                  </div>
                ))}
              </div>
            ) : (
              <InlineNotice
                status="accent"
                title="Sin cupos publicados"
                description="El servicio no devolvió derechos de consumo para esta cuenta."
              />
            )
          ) : null}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Accesos autorizados</h2>
        <nav aria-label="Gestión empresarial" className="flex flex-wrap gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              className="inline-flex min-h-10 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-accent hover:bg-surface-secondary"
              href={href}
            >
              {label}
            </Link>
          ))}
          <Link
            className="inline-flex min-h-10 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-accent hover:bg-surface-secondary"
            href="/settings/profile"
          >
            Mi cuenta
          </Link>
          {access.lots || access.producers || access.subscription ? (
            <Button
              size="sm"
              variant="secondary"
              onPress={() => {
                const refreshes = [];
                if (access.lots) refreshes.push(lots.refetch());
                if (access.producers) refreshes.push(producers.refetch());
                if (access.subscription) refreshes.push(subscription.refetch());
                void Promise.all(refreshes);
              }}
            >
              Actualizar datos
            </Button>
          ) : null}
        </nav>
      </section>
    </section>
  );
}
