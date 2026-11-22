"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RequestSelection } from "../api";
import { Button, Card, toast, Typography } from "@heroui/react";
import { FiCheckCircle, FiCopy } from "react-icons/fi";

type Props = { reference?: string };

export function RequestSuccessContent({ reference }: Props) {
  const [selection, setSelection] = useState<RequestSelection | null>(null);

  useEffect(() => {
    if (!reference) return;
    try {
      const raw = sessionStorage.getItem(`agrocloud:solicitud:${reference}`);
      if (!raw) return;
      const value: unknown = JSON.parse(raw);
      if (value && typeof value === "object" && "type" in value && "name" in value) {
        const data = value as { type: unknown; name: unknown };
        if ((data.type === "FREE" || data.type === "PAID") && typeof data.name === "string") {
          setSelection({ type: data.type, name: data.name });
        }
      }
    } catch {
      // La información opcional del plan puede no estar disponible en otro dispositivo.
    }
  }, [reference]);

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
            <div className="mt-6 rounded-xl border border-border bg-surface-secondary p-4 text-left">
              <p className="text-sm font-semibold">Siguientes pasos</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted">
                <li>El equipo revisará los datos de tu empresa.</li>
                <li>Si se aprueba, recibirás una invitación para activar tu cuenta.</li>
                <li>Podrás ingresar con Gratis o confirmar las condiciones de tu plan elegido.</li>
              </ol>
              {selection ? (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">Modalidad solicitada:</span> {selection.name}
                </p>
              ) : null}
              <p className="mt-2 text-xs leading-6 text-muted">
                Aún no se ha realizado ningún cobro. Las ofertas pagadas se confirman al contratar,
                según su precio y condiciones vigentes.
              </p>
            </div>
          ) : null}
          {reference ? (
            <div className="mt-4 rounded-xl bg-surface-secondary p-4">
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
