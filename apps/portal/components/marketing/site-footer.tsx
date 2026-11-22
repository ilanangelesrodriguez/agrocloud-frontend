"use client";

import { Typography } from "@heroui/react";
import Link from "next/link";

import { SiteBrand } from "@/components/marketing/site-brand";
import { useOnboardingAvailability } from "@/components/marketing/onboarding-availability";
import { portalEntryUrl } from "@/config/marketing/site";

export function SiteFooter() {
  const onboardingAvailable = useOnboardingAvailability();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="site-container grid gap-x-10 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-12">
        <div className="max-w-xs space-y-3 sm:col-span-2 lg:col-span-1">
          <SiteBrand />
          <Typography.Paragraph className="leading-6 text-muted" size="sm">
            Calidad agrícola y trazabilidad, desde el origen hasta el dictamen. Las decisiones las
            valida el equipo responsable.
          </Typography.Paragraph>
        </div>
        <div className="space-y-3">
          <Typography.Heading className="text-sm font-semibold leading-6 text-foreground" level={2}>
            Explorar
          </Typography.Heading>
          <nav aria-label="Enlaces del sitio" className="flex flex-col gap-2 text-sm leading-6 text-muted">
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href="/funcionalidades">
              Funcionalidades
            </Link>
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href="/como-funciona">
              Cómo funciona
            </Link>
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href="/planes">
              Planes y acceso
            </Link>
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href="/nosotros">
              Nosotros
            </Link>
          </nav>
        </div>
        <div className="space-y-3">
          <Typography.Heading className="text-sm font-semibold leading-6 text-foreground" level={2}>
            Información
          </Typography.Heading>
          <nav aria-label="Información y acceso" className="flex flex-col gap-2 text-sm leading-6 text-muted">
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href="/contacto">
              Contacto
            </Link>
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href={onboardingAvailable ? "/solicitar-acceso" : "/planes"}>
              {onboardingAvailable ? "Solicitar acceso" : "Explorar planes"}
            </Link>
            {portalEntryUrl && (
              <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href={portalEntryUrl}>
                Acceso al portal
              </Link>
            )}
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href="/privacidad">
              Privacidad
            </Link>
            <Link className="text-sm transition-colors hover:text-accent focus-visible:underline" href="/terminos">
              Términos del servicio
            </Link>
          </nav>
        </div>
      </div>
      <div className="site-container flex flex-col items-start justify-between gap-2 border-t border-border py-4 text-muted sm:flex-row sm:items-center">
        <Typography.Paragraph className="leading-5 text-muted" size="xs">
          © {new Date().getFullYear()} AgroCloud AI. Todos los derechos reservados.
        </Typography.Paragraph>
        <Typography.Paragraph className="leading-5 text-muted" size="xs">
          Gestión de calidad y trazabilidad agrícola.
        </Typography.Paragraph>
      </div>
    </footer>
  );
}
