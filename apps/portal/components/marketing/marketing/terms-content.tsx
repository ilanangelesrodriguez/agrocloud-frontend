"use client";

import { Typography } from "@heroui/react";

import { PageHero } from "@/components/marketing/marketing";

export function TermsContent() {
  return (
    <>
      <PageHero
        description="Aspectos fundamentales del acceso y uso empresarial de AgroCloud AI."
        eyebrow="Información legal"
        title="Condiciones generales del servicio"
      />
      <section className="site-section">
        <div className="site-container max-w-4xl space-y-7">
          <div className="rounded-xl border border-warning/30 bg-warning-soft/35 p-5 text-sm leading-7">
            <strong>Documento provisional:</strong> antes de ofrecer el servicio públicamente se
            deben incorporar la identificación del titular, condiciones comerciales reales,
            responsabilidades, uso permitido, soporte, disponibilidad, cancelación, propiedad
            intelectual, legislación y mecanismo de solución de controversias. Requiere revisión
            legal.
          </div>
          {[
            [
              "Acceso empresarial",
              "El envío de una solicitud no garantiza su aprobación. Las credenciales e invitaciones dependen de las reglas de incorporación y seguridad vigentes del sistema.",
            ],
            [
              "Autorización y permisos",
              "Cada usuario debe utilizar las funciones habilitadas para su empresa y perfil. El backend valida los permisos y límites correspondientes.",
            ],
            [
              "Inteligencia artificial",
              "Los resultados de análisis de imágenes son herramientas de apoyo y requieren revisión humana. No constituyen una garantía de calidad, un diagnóstico definitivo ni una decisión comercial automática.",
            ],
            [
              "Planes y condiciones",
              "Los planes, capacidades, tarifas y servicios adicionales dependen de una oferta vigente y de la suscripción habilitada. La web pública no sustituye un acuerdo comercial aplicable.",
            ],
          ].map(([title, body]) => (
            <section key={title} className="site-card p-6 sm:p-8">
              <Typography.Heading className="text-xl font-semibold" level={2}>
                {title}
              </Typography.Heading>
              <Typography.Paragraph className="mt-3 text-sm leading-8 text-muted">
                {body}
              </Typography.Paragraph>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
