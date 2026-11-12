"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@heroui/react";
import { FiArrowUpRight, FiLogIn } from "react-icons/fi";

import { PageHero } from "@/components/marketing";
import { portalLoginUrl } from "@/config/site";

export function ContactContent() {
  return (
    <>
      <PageHero
        description="Si necesitas implementar AgroCloud en tu operación, inicia una solicitud empresarial. Nuestro proceso permite compartir tu información y las necesidades de tu equipo."
        eyebrow="Contacto"
        title="Cuéntanos cómo trabaja tu empresa"
      />

      <section className="site-section">
        <div className="site-container grid max-w-5xl gap-6 md:grid-cols-2">
          <Card className="site-card h-full">
            <Card.Content className="flex h-full flex-col p-7 sm:p-9">
              <Chip color="accent" size="sm" variant="soft">
                Nuevas empresas
              </Chip>
              <Typography.Heading className="mt-4 text-2xl font-semibold" level={2}>
                Solicitar acceso
              </Typography.Heading>
              <Typography.Paragraph className="mt-3 min-h-20 text-sm leading-7 text-muted">
                Envía los datos de tu organización y una descripción de su operación. La solicitud
                se registrará para revisión.
              </Typography.Paragraph>
              <Link className="site-button site-button-primary mt-6" href="/solicitar-acceso">
                Completar solicitud
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
                <a className="site-button site-button-outline mt-6" href={portalLoginUrl}>
                  Ir al portal
                  <FiLogIn aria-hidden="true" className="size-4" />
                </a>
              ) : (
                <Typography.Paragraph className="mt-6 text-xs leading-6 text-muted">
                  El enlace al portal se habilitará cuando se configure su dirección pública.
                </Typography.Paragraph>
              )}
            </Card.Content>
          </Card>
        </div>

        <Typography.Paragraph className="site-container mt-7 max-w-5xl text-sm leading-7 text-muted">
          Esta página no ofrece un chat ni un correo de atención configurados. Los canales oficiales
          deben publicarse cuando estén disponibles, sin exponer direcciones personales.
        </Typography.Paragraph>
      </section>
    </>
  );
}
