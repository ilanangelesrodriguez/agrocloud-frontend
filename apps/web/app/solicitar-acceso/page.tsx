import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

import { PageHero } from "@/components/marketing";
import { AccessRequestForm } from "@/features/access-requests/access-request-form";

export const metadata: Metadata = {
  title: "Solicitar acceso empresarial",
  description:
    "Solicita acceso a AgroCloud AI para tu empresa. Registro sujeto a revisión y aprobación.",
  alternates: { canonical: "/solicitar-acceso" },
};

const steps = ["Envía la solicitud", "Espera la revisión", "Recibe instrucciones"];

export default function AccessRequestPage() {
  return (
    <>
      <PageHero
        eyebrow="Acceso empresarial"
        title="Conecta la próxima etapa de tu operación"
        description="Compártenos la información de tu empresa. El equipo responsable revisará la solicitud y continuará el proceso de incorporación cuando corresponda."
      />

      <section className="site-section">
        <div className="site-container max-w-4xl">
          <Card className="mb-8 border border-border bg-surface">
            <Card.Content className="grid gap-4 p-5 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm text-muted">
                  <Chip variant="soft" color="accent" size="sm">
                    {index + 1}
                  </Chip>
                  <FiCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
                  <span>{step}</span>
                </div>
              ))}
            </Card.Content>
          </Card>

          <AccessRequestForm />

          <p className="mt-8 text-sm text-muted">
            <Link className="site-text-link" href="/">
              <FiArrowLeft aria-hidden="true" className="size-4" />
              Volver al inicio
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
