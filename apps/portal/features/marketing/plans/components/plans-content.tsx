"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { Alert } from "@heroui/react";

import { usePublicOffers } from "../hooks/use-public-offers";

import { PlanCard } from "./plan-card";
import { PlansState } from "./plans-state";

import { CallToAction, PageHero } from "@/components/marketing/marketing";

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const numbers = new Intl.NumberFormat("es-PE");

function planRequestUrl(offerKey: string) {
  return "/solicitar-acceso?" + new URLSearchParams({ offer: offerKey });
}

export function PlansContent() {
  const offers = usePublicOffers();
  const { data: actor } = useCurrentUser();
  const publishedOffers = offers.data?.data.filter((offer) => offer.available) ?? [];
  const free = offers.data?.free;
  const freeFeatures = free
    ? [
        `Vigencia: ${numbers.format(free.duration_days)} días`,
        `Usuarios: ${numbers.format(free.limits.usuarios)}`,
        `Lotes: ${numbers.format(free.limits.lotes)}`,
        `Análisis IA: ${numbers.format(free.limits.analisis_ia)}`,
      ]
    : ["La vigencia y los cupos gratuitos se confirman al activar tu cuenta."];

  return (
    <>
      <PageHero
        description="Explora las modalidades de incorporación a AgroCloud. Los precios y cupos empresariales se muestran desde las ofertas vigentes."
        eyebrow="Planes y acceso"
        title="Una plataforma que acompaña tu operación"
      />
      <section className="site-section">
        <div className="site-container grid max-w-5xl gap-6 md:grid-cols-2">
          <PlanCard
            highlighted
            actionLabel={actor ? "Continuar en el portal" : "Comenzar gratis"}
            description="Plan inicial sin cobros, sujeto a aprobación. La vigencia comienza cuando se activa la cuenta del administrador."
            features={freeFeatures}
            href={
              actor
                ? actor.rol?.codigo === "SUPERADMIN"
                  ? "/admin"
                  : "/dashboard"
                : "/solicitar-acceso"
            }
            tag="Acceso sujeto a aprobación"
            price={currency.format(0)}
            title="Acceso gratuito"
          />
          {publishedOffers.map((offer) => {
            const purchaseUrl = !actor
              ? planRequestUrl(offer.key)
              : actor.rol?.codigo === "SUPERADMIN"
                ? "/admin/plans"
                : canManageCompany(actor, "suscripciones.ver")
                  ? "/settings/subscription?" + new URLSearchParams({ offer: offer.key })
                  : "/dashboard";

            return (
              <PlanCard
                key={offer.key}
                actionLabel={actor ? "Consultar plan en el portal" : "Elegir plan"}
                description={offer.description || "Plan empresarial publicado por AgroCloud AI."}
                features={[
                  `Vigencia: ${numbers.format(offer.duration_days)} días`,
                  `Usuarios: ${numbers.format(offer.limits.usuarios)}`,
                  `Lotes: ${numbers.format(offer.limits.lotes)}`,
                  `Análisis IA: ${numbers.format(offer.limits.analisis_ia)}`,
                ]}
                href={purchaseUrl ?? "/contacto"}
                price={currency.format(offer.amount_cents / 100)}
                tag="Oferta vigente"
                title={offer.name}
              />
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
        <div className="site-container mt-8 max-w-5xl">
          <Alert className="border border-warning/25" status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Condiciones de contratación</Alert.Title>
              <Alert.Description>
                Tanto el acceso gratuito como un plan pagado comienzan con una única solicitud de
                incorporación. Elegir un plan no implica un cobro ni reserva su precio. Tras la
                aprobación y activación, puedes utilizar Gratis y confirmar la oferta vigente
                cuando decidas contratar. Las empresas registradas gestionan suscripciones desde el portal.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      </section>
      <CallToAction
        button="Enviar solicitud"
        text="Puedes comenzar enviando una solicitud empresarial y compartiendo las necesidades de tu equipo."
        title="Conversemos sobre tu operación"
      />
    </>
  );
}
