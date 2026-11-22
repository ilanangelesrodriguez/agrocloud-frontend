"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@heroui/react";
import { FiArrowUpRight, FiLogIn, FiBriefcase, FiShield, FiCheckCircle } from "react-icons/fi";
import { Reveal } from "@/components/marketing/reveal";

import { PageHero } from "@/components/marketing/marketing";
import { useOnboardingAvailability } from "@/components/marketing/onboarding-availability";
import { portalLoginUrl } from "@/config/marketing/site";

export function ContactContent() {
  const onboardingAvailable = useOnboardingAvailability();

  return (
    <>
      <PageHero
        description={
          onboardingAvailable
            ? "Si necesitas implementar AgroCloud, inicia una solicitud empresarial para revisión."
            : "Conoce nuestras modalidades de acceso. El formulario para nuevas empresas está temporalmente deshabilitado."
        }
        eyebrow="Contacto"
        title="¿Cómo podemos ayudarte a comenzar?"
      />

      <section className="site-section site-section-first">
        <div className="site-container grid max-w-6xl gap-5 lg:grid-cols-2 lg:gap-7">
          <Reveal viewport className="h-full">
            <Card className="site-card h-full border border-brand-600/20 shadow-sm shadow-brand-700/5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
            <Card.Content className="flex h-full flex-col p-7 sm:p-9">
              <div className="flex items-center justify-between gap-3">
                <Chip color="accent" size="sm" variant="soft">
                  Nuevas empresas
                </Chip>
                <span className="grid size-11 place-items-center rounded-xl bg-brand-600/10 text-accent">
                  <FiBriefcase aria-hidden="true" className="size-5" />
                </span>
              </div>
              <Typography.Heading className="mt-4 text-2xl font-semibold" level={2}>
                {onboardingAvailable ? "Solicitar acceso" : "Explorar planes"}
              </Typography.Heading>
              <Typography.Paragraph className="mt-3 min-h-20 text-sm leading-7 text-muted">
                {onboardingAvailable
                  ? "Envía los datos de tu organización y describe su operación. La solicitud se registrará para revisión."
                  : "Consulta las modalidades disponibles. Las nuevas solicitudes se habilitarán después de validar la incorporación y el aviso de privacidad."}
              </Typography.Paragraph>
              <Link
                className="site-button site-button-primary mt-6"
                href={onboardingAvailable ? "/solicitar-acceso" : "/planes"}
              >
                {onboardingAvailable ? "Completar solicitud" : "Ver planes"}
                <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Card.Content>
            </Card>
          </Reveal>

          <Reveal viewport className="h-full" delay={0.09}>
            <Card className="site-card h-full border border-brand-600/20 shadow-sm shadow-brand-700/5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
            <Card.Content className="flex h-full flex-col p-7 sm:p-9">
              <div className="flex items-center justify-between gap-3">
                <Chip color="accent" size="sm" variant="soft">
                  Cuentas existentes
                </Chip>
                <span className="grid size-11 place-items-center rounded-xl bg-brand-600/10 text-accent">
                  <FiShield aria-hidden="true" className="size-5" />
                </span>
              </div>
              <Typography.Heading className="mt-4 text-2xl font-semibold" level={2}>
                Acceder al portal
              </Typography.Heading>
              <Typography.Paragraph className="mt-3 min-h-20 text-sm leading-7 text-muted">
                Si ya tienes un usuario activo, utiliza el portal empresarial. Las consultas sobre
                cuentas se gestionan por los canales de tu organización.
              </Typography.Paragraph>
              {portalLoginUrl ? (
                <Link className="site-button site-button-outline mt-6" href={portalLoginUrl}>
                  Ir al portal
                  <FiLogIn aria-hidden="true" className="size-4" />
                </Link>
              ) : (
                <Typography.Paragraph className="mt-6 text-xs leading-6 text-muted">
                  El enlace al portal se habilitará cuando se configure su dirección pública.
                </Typography.Paragraph>
              )}
            </Card.Content>
            </Card>
          </Reveal>
        </div>

        <Typography.Paragraph className="site-container mt-7 flex max-w-6xl items-start gap-2 text-sm leading-7 text-muted">
          <FiCheckCircle aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-accent" />
          {onboardingAvailable
            ? "Para incorporaciones nuevas, utiliza el formulario empresarial."
            : "La recepción de solicitudes empresariales todavía no está habilitada."}{" "}
          Si tu organización ya tiene una cuenta, solicita asistencia a su administrador. Los
          canales oficiales de soporte se comunicarán cuando estén disponibles.
        </Typography.Paragraph>
      </section>
    </>
  );
}
