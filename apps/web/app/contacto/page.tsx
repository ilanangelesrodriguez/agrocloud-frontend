import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing";
import { portalLoginUrl } from "@/config/site";
export const metadata: Metadata = {
  title: "Contacto",
  description: "Consulta cómo solicitar acceso empresarial a AgroCloud AI.",
  alternates: { canonical: "/contacto" },
};
export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Cuéntanos cómo trabaja tu empresa"
        description="Si necesitas implementar AgroCloud en tu operación, inicia una solicitud empresarial. Nuestro proceso permite compartir tu información y las necesidades de tu equipo."
      />
      <section className="site-section">
        <div className="site-container grid max-w-5xl gap-6 md:grid-cols-2">
          <article className="site-card p-7 sm:p-9">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Nuevas empresas
            </span>
            <h2 className="mt-4 text-2xl font-semibold">Solicitar acceso</h2>
            <p className="mt-3 min-h-20 text-sm leading-7 text-muted">
              Envía los datos de tu organización y una descripción de su operación. La solicitud se
              registrará para revisión.
            </p>
            <Link href="/solicitar-acceso" className="site-button site-button-primary mt-6">
              Completar solicitud <span aria-hidden="true">↗</span>
            </Link>
          </article>
          <article className="site-card p-7 sm:p-9">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Cuentas existentes
            </span>
            <h2 className="mt-4 text-2xl font-semibold">Acceder al portal</h2>
            <p className="mt-3 min-h-20 text-sm leading-7 text-muted">
              Si ya cuentas con un usuario activo, utiliza el portal empresarial. Las consultas
              sobre cuentas deben gestionarse por los canales que indique tu organización.
            </p>
            {portalLoginUrl ? (
              <a className="site-button site-button-outline mt-6" href={portalLoginUrl}>
                Ir al portal <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <p className="mt-6 text-xs leading-6 text-muted">
                El enlace al portal se habilitará cuando se configure su dirección pública.
              </p>
            )}
          </article>
        </div>
        <p className="site-container mt-7 max-w-5xl text-sm leading-7 text-muted">
          Esta página no ofrece un chat ni un correo de atención configurados. Se recomienda
          publicar los canales oficiales de contacto cuando estén disponibles, sin exponer
          direcciones personales.
        </p>
      </section>
    </>
  );
}
