import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing";
import { AccessRequestForm } from "@/features/access-requests/access-request-form";
export const metadata: Metadata = {
  title: "Solicitar acceso empresarial",
  description:
    "Solicita acceso a AgroCloud AI para tu empresa. Registro sujeto a revisión y aprobación.",
  alternates: { canonical: "/solicitar-acceso" },
};
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
          <div className="mb-8 grid gap-4 rounded-2xl border border-border bg-surface p-5 text-sm text-muted sm:grid-cols-3">
            {["1. Envía la solicitud", "2. Espera la revisión", "3. Recibe instrucciones"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  {item}
                </div>
              ),
            )}
          </div>
          <AccessRequestForm />
          <p className="mt-8 text-sm text-muted">
            <Link className="site-text-link" href="/">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
