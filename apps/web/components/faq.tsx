"use client";

import { Accordion } from "@heroui/react/accordion";

const faqs = [
  {
    title: "¿La inteligencia artificial emite el dictamen de calidad?",
    body: "No. El análisis de imágenes es una ayuda para la revisión. Los hallazgos requieren validación del inspector y el dictamen corresponde al personal autorizado.",
  },
  {
    title: "¿Qué sucede después de solicitar acceso?",
    body: "La solicitud se registra para revisión. Si es aprobada, el proceso de incorporación y activación continúa a través de la plataforma y sus comunicaciones oficiales.",
  },
  {
    title: "¿Puedo registrar lotes y evidencias por separado?",
    body: "AgroCloud relaciona productores, lotes, recepciones, muestras, inspecciones y evidencias para facilitar su consulta y trazabilidad.",
  },
  {
    title: "¿Los planes y límites son iguales para todas las empresas?",
    body: "Las condiciones, capacidades y precios deben confirmarse con una oferta vigente. La página de planes describe modalidades de acceso, sin publicar cifras no verificadas.",
  },
];

export function Faq() {
  return (
    <Accordion
      className="overflow-hidden rounded-2xl border border-border bg-surface"
      variant="default"
    >
      {faqs.map((item, i) => (
        <Accordion.Item
          id={`faq-${i}`}
          key={item.title}
          className="border-b border-border px-5 last:border-b-0 sm:px-6"
        >
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-foreground">
              {item.title}
              <Accordion.Indicator className="shrink-0 text-accent" />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="pb-5 text-sm leading-7 text-muted">
              {item.body}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
