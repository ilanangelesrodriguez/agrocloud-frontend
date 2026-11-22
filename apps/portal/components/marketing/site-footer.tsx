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
      <div className="site-container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <SiteBrand />
          <Typography.Paragraph className="text-sm leading-7 text-muted">
            Calidad agrícola y trazabilidad, conectadas desde el origen hasta el dictamen. La IA
            acompaña; el equipo responsable decide.
          </Typography.Paragraph>
        </div>
        <div className="space-y-3">
          <Typography.Heading className="text-sm font-semibold text-foreground" level={2}>
            Explorar
          </Typography.Heading>
          <nav aria-label="Enlaces del sitio" className="flex flex-col gap-2 text-sm text-muted">
            <Link className="hover:text-accent" href="/funcionalidades">
              Funcionalidades
            </Link>
            <Link className="hover:text-accent" href="/como-funciona">
              Cómo funciona
            </Link>
            <Link className="hover:text-accent" href="/planes">
              Planes y acceso
            </Link>
            <Link className="hover:text-accent" href="/nosotros">
              Nosotros
            </Link>
          </nav>
        </div>
        <div className="space-y-3">
          <Typography.Heading className="text-sm font-semibold text-foreground" level={2}>
            Información
          </Typography.Heading>
          <nav aria-label="Información y acceso" className="flex flex-col gap-2 text-sm text-muted">
            <Link className="hover:text-accent" href="/contacto">
              Contacto
            </Link>
            <Link className="hover:text-accent" href={onboardingAvailable ? "/solicitar-acceso" : "/planes"}>
              {onboardingAvailable ? "Solicitar acceso" : "Explorar planes"}
            </Link>
            {portalEntryUrl && (
              <a className="hover:text-accent" href={portalEntryUrl}>
                Acceso al portal
              </a>
            )}
            <Link className="hover:text-accent" href="/privacidad">
              Privacidad
            </Link>
            <Link className="hover:text-accent" href="/terminos">
              Términos del servicio
            </Link>
          </nav>
        </div>
      </div>
      <div className="site-container flex flex-col justify-between gap-2 border-t border-border py-5 text-xs text-muted sm:flex-row">
        <Typography.Paragraph>
          © {new Date().getFullYear()} AgroCloud AI. Plataforma de gestión agrícola.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Diseñada para procesos trazables y decisiones documentadas.
        </Typography.Paragraph>
      </div>
    </footer>
  );
}
