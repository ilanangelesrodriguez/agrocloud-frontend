"use client";

import Link from "next/link";
import { Accordion } from "@heroui/react/accordion";
import { FiArrowRight, FiHelpCircle } from "react-icons/fi";

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
    <div className="space-y-5">
      <Accordion className="flex flex-col gap-3" variant="default">
        {faqs.map((item, i) => (
          <Accordion.Item
            key={item.title}
            className="rounded-2xl border border-brand-600/20 bg-background px-4 shadow-sm shadow-brand-700/5 after:hidden transition-colors duration-200 hover:border-brand-600/40 data-[expanded]:border-brand-600/50 data-[expanded]:bg-brand-50/60 sm:px-5 dark:data-[expanded]:bg-brand-700/10"
            id={`faq-${i}`}
          >
            <Accordion.Heading>
              <Accordion.Trigger className="flex w-full items-center gap-3 rounded-xl !px-0 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:py-5">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600/10 text-brand-700 dark:bg-brand-700/25 dark:text-brand-400"
                >
                  <FiHelpCircle className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
                  {item.title}
                </span>
                <Accordion.Indicator className="shrink-0 text-accent" />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              {/* pl-11 = ancho del ícono (size-8) + gap-3, para alinear con el título */}
              <Accordion.Body className="pb-5 pl-11 pr-8 text-sm leading-7 text-muted">
                {item.body}
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <p className="text-sm text-muted">
        ¿Tienes otra consulta?{" "}
        <Link
          className="inline-flex items-center gap-1 font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
          href="/solicitar-acceso"
        >
          Solicita acceso y te orientamos
          <FiArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </p>
    </div>
  );
}
