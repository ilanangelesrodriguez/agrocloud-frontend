"use client";

import Link from "next/link";
import { Card, Typography } from "@heroui/react";
import { FiCheckCircle } from "react-icons/fi";

export function RequestSuccessContent({ reference }: { reference?: string }) {
  return (
    <section className="site-container flex min-h-[65vh] items-center justify-center py-20">
      <Card className="site-card w-full max-w-xl">
        <Card.Content className="p-8 text-center sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400">
            <FiCheckCircle aria-hidden="true" className="size-8" />
          </span>
          <Typography.Heading className="mt-6 text-3xl font-semibold tracking-tight" level={1}>
            {reference ? "Solicitud enviada para revisión" : "Recepción de solicitudes"}
          </Typography.Heading>
          <Typography.Paragraph className="mt-4 text-sm leading-8 text-muted">
            Si acabas de completar el formulario y recibiste una confirmación, la solicitud fue
            registrada. El siguiente paso depende de su revisión. No es necesario enviar el
            formulario repetidamente.
          </Typography.Paragraph>
          {reference ? (
            <dl className="mt-6 rounded-xl bg-surface-secondary p-4 text-sm">
              <dt className="font-semibold">Referencia de recepción</dt>
              <dd className="mt-1 break-all font-mono">{reference}</dd>
            </dl>
          ) : null}
          <Typography.Paragraph className="mt-3 text-xs leading-6 text-muted">
            La referencia es un comprobante de recepción. Esta página no consulta el estado de la solicitud.
          </Typography.Paragraph>
          <Link className="site-button site-button-primary mt-8" href="/">
            Volver al inicio
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
