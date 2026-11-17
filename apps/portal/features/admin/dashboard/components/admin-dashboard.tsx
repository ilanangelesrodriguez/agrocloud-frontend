"use client";

import Link from "next/link";
import { Button, Card, toast } from "@heroui/react";
import {
  FiArrowRight,
  FiBriefcase,
  FiClipboard,
  FiCreditCard,
  FiPlus,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "@agrocloud/ui";
import { DashboardLink, dashboardLinkClass } from "@/features/dashboard/components/dashboard-link";
import { useAccessRequests } from "@/features/admin/access-requests/hooks";
import { RequestDetails } from "@/features/admin/access-requests/components/request-details";
import { useCompaniesPage } from "@/features/admin/companies/hooks";
import { companyStatus, companyTone } from "@/features/admin/companies/status";
import { useOffers } from "@/features/admin/offers/hooks";
import { stateLabels, offerTone } from "@/features/admin/offers/labels";
import { money } from "@/features/admin/offers/schema";

const modules = [
  {
    href: "/admin/access-requests",
    title: "Solicitudes",
    description: "Revisa empresas interesadas y gestiona su incorporación.",
    icon: FiClipboard,
  },
  {
    href: "/admin/companies",
    title: "Empresas",
    description: "Consulta las organizaciones registradas y sus datos.",
    icon: FiBriefcase,
  },
  {
    href: "/admin/users",
    title: "Usuarios",
    description: "Invita usuarios y administra sus accesos a la plataforma.",
    icon: FiUsers,
  },
  {
    href: "/admin/plans",
    title: "Planes y ofertas",
    description: "Gestiona precios, condiciones y publicación del catálogo.",
    icon: FiCreditCard,
  },
];

export function AdminDashboard() {
  const requests = useAccessRequests(1);
  const companies = useCompaniesPage(1);
  const offers = useOffers();
  const refreshing = requests.isFetching || companies.isFetching || offers.isFetching;
  const review = (requests.data?.data ?? []).filter(
    (request) => !["APROBADA", "RECHAZADA"].includes(request.estado),
  );
  const published = (offers.data?.data ?? []).filter((offer) => offer.status === "PUBLISHED");
  async function refresh() {
    const results = await Promise.all([requests.refetch(), companies.refetch(), offers.refetch()]);
    if (results.some((result) => result.isError))
      toast.warning("Actualización incompleta", {
        description: "Algunos datos no pudieron actualizarse. Puedes reintentar en cada sección.",
      });
    else toast.success("Panel actualizado");
  }
  return (
    <section className="min-w-0 space-y-8">
      <PageHeader
        title="Resumen de plataforma"
        description="Gestiona la incorporación de empresas, los accesos y las ofertas de AgroCloud."
        actions={
          <Button isDisabled={refreshing} variant="secondary" onPress={() => void refresh()}>
            <FiRefreshCw
              aria-hidden="true"
              className={refreshing ? "animate-spin motion-reduce:animate-none" : ""}
            />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </Button>
        }
      />
      <Card className="rounded-2xl border border-accent/15 bg-accent/5 shadow-none">
        <Card.Content className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Administración global
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Cada empresa empieza con un buen acceso.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Revisa solicitudes y prepara los accesos de los equipos. Desde aquí también puedes
              mantener actualizado el catálogo comercial.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link className={dashboardLinkClass} href="/admin/access-requests">
              <FiClipboard aria-hidden="true" /> Revisar solicitudes
            </Link>
            <Link className={dashboardLinkClass} href="/admin/users/new">
              <FiPlus aria-hidden="true" /> Invitar usuario
            </Link>
          </div>
        </Card.Content>
      </Card>
      <nav
        aria-label="Módulos de administración"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {modules.map((module) => (
          <DashboardLink key={module.href} {...module} />
        ))}
      </nav>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Solicitudes por revisar"
          value={requests.isPending ? "…" : requests.isError ? "—" : review.length}
          description={
            requests.isError ? "Consulta no disponible" : "En la primera página de solicitudes"
          }
          icon={<FiClipboard className="size-5" />}
        />
        <MetricCard
          title="Empresas consultadas"
          value={
            companies.isPending ? "…" : companies.isError ? "—" : (companies.data?.data.length ?? 0)
          }
          description={
            companies.isError ? "Consulta no disponible" : "En la primera página de empresas"
          }
          icon={<FiBriefcase className="size-5" />}
        />
        <MetricCard
          title="Ofertas publicadas"
          value={offers.isPending ? "…" : offers.isError ? "—" : published.length}
          description={offers.isError ? "Consulta no disponible" : "En el catálogo consultado"}
          icon={<FiCreditCard className="size-5" />}
        />
      </div>
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Revisión de solicitudes</h2>
              <p className="mt-1 text-sm text-muted">
                Solicitudes abiertas de la primera página consultada.
              </p>
            </div>
            <Link className={dashboardLinkClass} href="/admin/access-requests">
              Ver solicitudes <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          {requests.isPending ? (
            <LoadingState label="Cargando solicitudes" lines={3} />
          ) : requests.isError ? (
            <ErrorState error={requests.error} retry={() => void requests.refetch()} />
          ) : review.length ? (
            <div className="space-y-3">
              {review.slice(0, 3).map((request) => (
                <RequestDetails key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin solicitudes por revisar en esta vista"
              description={
                requests.data.last_page > 1
                  ? "Consulta las siguientes páginas en el módulo de solicitudes."
                  : "Las nuevas solicitudes empresariales aparecerán aquí."
              }
              action={
                <Link className={dashboardLinkClass} href="/admin/access-requests">
                  <FiClipboard aria-hidden="true" /> Abrir solicitudes
                </Link>
              }
            />
          )}
        </section>
        <div className="min-w-0 space-y-6">
          <Card className="rounded-2xl border border-border bg-surface shadow-sm">
            <Card.Content className="p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Empresas</h2>
                <Link
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent"
                  href="/admin/companies"
                >
                  Ver todas <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              {companies.isPending ? (
                <LoadingState label="Cargando empresas" lines={2} />
              ) : companies.isError ? (
                <ErrorState error={companies.error} retry={() => void companies.refetch()} />
              ) : companies.data.data.length ? (
                <ul className="divide-y divide-border">
                  {companies.data.data.slice(0, 4).map((company) => (
                    <li key={company.id_empresa} className="py-4 first:pt-0 last:pb-0">
                      <Link
                        className="block break-words text-sm font-semibold text-foreground hover:text-accent [overflow-wrap:anywhere]"
                        href={"/admin/companies/" + company.id_empresa}
                      >
                        {company.razon_social}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted">RUC {company.ruc}</span>
                        <StatusBadge tone={companyTone(company.estado)}>
                          {companyStatus(company.estado)}
                        </StatusBadge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Todavía no hay empresas registradas.</p>
              )}
            </Card.Content>
          </Card>
          <Card className="rounded-2xl border border-border bg-surface shadow-sm">
            <Card.Content className="p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Catálogo comercial</h2>
                <Link
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent"
                  href="/admin/plans"
                >
                  Gestionar <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              {offers.isPending ? (
                <LoadingState label="Cargando catálogo" lines={2} />
              ) : offers.isError ? (
                <ErrorState error={offers.error} retry={() => void offers.refetch()} />
              ) : offers.data.data.length ? (
                <ul className="divide-y divide-border">
                  {offers.data.data.slice(0, 3).map((offer) => (
                    <li key={offer.key} className="py-4 first:pt-0 last:pb-0">
                      <Link
                        className="block break-words text-sm font-semibold hover:text-accent"
                        href={"/admin/plans/" + offer.key}
                      >
                        {offer.terms.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium tabular-nums">
                          {money.format(offer.terms.amount_cents / 100)}
                        </span>
                        <StatusBadge tone={offerTone(offer.status)}>
                          {stateLabels[offer.status]}
                        </StatusBadge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  Crea tu primera oferta para preparar el catálogo.
                </p>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </section>
  );
}
