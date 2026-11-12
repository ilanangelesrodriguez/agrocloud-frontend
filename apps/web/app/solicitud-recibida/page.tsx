import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@heroui/react/card";
import { FiCheckCircle } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Solicitud registrada",
  robots: { index: false, follow: false },
};

export default function RequestSuccessPage() {
  return (
    <section className="site-container flex min-h-[65vh] items-center justify-center py-20">
      <Card className="site-card w-full max-w-xl">
        <Card.Content className="p-8 text-center sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400">
            <FiCheckCircle aria-hidden="true" className="size-8" />
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Solicitud enviada para revisión
          </h1>
          <p className="mt-4 text-sm leading-8 text-muted">
            Si acabas de completar el formulario y recibiste una confirmación, la solicitud fue
            registrada. El siguiente paso depende de su revisión. No es necesario enviar el
            formulario repetidamente.
          </p>
          <p className="mt-3 text-xs leading-6 text-muted">
            Visitar esta URL directamente no verifica el estado de una solicitud.
          </p>
          <Link href="/" className="site-button site-button-primary mt-8">
            Volver al inicio
          </Link>
        </Card.Content>
      </Card>
    </section>
  );
}
