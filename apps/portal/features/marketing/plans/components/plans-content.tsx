"use client";

import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiInfo, FiShield } from "react-icons/fi";

import { useOnboardingAvailability } from "@/components/marketing/onboarding-availability";
import { CallToAction, PageHero } from "@/components/marketing/marketing";
import { Reveal } from "@/components/marketing/reveal";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";

import { usePublicOffers } from "../hooks/use-public-offers";

import { PlanCard } from "./plan-card";
import { PlansState } from "./plans-state";

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

function planRequestUrl(offerKey: string) {
  return "/solicitar-acceso?" + new URLSearchParams({ offer: offerKey });
}

export function PlansContent() {
  const offers = usePublicOffers();
  const onboardingAvailable = useOnboardingAvailability();
  const { data: actor } = useCurrentUser();
  const publishedOffers = offers.data?.data.filter((offer) => offer.available) ?? [];
  const free = offers.data?.free;

  return (
    <>
      <PageHero
        compact
        description="Compara el acceso gratuito y las ofertas publicadas. Cada modalidad tiene límites y vigencia propios; elegir una oferta no genera cobros."
        eyebrow="Planes y acceso"
        title="Elige el acceso que necesita tu empresa"
      />
      <section className="site-section site-section-first">
        <div className="site-container max-w-5xl">
          {!onboardingAvailable && !actor ? (
            <div
              className="mb-7 flex items-start gap-3 rounded-2xl border border-brand-600/20 bg-brand-50/50 p-4 text-sm dark:bg-brand-700/10"
              role="status"
            >
              <FiInfo aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  El registro empresarial aún no está habilitado
                </p>
                <p className="leading-6 text-muted">
                  Puedes comparar precios y cuotas. Las solicitudes estarán disponibles cuando
                  concluya la validación de incorporación y privacidad.
                </p>
              </div>
            </div>
          ) : null}

          <Reveal viewport>
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                  Modalidades disponibles
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Compara lo que incluye cada opción
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Los importes de las ofertas empresariales provienen del catálogo publicado.
                </p>
              </div>
              <Link
                className="site-text-link shrink-0 self-start sm:self-auto"
                href="/como-funciona"
              >
                Conoce el proceso
                <FiArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </Reveal>

          <div className="grid items-stretch gap-5 md:grid-cols-2 lg:gap-6">
            <Reveal className="h-full" viewport>
              <PlanCard
                highlighted
                actionLabel={actor ? "Continuar en el portal" : "Comenzar gratis"}
                description="Una forma de conocer AgroCloud y empezar a gestionar la calidad agrícola sin realizar un pago."
                disabledAction={!actor && !onboardingAvailable}
                durationDays={free?.duration_days}
                href={
                  actor
                    ? actor.rol?.codigo === "SUPERADMIN"
                      ? "/admin"
                      : "/dashboard"
                    : "/solicitar-acceso"
                }
                kind="free"
                limits={free?.limits}
                price={currency.format(0)}
                tag="Acceso gratuito"
                title="Comienza sin costo"
              />
            </Reveal>

            {publishedOffers.map((offer, index) => {
              const purchaseUrl = !actor
                ? planRequestUrl(offer.key)
                : actor.rol?.codigo === "SUPERADMIN"
                  ? "/admin/plans"
                  : canManageCompany(actor, "suscripciones.ver")
                    ? "/settings/subscription?" + new URLSearchParams({ offer: offer.key })
                    : "/dashboard";

              return (
                <Reveal
                  key={offer.key}
                  className="h-full"
                  delay={Math.min(index + 1, 3) * 0.07}
                  viewport
                >
                  <PlanCard
                    actionLabel={actor ? "Consultar en el portal" : "Elegir este plan"}
                    description={
                      offer.description || "Oferta empresarial con vigencia y cuotas definidas."
                    }
                    disabledAction={!actor && !onboardingAvailable}
                    durationDays={offer.duration_days}
                    href={purchaseUrl}
                    kind="paid"
                    limits={offer.limits}
                    price={currency.format(offer.amount_cents / 100)}
                    tag="Oferta publicada"
                    title={offer.name}
                  />
                </Reveal>
              );
            })}

            {offers.isPending ? (
              <PlansState state="loading" />
            ) : offers.isError && !offers.data ? (
              <PlansState
                error={offers.error.message}
                isFetching={offers.isFetching}
                state="error"
                onRetry={() => void offers.refetch()}
              />
            ) : publishedOffers.length === 0 ? (
              <PlansState state="empty" />
            ) : null}
          </div>

          <Reveal viewport>
            <div className="mt-7 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[auto_1fr] sm:gap-4 sm:p-6">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-600/10 text-accent">
                <FiShield aria-hidden="true" className="size-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-foreground">
                  Una incorporación, sin cargos inesperados
                </h2>
                <div className="grid gap-2 text-sm leading-6 text-muted sm:grid-cols-3 sm:gap-4">
                  <p className="flex items-start gap-2">
                    <FiCheckCircle
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-accent"
                    />
                    Envías una solicitud empresarial.
                  </p>
                  <p className="flex items-start gap-2">
                    <FiCheckCircle
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-accent"
                    />
                    Se revisa y, si es aprobada, activas tu acceso.
                  </p>
                  <p className="flex items-start gap-2">
                    <FiCheckCircle
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-accent"
                    />
                    Contratas una oferta solo cuando confirmas sus condiciones vigentes.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <CallToAction
        button="Enviar solicitud"
        text="Explora una modalidad de acceso, registra tu empresa cuando se habiliten las solicitudes y continúa el proceso de aprobación."
        title="Da el siguiente paso con AgroCloud"
      />
    </>
  );
}
