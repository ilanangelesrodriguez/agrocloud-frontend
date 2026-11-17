"use client";

import Link from "next/link";
import { Alert, Card, Typography } from "@heroui/react";
import { FiArrowLeft } from "react-icons/fi";

import { PageHero } from "@/components/marketing/marketing";
import { AccessRequestForm } from "@/features/marketing/access-requests/access-request-form";

const steps = [
  { title: "Envía la solicitud", text: "Datos de tu empresa" },
  { title: "Espera la revisión", text: "El equipo evalúa el registro" },
  { title: "Recibe instrucciones", text: "Por canales oficiales" },
];

type Props = { privacyVersion?: string };

export function AccessRequestContent({ privacyVersion }: Props) {
  return (
    <>
      <PageHero
        description="Compártenos los datos de tu empresa. El equipo responsable revisará la solicitud y continuará la incorporación cuando corresponda."
        eyebrow="Acceso empresarial"
        title="Conecta la próxima etapa de tu operación"
      />
      <section className="site-section">
        <div className="site-container max-w-4xl">
          <Card className="mb-8 border border-brand-600/20 bg-surface shadow-sm shadow-brand-700/5">
            <Card.Content className="p-5 sm:p-6">
              {/* Proceso en 3 pasos: círculo + texto, unidos por una línea en escritorio */}
              <ol aria-label="Proceso de solicitud" className="flex flex-col gap-5 sm:flex-row">
                {steps.map((step, index) => {
                  const isFirst = index === 0;
                  const isLast = index === steps.length - 1;

                  return (
                    <li
                      key={step.title}
                      className={`flex items-center gap-3 ${isLast ? "sm:flex-none" : "sm:flex-1"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold ${
                          isFirst
                            ? "bg-brand-700 text-white shadow-md shadow-brand-700/25"
                            : "bg-brand-600/10 text-brand-700 dark:bg-brand-700/25 dark:text-brand-400"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <Typography.Paragraph className="text-sm font-semibold leading-snug text-foreground">
                          {step.title}
                        </Typography.Paragraph>
                        <Typography.Paragraph className="text-xs leading-snug text-muted">
                          {step.text}
                        </Typography.Paragraph>
                      </div>
                      {!isLast ? (
                        <span
                          aria-hidden="true"
                          className="mx-2 hidden h-px min-w-6 flex-1 bg-brand-600/25 sm:block"
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </Card.Content>
          </Card>

          {privacyVersion ? (
            <AccessRequestForm privacyVersion={privacyVersion} />
          ) : (
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Solicitudes temporalmente deshabilitadas</Alert.Title>
                <Alert.Description>
                  El registro empresarial se habilitará cuando el aviso de privacidad y los
                  servicios de incorporación estén validados. Vuelve a consultar esta página.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <div className="mt-8 border-t border-border pt-6">
            <Link className="site-text-link" href="/">
              <FiArrowLeft aria-hidden="true" className="size-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
