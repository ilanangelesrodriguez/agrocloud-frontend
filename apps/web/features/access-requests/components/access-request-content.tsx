"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@heroui/react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

import { PageHero } from "@/components/marketing";
import { AccessRequestForm } from "@/features/access-requests/access-request-form";

const steps = ["Envía la solicitud", "Espera la revisión", "Recibe instrucciones"];

export function AccessRequestContent({ privacyVersion }: { privacyVersion?: string }) {
  return (
    <>
      <PageHero
        description="Compártenos la información de tu empresa. El equipo responsable revisará la solicitud y continuará el proceso de incorporación cuando corresponda."
        eyebrow="Acceso empresarial"
        title="Conecta la próxima etapa de tu operación"
      />

      <section className="site-section">
        <div className="site-container max-w-4xl">
          <Card className="mb-8 border border-border bg-surface">
            <Card.Content className="grid gap-4 p-5 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm text-muted">
                  <Chip color="accent" size="sm" variant="soft">
                    {index + 1}
                  </Chip>
                  <FiCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
                  <span>{step}</span>
                </div>
              ))}
            </Card.Content>
          </Card>

          {privacyVersion ? (
            <AccessRequestForm privacyVersion={privacyVersion} />
          ) : (
            <Typography.Paragraph className="rounded-xl border border-border bg-surface p-5">
              El formulario está temporalmente indisponible. Puedes comunicarte por la{" "}
              <Link className="site-text-link" href="/contacto">
                página de contacto
              </Link>
              .
            </Typography.Paragraph>
          )}

          <Typography.Paragraph className="mt-8 text-sm text-muted">
            <Link className="site-text-link" href="/">
              <FiArrowLeft aria-hidden="true" className="size-4" />
              Volver al inicio
            </Link>
          </Typography.Paragraph>
        </div>
      </section>
    </>
  );
}
