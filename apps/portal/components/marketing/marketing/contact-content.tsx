"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@heroui/react";
import { FiArrowUpRight, FiLogIn } from "react-icons/fi";

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
        <div className="site-container grid max-w-5xl gap-6 md:grid-cols-2">
          <Card className="site-card h-full">
            <Card.Content className="flex h-full flex-col p-7 sm:p-9">
              <Chip color="accent" size="sm" variant="soft">
                Nuevas empresas
              </Chip>
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

          <Card className="site-card h-full">
            <Card.Content className="flex h-full flex-col p-7 sm:p-9">
              <Chip color="accent" size="sm" variant="soft">
                Cuentas existentes
              </Chip>
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
        </div>

        <Typography.Paragraph className="site-container mt-7 max-w-5xl text-sm leading-7 text-muted">
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
