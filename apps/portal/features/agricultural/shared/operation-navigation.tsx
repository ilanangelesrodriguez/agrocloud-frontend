import Link from "next/link";

/** Solo enlaza relaciones conocidas; no deduce inspecciones a partir de estados. */
export function OperationNavigation({
  lotId,
  samplingId,
  inspectionId,
  current,
  canReadLot = true,
  canReadSampling = true,
  canReadInspection = true,
}: {
  lotId?: number;
  samplingId?: number;
  inspectionId?: string | number;
  current: "sampling" | "inspection" | "evidence";
  canReadLot?: boolean;
  canReadSampling?: boolean;
  canReadInspection?: boolean;
}) {
  const steps = [
    {
      key: "lot",
      label: "Detalle de lote",
      href: lotId && canReadLot ? `/lots/${lotId}` : undefined,
    },
    {
      key: "reception",
      label: "Recepción",
      href: lotId && canReadLot ? `/lots/${lotId}/reception` : undefined,
    },
    {
      key: "sampling",
      label: "Muestreo",
      href:
        samplingId && canReadSampling
          ? `/samplings/${samplingId}`
          : lotId && canReadLot
            ? `/lots/${lotId}/sampling`
            : undefined,
    },
    {
      key: "inspection",
      label: "Inspección",
      href: inspectionId && canReadInspection ? `/inspections/${inspectionId}` : undefined,
    },
    {
      key: "evidence",
      label: "Evidencias",
      href:
        inspectionId && canReadInspection ? `/inspections/${inspectionId}/evidences` : undefined,
    },
  ];
  return (
    <nav
      aria-label="Etapas del flujo agrícola"
      className="overflow-x-auto rounded-2xl border border-border bg-surface p-3"
    >
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Proceso agrícola
      </p>
      <ol className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
        {steps.map((step, index) => (
          <li key={step.key} className="flex-1">
            {step.href ? (
              <Link
                href={step.href}
                aria-current={current === step.key ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${current === step.key ? "border border-accent/30 bg-accent/5 text-accent" : "border border-transparent text-muted hover:bg-default hover:text-foreground"}`}
              >
                <span
                  aria-hidden="true"
                  className={
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs " +
                    (current === step.key
                      ? "bg-accent text-accent-foreground"
                      : "bg-default text-muted")
                  }
                >
                  {index + 1}
                </span>
                {step.label}
              </Link>
            ) : (
              <span className="flex min-h-11 items-center gap-2 px-3 py-2 text-sm text-muted">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs"
                >
                  {index + 1}
                </span>
                {step.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
