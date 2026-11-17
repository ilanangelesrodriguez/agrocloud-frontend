"use client";

import { Alert } from "@heroui/react";

import { usePublicOffers } from "../hooks/use-public-offers";

import { PlanCard } from "./plan-card";
import { PlansState } from "./plans-state";

import { CallToAction, PageHero } from "@/components/marketing/marketing";

const freeFeatures = [
  "Solicitud empresarial",
  "Evaluación y respuesta de acceso",
  "Activación mediante invitación",
  "Alcance sujeto al plan asignado",
];

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const numbers = new Intl.NumberFormat("es-PE");

function planPurchaseUrl(offerKey: string): string | null {
  return "/login?" + new URLSearchParams({ next: "/settings/subscription", offer: offerKey });
}

export function PlansContent() {
  const offers = usePublicOffers();
  const publishedOffers = offers.data?.filter((offer) => offer.available) ?? [];

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
            actionLabel="Solicitar acceso"
            description="Solicitud empresarial gratuita, sujeta a revisión y aprobación. Los cupos se asignan al aprobarla."
            features={freeFeatures}
            href="/solicitar-acceso"
            tag="Acceso sujeto a aprobación"
            title="Acceso gratuito"
          />
          {publishedOffers.map((offer) => {
            const purchaseUrl = planPurchaseUrl(offer.key);

            return (
              <PlanCard
                key={offer.key}
                actionLabel={purchaseUrl ? "Contratar plan" : "Consultar disponibilidad"}
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
                Inicia sesión en el portal para confirmar tu oferta y continuar al pago. Si tu
                empresa todavía no tiene una cuenta, solicita acceso primero.
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
