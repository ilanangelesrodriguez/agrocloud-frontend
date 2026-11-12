import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CallToAction } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Planes y acceso",
  description:
    "Conoce las modalidades de incorporación a AgroCloud AI. Condiciones y precios sujetos a una oferta vigente.",
  alternates: { canonical: "/planes" },
};
const features = [
  "Gestión de operaciones por empresa",
  "Usuarios con permisos definidos",
  "Registro de lotes y trazabilidad",
  "Evidencias y control de calidad",
];
export default function PlansPage() {
  return (
    <>
      <PageHero
        eyebrow="Planes y acceso"
        title="Una plataforma que acompaña tu operación"
        description="Explora las modalidades de incorporación a AgroCloud. Las condiciones, capacidades, complementos y precios deben confirmarse en una oferta vigente."
      />
      <section className="site-section">
        <div className="site-container grid max-w-5xl gap-6 md:grid-cols-2">
          <article className="site-card flex flex-col p-7 sm:p-9">
            <span className="mb-5 inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-700/15 dark:text-brand-400">
              Sujeto a evaluación
            </span>
            <h2 className="text-2xl font-semibold">Acceso gratuito</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Modalidad de solicitud empresarial con revisión y aprobación antes de la
              incorporación.
            </p>
            <div className="mt-7 flex-1 space-y-3">
              {[
                "Solicitud empresarial",
                "Evaluación y respuesta de acceso",
                "Activación mediante invitación",
                "Alcance sujeto al plan asignado",
              ].map((f) => (
                <p key={f} className="flex gap-2.5 text-sm text-foreground">
                  <span className="text-accent">✓</span>
                  {f}
                </p>
              ))}
            </div>
            <Link
              href="/solicitar-acceso"
              className="site-button site-button-primary mt-8 w-full justify-center"
            >
              Solicitar acceso
            </Link>
          </article>
          <article className="site-card flex flex-col p-7 sm:p-9">
            <span className="mb-5 inline-flex w-fit rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold text-muted">
              Condiciones a confirmar
            </span>
            <h2 className="text-2xl font-semibold">Plan empresarial</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Para organizaciones que requieren evaluar capacidades, usuarios, lotes y servicios
              adicionales según su operación.
            </p>
            <div className="mt-7 flex-1 space-y-3">
              {features.map((f) => (
                <p key={f} className="flex gap-2.5 text-sm text-foreground">
                  <span className="text-accent">✓</span>
                  {f}
                </p>
              ))}
            </div>
            <Link
              href="/contacto"
              className="site-button site-button-outline mt-8 w-full justify-center"
            >
              Consultar condiciones
            </Link>
          </article>
        </div>
        <div className="site-container mt-8 max-w-5xl">
          <div className="rounded-xl border border-warning/25 bg-warning-soft/35 p-5 text-sm leading-7 text-foreground">
            <strong>Información sobre precios:</strong> esta página no constituye una cotización. La
            disponibilidad de complementos de IA, lotes o usuarios, sus límites y las tarifas deben
            confirmarse antes de contratar. El pago y la gestión de una suscripción se realizarán
            mediante el flujo seguro habilitado por la plataforma.
          </div>
        </div>
      </section>
      <CallToAction
        title="Conversemos sobre tu operación"
        text="Puedes comenzar enviando una solicitud empresarial y compartiendo las necesidades de tu equipo."
        button="Enviar solicitud"
      />
    </>
  );
}
