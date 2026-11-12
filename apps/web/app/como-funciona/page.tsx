import type { Metadata } from "next";
import { PageHero, CallToAction } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Descubre el recorrido del lote agrícola en AgroCloud: registro, recepción, muestreo, inspección, validación y dictamen.",
  alternates: { canonical: "/como-funciona" },
};
const steps = [
  {
    n: "01",
    t: "Identifica el origen",
    d: "Registra los datos del productor y crea el lote asociado.",
  },
  {
    n: "02",
    t: "Confirma la recepción",
    d: "Documenta el ingreso de la carga y el inicio de su recorrido operativo.",
  },
  {
    n: "03",
    t: "Organiza el muestreo",
    d: "Selecciona el procedimiento y registra las muestras que corresponden al lote.",
  },
  {
    n: "04",
    t: "Inspecciona y captura evidencias",
    d: "Relaciona observaciones, fotografías e incidencias con el expediente.",
  },
  {
    n: "05",
    t: "Revisa los resultados asistidos",
    d: "Cuando está disponible, la IA aporta detecciones que el inspector valida o descarta.",
  },
  {
    n: "06",
    t: "Emite el dictamen",
    d: "El personal autorizado revisa el expediente y documenta la decisión de calidad.",
  },
  {
    n: "07",
    t: "Consulta la trazabilidad",
    d: "Accede al historial y los registros vinculados a cada etapa.",
  },
];
export default function WorkflowPage() {
  return (
    <>
      <PageHero
        eyebrow="El proceso AgroCloud"
        title="Un recorrido claro desde el origen hasta la decisión"
        description="Cada etapa se relaciona con el expediente del lote. No necesitas perder el contexto entre registros, evidencias y revisiones."
      />
      <section className="site-section">
        <div className="site-container max-w-4xl">
          <ol className="relative grid gap-4 before:absolute before:bottom-9 before:left-[25px] before:top-9 before:w-px before:bg-border sm:before:left-[31px]">
            {steps.map((step) => (
              <li key={step.n} className="relative flex items-start gap-4 sm:gap-6">
                <div className="relative z-10 grid size-[52px] shrink-0 place-items-center rounded-2xl bg-brand-700 font-mono text-sm font-semibold text-white shadow-lg shadow-brand-700/10 sm:size-16">
                  {step.n}
                </div>
                <div className="site-card mb-3 flex-1 p-5 sm:p-7">
                  <h2 className="text-xl font-semibold">{step.t}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="border-y border-border bg-surface py-12">
        <div className="site-container max-w-4xl rounded-2xl border border-border bg-background p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Roles y responsabilidades</h2>
          <p className="mt-3 text-sm leading-8 text-muted">
            Recepción, inspección, supervisión, producción y administración participan en diferentes
            etapas. La plataforma determina las operaciones disponibles según los permisos del
            usuario y su empresa.
          </p>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
