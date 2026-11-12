"use client";

import Link from "next/link";
import { Alert, Button, Card, Chip, Typography } from "@heroui/react";
import { FiCheck } from "react-icons/fi";

import { CallToAction, PageHero } from "@/components/marketing";

import { usePublicOffers } from "../hooks/use-public-offers";

const freeFeatures = [
  "Solicitud empresarial",
  "Evaluación y respuesta de acceso",
  "Activación mediante invitación",
  "Alcance sujeto al plan asignado",
];

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const numbers = new Intl.NumberFormat("es-PE");

type PlanCardProps = {
  title: string;
  description: string;
  tag: string;
  features: string[];
  href: string;
  actionLabel: string;
  highlighted?: boolean;
  price?: string;
};

function PlanCard({
  title,
  description,
  tag,
  features,
  href,
  actionLabel,
  highlighted = false,
  price,
}: PlanCardProps) {
  return (
    <Card className="site-card h-full">
      <Card.Content className="flex h-full flex-col p-7 sm:p-9">
        <Chip color={highlighted ? "accent" : "default"} size="sm" variant="soft">
          {tag}
        </Chip>
        <Typography.Heading className="mt-5 text-2xl font-semibold" level={2}>
          {title}
        </Typography.Heading>
        <Typography.Paragraph className="mt-3 text-sm leading-7 text-muted">
          {description}
        </Typography.Paragraph>

        {price ? (
          <Typography.Paragraph className="mt-4 text-xl font-semibold tabular-nums">
            {price}
          </Typography.Paragraph>
        ) : null}

        <div className="mt-7 flex-1 space-y-3">
          {features.map((feature) => (
            <Typography.Paragraph
              key={feature}
              className="flex items-start gap-2.5 text-sm text-foreground"
            >
              <FiCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              {feature}
            </Typography.Paragraph>
          ))}
        </div>

        <Link
          className={`site-button mt-8 w-full justify-center ${
            highlighted ? "site-button-primary" : "site-button-outline"
          }`}
          href={href}
        >
          {actionLabel}
        </Link>
      </Card.Content>
    </Card>
  );
}

export function PlansContent() {
  const offers = usePublicOffers();
  const publishedOffers = offers.data?.filter((offer) => offer.available) ?? [];

  return (
    <>
      <PageHero
        description="Explora las modalidades de incorporación a AgroCloud. Las condiciones, capacidades, complementos y precios deben confirmarse en una oferta vigente."
        eyebrow="Planes y acceso"
        title="Una plataforma que acompaña tu operación"
      />

      <section className="site-section">
        <div className="site-container grid max-w-5xl gap-6 md:grid-cols-2">
          <PlanCard
            highlighted
            actionLabel="Solicitar acceso"
            description="Modalidad de solicitud empresarial con revisión y aprobación antes de la incorporación."
            features={freeFeatures}
            href="/solicitar-acceso"
            tag="Sujeto a evaluación"
            title="Acceso gratuito"
          />
          {publishedOffers.map((offer) => (
            <PlanCard
              key={offer.key}
              actionLabel="Consultar condiciones"
              description={offer.description || "Plan empresarial de AgroCloud AI."}
              features={[
                `Duración: ${numbers.format(offer.duration_days)} días`,
                `Usuarios: ${numbers.format(offer.limits.usuarios)}`,
                `Lotes: ${numbers.format(offer.limits.lotes)}`,
                `Análisis IA: ${numbers.format(offer.limits.analisis_ia)}`,
              ]}
              href="/contacto"
              price={currency.format(offer.amount_cents / 100)}
              tag="Oferta vigente"
              title={offer.name}
            />
          ))}
          {offers.isPending ? (
            <p className="rounded-card border border-border p-7 text-muted" role="status">
              Cargando planes empresariales…
            </p>
          ) : offers.isError && !offers.data ? (
            <div className="rounded-card border border-border p-7">
              <p className="text-muted" role="status">{offers.error.message}</p>
              <Button
                className="mt-4"
                isDisabled={offers.isFetching}
                variant="secondary"
                onPress={() => {
                  void offers.refetch();
                }}
              >
                Reintentar
              </Button>
            </div>
          ) : publishedOffers.length === 0 ? (
            <p className="rounded-card border border-border p-7 text-muted" role="status">
              Actualmente no hay ofertas empresariales publicadas.
            </p>
          ) : null}
        </div>

        <div className="site-container mt-8 max-w-5xl">
          <Alert className="border border-warning/25" status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Información sobre precios</Alert.Title>
              <Alert.Description>
                Esta página no constituye una cotización. Las capacidades, los límites y las tarifas
                deben confirmarse antes de contratar. El pago y la gestión de suscripciones se
                realizarán mediante el flujo seguro de la plataforma.
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
