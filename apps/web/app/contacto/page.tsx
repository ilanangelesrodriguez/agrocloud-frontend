import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { FiArrowUpRight, FiLogIn } from "react-icons/fi";

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
          <Card className="site-card h-full">
            <Card.Content className="flex h-full flex-col p-7 sm:p-9">
              <Chip color="accent" variant="soft" size="sm">
                Nuevas empresas
              </Chip>
              <h2 className="mt-4 text-2xl font-semibold">Solicitar acceso</h2>
              <p className="mt-3 min-h-20 text-sm leading-7 text-muted">
                Envía los datos de tu organización y una descripción de su operación. La solicitud
                se registrará para revisión.
              </p>
              <Link href="/solicitar-acceso" className="site-button site-button-primary mt-6">
                Completar solicitud
                <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Card.Content>
          </Card>

          <Card className="site-card h-full">
            <Card.Content className="flex h-full flex-col p-7 sm:p-9">
              <Chip color="accent" variant="soft" size="sm">
                Cuentas existentes
              </Chip>
              <h2 className="mt-4 text-2xl font-semibold">Acceder al portal</h2>
              <p className="mt-3 min-h-20 text-sm leading-7 text-muted">
                Si ya tienes un usuario activo, utiliza el portal empresarial. Las consultas sobre
                cuentas se gestionan por los canales de tu organización.
              </p>
              {portalLoginUrl ? (
                <a href={portalLoginUrl} className="site-button site-button-outline mt-6">
                  Ir al portal
                  <FiLogIn aria-hidden="true" className="size-4" />
                </a>
              ) : (
                <p className="mt-6 text-xs leading-6 text-muted">
                  El enlace al portal se habilitará cuando se configure su dirección pública.
                </p>
              )}
            </Card.Content>
          </Card>
        </div>

        <p className="site-container mt-7 max-w-5xl text-sm leading-7 text-muted">
          Esta página no ofrece un chat ni un correo de atención configurados. Los canales oficiales
          deben publicarse cuando estén disponibles, sin exponer direcciones personales.
        </p>
      </section>
    </>
  );
}
