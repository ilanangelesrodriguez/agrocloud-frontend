"use client";

import Link from "next/link";
import { Button, Card, toast, Typography } from "@heroui/react";
import { FiCheckCircle, FiCopy } from "react-icons/fi";

type Props = { reference?: string };

export function RequestSuccessContent({ reference }: Props) {
  async function copyReference() {
    if (!reference) return;

    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Referencia copiada");
    } catch {
      toast.danger("No fue posible copiar la referencia");
    }
  }

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
            Si recibiste una confirmación tras completar el formulario, tu solicitud fue registrada
            y está pendiente de revisión. No es necesario enviarla repetidamente.
          </Typography.Paragraph>
          {reference ? (
            <div className="mt-6 rounded-xl bg-surface-secondary p-4">
              <Typography.Paragraph className="text-sm font-semibold">
                Referencia de recepción
              </Typography.Paragraph>
              <Typography.Paragraph className="mt-1 break-all font-mono text-sm">
                {reference}
              </Typography.Paragraph>
              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                onPress={() => void copyReference()}
              >
                <FiCopy aria-hidden="true" className="size-4" />
                Copiar referencia
              </Button>
            </div>
          ) : null}
          <Typography.Paragraph className="mt-3 text-xs leading-6 text-muted">
            Esta referencia no permite consultar información privada ni verifica por sí sola el
            estado de una solicitud. La revisión y activación se gestionan por separado.
          </Typography.Paragraph>
          <Link className="site-button site-button-primary mt-8" href="/">
            Volver al inicio
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
