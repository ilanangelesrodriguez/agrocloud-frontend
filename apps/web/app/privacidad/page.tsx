import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing";
export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Información sobre el tratamiento de datos en solicitudes de acceso de AgroCloud AI.",
  alternates: { canonical: "/privacidad" },
};
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Información legal"
        title="Privacidad y solicitudes empresariales"
        description="Información orientativa sobre los datos que solicita AgroCloud para evaluar nuevas incorporaciones."
      />
      <section className="site-section">
        <div className="site-container max-w-4xl space-y-7">
          <div className="rounded-xl border border-warning/30 bg-warning-soft/35 p-5 text-sm leading-7">
            <strong>Documento provisional.</strong> Antes de publicar o recibir datos de personas
            reales, completa y revisa legalmente esta política: responsable del tratamiento, datos
            de contacto, base legal, destinatarios, transferencias, medidas, plazo de conservación y
            medios para ejercer derechos de protección de datos conforme a la normativa aplicable.
          </div>
          {[
            [
              "Datos solicitados",
              "La solicitud empresarial contiene RUC, razón social, nombre comercial, tipo de empresa, nombre y apellido del representante, correo, teléfono y descripción del uso previsto de la plataforma.",
            ],
            [
              "Finalidad",
              "La información se envía al servicio Identity para registrar y evaluar una solicitud de acceso empresarial. No se utiliza en esta web para un registro automático ni para emitir una aprobación inmediata.",
            ],
            [
              "Envío de la solicitud",
              "Los datos se transmiten desde el formulario web a un endpoint del servidor de Next.js, que reenvía los campos definidos al API Gateway. Este diseño no requiere exponer claves internas al navegador.",
            ],
            [
              "Plazos, terceros y derechos",
              "La política definitiva debe identificar los sistemas y proveedores que intervienen, el tiempo de conservación y un canal verificable para ejercer los derechos aplicables. Estos aspectos aún requieren definición y revisión del responsable.",
            ],
          ].map(([title, body]) => (
            <section key={title} className="site-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-8 text-muted">{body}</p>
            </section>
          ))}
          <p className="text-sm leading-7 text-muted">
            Para comenzar una solicitud, vuelve al{" "}
            <Link href="/solicitar-acceso" className="site-text-link">
              formulario empresarial
            </Link>
            . No introduzcas datos sensibles no solicitados en la descripción de uso.
          </p>
        </div>
      </section>
    </>
  );
}
