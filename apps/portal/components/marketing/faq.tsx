"use client";

import Link from "next/link";
import { Accordion } from "@heroui/react/accordion";
import { FiArrowRight, FiHelpCircle } from "react-icons/fi";

import { useOnboardingAvailability } from "@/components/marketing/onboarding-availability";

const faqs = [
  {
    title: "¿La inteligencia artificial emite el dictamen de calidad?",
    body: "No. El análisis de imágenes es una ayuda para la revisión. Los hallazgos requieren validación del inspector y el dictamen corresponde al personal autorizado.",
  },
  {
    title: "¿Qué sucede después de solicitar acceso?",
    body: "La solicitud se registra para revisión. Si se aprueba, el representante recibe una invitación para activar la cuenta de su empresa.",
  },
  {
    title: "¿Puedo registrar lotes y evidencias por separado?",
    body: "AgroCloud relaciona productores, lotes, recepciones, muestras, inspecciones y evidencias para facilitar su consulta y trazabilidad.",
  },
  {
    title: "¿Elegir un plan significa pagar durante el registro?",
    body: "No. Primero se registra y revisa la empresa. Los precios y condiciones vigentes se confirman al decidir contratar desde el portal.",
  },
  {
    title: "¿Los planes y límites son iguales para todas las empresas?",
    body: "No. El acceso gratuito y los planes publicados tienen cupos y vigencias distintos. La página de planes consulta las condiciones disponibles.",
  },
];

export function Faq() {
  const onboardingAvailable = useOnboardingAvailability();

  return (
    <div className="space-y-4">
      <Accordion className="flex flex-col gap-2.5" variant="default">
        {faqs.map((item, i) => (
          <Accordion.Item
            key={item.title}
            className="group rounded-2xl border border-border/90 bg-surface px-4 shadow-none after:hidden transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-brand-600/30 hover:shadow-sm hover:shadow-brand-700/5 data-[expanded]:border-brand-600/45 data-[expanded]:bg-brand-50/40 data-[expanded]:shadow-sm data-[expanded]:shadow-brand-700/5 sm:px-5 dark:data-[expanded]:bg-brand-700/10"
            id={`faq-${i}`}
          >
            <Accordion.Heading>
              <Accordion.Trigger className="flex w-full items-center gap-3 rounded-xl !bg-transparent !px-0 py-3.5 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:py-4">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600/10 text-brand-700 transition-colors duration-200 group-data-[expanded]:bg-brand-700 group-data-[expanded]:text-white dark:bg-brand-700/25 dark:text-brand-400 dark:group-data-[expanded]:text-white"
                >
                  <FiHelpCircle className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
                  {item.title}
                </span>
                <Accordion.Indicator className="shrink-0 text-accent transition-transform duration-200 motion-reduce:transition-none" />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              {/* pl-11 = ancho del ícono (size-8) + gap-3, para alinear con el título */}
              <Accordion.Body className="pb-5 pl-11 pr-6 text-sm leading-7 text-muted">
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
          href={onboardingAvailable ? "/solicitar-acceso" : "/planes"}
        >
          {onboardingAvailable
            ? "Inicia una solicitud empresarial"
            : "Consulta las modalidades de acceso"}
          <FiArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </p>
    </div>
  );
}
