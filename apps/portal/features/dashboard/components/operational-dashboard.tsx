"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Table, toast } from "@heroui/react";
import {
  FiArrowRight,
  FiBox,
  FiBriefcase,
  FiClock,
  FiCreditCard,
  FiEye,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import {
  EmptyState,
  ErrorState,
  InlineNotice,
  LoadingState,
  MetricCard,
  PageHeader,
  QuotaMeter,
  StatusBadge,
} from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { useOperationalDashboard } from "../hooks";
import { DashboardLink, dashboardLinkClass } from "./dashboard-link";

const resourceLabels: Record<string, string> = {
  usuarios: "Usuarios",
  lotes: "Lotes",
  analisis_ia: "Análisis IA",
};
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
    : "Sin fecha registrada";
}

export function OperationalDashboard() {
  const router = useRouter();
  const session = useCurrentUser();
  const user = session.data;
  const access = {
    lots: canManageCompany(user, "lotes.ver"),
    producers: canManageCompany(user, "productores.ver"),
    subscription: canManageCompany(user, "suscripciones.ver"),
  };
  const { lots, producers, subscription } = useOperationalDashboard(access);
  useEffect(() => {
    if (user?.rol?.codigo === "SUPERADMIN") router.replace("/admin");
  }, [user?.rol?.codigo, router]);
  const refreshing =
    (access.lots && lots.isFetching) ||
    (access.producers && producers.isFetching) ||
    (access.subscription && subscription.isFetching);
  async function refresh() {
    const operations = [];
    if (access.lots) operations.push(lots.refetch());
    if (access.producers) operations.push(producers.refetch());
    if (access.subscription) operations.push(subscription.refetch());
    const results = await Promise.all(operations);
    if (results.some((result) => result.isError))
      toast.warning("Actualización incompleta", {
        description:
          "Algunos datos no pudieron actualizarse. Reintenta en la sección correspondiente.",
      });
    else toast.success("Panel actualizado");
  }
  if (session.isPending) return <LoadingState label="Cargando panel empresarial" />;
  if (session.isError)
    return <ErrorState error={session.error} retry={() => void session.refetch()} />;
  if (!user) return null;
  if (user.rol?.codigo === "SUPERADMIN")
    return <LoadingState label="Abriendo administración de plataforma" variant="spinner" />;
  const rows = lots.data?.data ?? [];
  const pending = rows.filter((lot) => lot.estado === "PENDIENTE_RECEPCION");
  const received = rows.filter((lot) => lot.estado === "RECIBIDO");
  const displayed = [
    ...pending,
    ...rows.filter((lot) => lot.estado !== "PENDIENTE_RECEPCION"),
  ].slice(0, 5);
  const rights = subscription.data?.rights ?? [];
  const plan = subscription.data?.subscription;
  const canCreateLot = canManageCompany(user, "lotes.crear");
  const canCreateProducer = canManageCompany(user, "productores.crear");
  const modules = [
    {
      href: "/producers",
      title: "Productores",
      description: "Identificación y ubicación de tus productores.",
      icon: FiUsers,
      permission: "productores.ver",
    },
    {
      href: "/lots",
      title: "Lotes",
      description: "Recepción, trazabilidad y seguimiento de la calidad.",
      icon: FiBox,
      permission: "lotes.ver",
    },
    {
      href: "/settings/company",
      title: "Mi empresa",
      description: "Datos de tu organización y medios de contacto.",
      icon: FiBriefcase,
      permission: "empresa.ver",
    },
    {
      href: "/settings/users",
      title: "Equipo",
      description: "Usuarios, invitaciones y accesos de tu empresa.",
      icon: FiUser,
      permission: "usuarios.ver",
    },
    {
      href: "/settings/roles",
      title: "Roles y permisos",
      description: "Consulta qué puede hacer cada integrante.",
      icon: FiShield,
      permission: "usuarios.ver",
    },
    {
      href: "/settings/subscription",
      title: "Suscripción",
      description: "Tu plan, cupos disponibles y ofertas.",
      icon: FiCreditCard,
      permission: "suscripciones.ver",
    },
  ].filter((module) => canManageCompany(user, module.permission));
  return (
    <section className="min-w-0 space-y-8">
      <PageHeader
        title="Panel principal"
        description="Organiza las tareas de tu empresa y da seguimiento a la operación agrícola."
        actions={
          access.lots || access.producers || access.subscription ? (
            <Button isDisabled={refreshing} variant="secondary" onPress={() => void refresh()}>
              <FiRefreshCw
                aria-hidden="true"
                className={refreshing ? "animate-spin motion-reduce:animate-none" : ""}
              />
              {refreshing ? "Actualizando…" : "Actualizar"}
            </Button>
          ) : undefined
        }
      />
      <Card className="rounded-2xl border border-accent/15 bg-accent/5 shadow-none">
        <Card.Content className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Tu espacio de trabajo
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Del productor al control de calidad.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Consulta los registros de tu empresa y continúa con las tareas disponibles para tu
              equipo.
            </p>
            <p className="mt-3 text-xs font-medium text-muted">
              {user.rol?.nombre ?? "Cuenta empresarial"}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            {canCreateLot ? (
              <Link className={dashboardLinkClass} href="/lots/new">
                <FiPlus aria-hidden="true" /> Registrar lote
              </Link>
            ) : null}
            {canCreateProducer ? (
              <Link className={dashboardLinkClass} href="/producers/new">
                <FiPlus aria-hidden="true" /> Registrar productor
              </Link>
            ) : null}
            {!canCreateLot && !canCreateProducer ? (
              <Link className={dashboardLinkClass} href="/settings/profile">
                <FiUser aria-hidden="true" /> Mi perfil
              </Link>
            ) : null}
          </div>
        </Card.Content>
      </Card>
      {access.lots || access.producers ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {access.lots ? (
            <>
              <MetricCard
                title="Pendientes de recepción"
                value={lots.isPending ? "…" : lots.isError ? "—" : pending.length}
                description="En la primera página de lotes"
                icon={<FiClock className="size-5" />}
              />
              <MetricCard
                title="Lotes recibidos"
                value={lots.isPending ? "…" : lots.isError ? "—" : received.length}
                description="En la primera página de lotes"
                icon={<FiBox className="size-5" />}
              />
            </>
          ) : null}
          {access.producers ? (
            <MetricCard
              title="Productores consultados"
              value={
                producers.isPending
                  ? "…"
                  : producers.isError
                    ? "—"
                    : (producers.data?.data.length ?? 0)
              }
              description="En la primera página de productores"
              icon={<FiUsers className="size-5" />}
            />
          ) : null}
        </div>
      ) : null}
      {access.producers && producers.isError ? (
        <ErrorState
          title="No se pudieron consultar los productores"
          error={producers.error}
          retry={() => void producers.refetch()}
        />
      ) : null}
      {modules.length ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Tu espacio de gestión</h2>
          <nav
            aria-label="Módulos de tu empresa"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {modules.map((module) => (
              <DashboardLink key={module.href} {...module} />
            ))}
          </nav>
        </section>
      ) : (
        <InlineNotice
          title="Tu cuenta está lista"
          description="Tu rol todavía no tiene módulos de gestión habilitados. Consulta al administrador de tu empresa para revisar tus accesos."
          status="default"
        />
      )}
      {access.lots || access.subscription ? (
        <div
          className={
            "grid min-w-0 items-start gap-6 " +
            (access.lots && access.subscription
              ? "xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
              : "")
          }
        >
          {access.lots ? (
            <section className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Seguimiento de lotes</h2>
                  <p className="mt-1 text-sm text-muted">
                    Primero los pendientes de recepción, dentro de la primera página.
                  </p>
                </div>
                <Link className={dashboardLinkClass} href="/lots">
                  Ver lotes <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              {lots.isPending ? (
                <LoadingState label="Cargando lotes" lines={4} />
              ) : lots.isError ? (
                <ErrorState error={lots.error} retry={() => void lots.refetch()} />
              ) : displayed.length ? (
                <Table className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Lotes de tu empresa">
                      <Table.Header>
                        <Table.Column isRowHeader>Lote</Table.Column>
                        <Table.Column>Estado</Table.Column>
                        <Table.Column>Acción</Table.Column>
                      </Table.Header>
                      <Table.Body items={displayed}>
                        {(lot) => (
                          <Table.Row id={lot.id_lote} className="h-24">
                            <Table.Cell>
                              <Link
                                className="font-semibold hover:text-accent"
                                href={"/lots/" + lot.id_lote}
                              >
                                {lot.codigo_lote}
                              </Link>
                              <p className="mt-1 text-xs text-muted">
                                {lot.producto}
                                {lot.variedad ? " · " + lot.variedad : ""}
                              </p>
                            </Table.Cell>
                            <Table.Cell>
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
                            </Table.Cell>
                            <Table.Cell>
                              <Link
                                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-accent hover:bg-default"
                                href={"/lots/" + lot.id_lote}
                              >
                                <FiEye aria-hidden="true" /> Abrir
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
                  title="Empieza con tu primer lote"
                  description="Los lotes registrados aparecerán aquí para continuar con su recepción y seguimiento."
                  action={
                    canCreateLot ? (
                      <Link className={dashboardLinkClass} href="/lots/new">
                        <FiPlus aria-hidden="true" /> Registrar lote
                      </Link>
                    ) : undefined
                  }
                />
              )}
            </section>
          ) : null}
          {access.subscription ? (
            <Card className="min-w-0 rounded-2xl border border-border bg-surface shadow-sm">
              <Card.Content className="p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
                    <FiLayers aria-hidden="true" className="text-accent" /> Plan y cupos
                  </h2>
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent"
                    href="/settings/subscription"
                  >
                    Gestionar <FiArrowRight aria-hidden="true" />
                  </Link>
                </div>
                {subscription.isPending ? (
                  <LoadingState label="Cargando suscripción" lines={3} />
                ) : subscription.isError ? (
                  <ErrorState
                    error={subscription.error}
                    retry={() => void subscription.refetch()}
                  />
                ) : subscription.data ? (
                  <>
                    <div className="mb-6 border-b border-border pb-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">
                          {plan?.plan.replaceAll("_", " ") ?? "Sin plan asignado"}
                        </p>
                        <StatusBadge tone={subscription.data.active ? "success" : "warning"}>
                          {subscription.data.active
                            ? "Suscripción activa"
                            : "Suscripción no activa"}
                        </StatusBadge>
                      </div>
                      {plan ? (
                        <p className="mt-2 text-xs text-muted">
                          Vencimiento: {formatDate(plan.vence_en)}
                        </p>
                      ) : null}
                    </div>
                    {rights.length ? (
                      <div className="space-y-6">
                        {rights.map((right) => (
                          <QuotaMeter
                            key={right.recurso}
                            label={
                              resourceLabels[right.recurso] ?? right.recurso.replaceAll("_", " ")
                            }
                            used={right.consumido}
                            limit={right.limite}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">
                        Tu suscripción todavía no tiene cupos disponibles para mostrar.
                      </p>
                    )}
                    {rights.some((right) => right.consumido >= right.limite) ? (
                      <p className="mt-6 rounded-xl bg-warning/10 p-4 text-sm text-foreground">
                        Hay recursos sin cupo disponible. Revisa las opciones de tu suscripción
                        antes de registrar nuevas operaciones.
                      </p>
                    ) : null}
                  </>
                ) : null}
              </Card.Content>
            </Card>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <p className="text-xs text-muted">
          Las cifras de registros corresponden a la primera página consultada. Los módulos permiten
          consultar el resto.
        </p>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-accent"
          href="/settings/profile"
        >
          <FiUser aria-hidden="true" /> Mi cuenta
        </Link>
      </div>
    </section>
  );
}
