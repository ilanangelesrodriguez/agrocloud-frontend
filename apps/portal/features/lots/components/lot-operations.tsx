"use client";

import type { Lot } from "../schema";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { ReceptionForm } from "@/features/receptions/components/reception-form";
import { SamplingForm } from "@/features/samplings/components/sampling-form";
import { Traceability } from "@/features/traceability/components/traceability";
import { InlineNotice, StatusBadge } from "@agrocloud/ui";

export function LotOperations({
  lot,
  stage = "overview",
}: {
  lot: Lot;
  stage?: "overview" | "reception" | "sampling";
}) {
  const { data: actor } = useCurrentUser();
  const reception = lot.recepcion;
  const canReceive =
    lot.estado === "PENDIENTE_RECEPCION" &&
    !reception &&
    actor?.rol?.codigo === "RECEPCION" &&
    canManageCompany(actor, "recepciones.crear");

  return (
    <div className="space-y-5">
      {stage === "reception" ? (
        <section
          id="lot-reception"
          className="scroll-mt-24 space-y-3 rounded-card border border-border bg-surface p-5"
        >
          <h2 className="text-xl font-semibold">Recepción</h2>
          <p className="text-sm leading-relaxed text-muted">
            Confirma el ingreso físico, el documento de traslado y el peso recibido antes de iniciar
            el muestreo.
          </p>
          {reception ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Documento", reception.tipo_documento + " · " + reception.documento],
                ["Transportista", reception.transportista],
                ["Placa", reception.placa],
                ["Peso recibido", reception.peso_recibido_kg + " kg"],
                ["Recibido el", new Date(reception.recibido_en).toLocaleString("es-PE")],
                ["Observaciones", reception.observaciones],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="break-words">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          ) : canReceive ? (
            <ReceptionForm lot={lot} />
          ) : (
            <InlineNotice
              status="warning"
              title="Recepción pendiente"
              description={
                lot.estado === "PENDIENTE_RECEPCION"
                  ? "Una cuenta de recepción autorizada debe confirmar el ingreso del lote para continuar."
                  : "El estado actual del lote no permite registrar una recepción."
              }
            />
          )}
          {reception ? (
            <div className="border-t border-border pt-5">
              <Link
                href={`/lots/${lot.id_lote}/sampling`}
                className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
              >
                Continuar al muestreo
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}
      {stage === "sampling" ? (
        <section
          id="lot-sampling"
          className="scroll-mt-24 space-y-2 rounded-card border border-border bg-surface p-5"
        >
          <h2 className="text-xl font-semibold">Muestreos</h2>
          <p className="text-sm leading-relaxed text-muted">
            Selecciona un procedimiento autorizado y registra una muestra para continuar con la
            inspección de sus frutos.
          </p>
          {lot.muestreos?.length ? (
            <ul className="grid gap-3 pt-3 lg:grid-cols-2">
              {lot.muestreos.map(({ id_muestreo, metodo, tamano_muestra, estado }) => (
                <li key={id_muestreo} className="space-y-3 rounded-xl border border-border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold">Muestreo #{id_muestreo}</h3>
                    {estado ? (
                      <StatusBadge tone="neutral">{estado.replaceAll("_", " ")}</StatusBadge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted">
                    {[metodo, tamano_muestra ? tamano_muestra + " frutos" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {canManageCompany(actor, "muestreos.ver") ? (
                    <Link
                      className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-accent"
                      href={"/samplings/" + id_muestreo}
                    >
                      Abrir muestreo e inspecciones
                    </Link>
                  ) : (
                    <p className="text-sm text-muted">
                      Tu cuenta no tiene permiso para abrir el detalle del muestreo.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : lot.estado === "RECIBIDO" &&
            reception &&
            actor?.rol?.codigo === "INSPECTOR" &&
            canManageCompany(actor, "muestreos.crear") ? (
            <SamplingForm lotId={lot.id_lote} product={lot.producto} productId={lot.producto_id} />
          ) : (
            <InlineNotice
              status="warning"
              title={reception ? "Sin muestreos registrados" : "Completa la recepción primero"}
              description={
                !reception
                  ? "El lote debe contar con una recepción confirmada antes de registrar la muestra."
                  : lot.estado !== "RECIBIDO"
                    ? "El estado actual del lote no permite registrar un muestreo."
                    : "Un inspector con permisos de muestreo debe registrar la muestra de este lote."
              }
            />
          )}
        </section>
      ) : null}
      {stage === "overview" && canManageCompany(actor, "trazabilidad.ver") ? (
        <Traceability id={lot.id_lote} />
      ) : null}
    </div>
  );
}
